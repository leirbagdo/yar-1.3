/**
 * services/depoimentoService.js
 */

const depoimentoRepository = require('../models/depoimentoRepository');

function erroValidacao(mensagem) {
    const erro = new Error(mensagem);
    erro.status = 400;
    return erro;
}

const depoimentoService = {
    async listarAprovados() {
        return depoimentoRepository.findAprovados();
    },

    async criar({ autor, texto, etnia }) {
        if (!autor?.trim() || !texto?.trim()) {
            throw erroValidacao('autor e texto são obrigatórios');
        }
        await depoimentoRepository.create({ autor: autor.trim(), texto: texto.trim(), etnia });
    },

    async moderar(id, status) {
        if (!['aprovado', 'rejeitado'].includes(status)) {
            throw erroValidacao("status deve ser 'aprovado' ou 'rejeitado'");
        }
        await depoimentoRepository.updateStatus(id, status);
    },
};

module.exports = depoimentoService;
