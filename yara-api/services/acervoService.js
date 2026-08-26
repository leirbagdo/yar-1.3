/**
 * services/acervoService.js
 *
 * Regras de negócio do acervo digital (Parte 2/5): validação de campos,
 * montagem do caminho público do arquivo e remoção física ao excluir.
 */

const fs = require('fs');
const path = require('path');
const acervoRepository = require('../models/acervoRepository');
const { UPLOAD_PATH } = require('../config/upload');

const TIPOS_VALIDOS = ['documento', 'audio', 'video', 'imagem', 'outro'];

function inferirTipoPorMime(mimetype) {
    if (!mimetype) return 'outro';
    if (mimetype === 'application/pdf' || mimetype.includes('word')) return 'documento';
    if (mimetype.startsWith('image/')) return 'imagem';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.startsWith('video/')) return 'video';
    return 'outro';
}

function validarCamposObrigatorios({ titulo }) {
    if (!titulo?.trim()) {
        const erro = new Error('O título é obrigatório');
        erro.status = 400;
        throw erro;
    }
}

const acervoService = {
    async listar() {
        return acervoRepository.findAll();
    },

    async buscarPorId(id) {
        const item = await acervoRepository.findById(id);
        if (!item) {
            const erro = new Error('Item do acervo não encontrado');
            erro.status = 404;
            throw erro;
        }
        return item;
    },

    async criar(dados, arquivo, usuarioId) {
        validarCamposObrigatorios(dados);

        const payload = {
            ...dados,
            tipo: TIPOS_VALIDOS.includes(dados.tipo) ? dados.tipo : inferirTipoPorMime(arquivo?.mimetype),
            arquivo: arquivo ? `/uploads/${arquivo.filename}` : null,
            tamanho: arquivo ? arquivo.size : null,
            usuario_id: usuarioId || null,
        };

        const id = await acervoRepository.create(payload);
        return acervoService.buscarPorId(id);
    },

    async atualizar(id, dados, arquivo) {
        validarCamposObrigatorios(dados);
        const existente = await acervoService.buscarPorId(id);

        // Se um novo arquivo foi enviado, o antigo é removido do disco
        if (arquivo && existente.arquivo) {
            const caminhoAntigo = path.join(UPLOAD_PATH, path.basename(existente.arquivo));
            fs.unlink(caminhoAntigo, () => {}); // best-effort, não bloqueia a resposta
        }

        const payload = {
            ...dados,
            tipo: TIPOS_VALIDOS.includes(dados.tipo) ? dados.tipo : existente.tipo,
            arquivo: arquivo ? `/uploads/${arquivo.filename}` : null,
            tamanho: arquivo ? arquivo.size : null,
        };

        await acervoRepository.update(id, payload);
        return acervoService.buscarPorId(id);
    },

    async excluir(id) {
        const existente = await acervoService.buscarPorId(id);

        if (existente.arquivo) {
            const caminhoArquivo = path.join(UPLOAD_PATH, path.basename(existente.arquivo));
            fs.unlink(caminhoArquivo, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Falha ao remover arquivo físico:', err.message);
                }
            });
        }

        await acervoRepository.remove(id);
    },
};

module.exports = acervoService;
