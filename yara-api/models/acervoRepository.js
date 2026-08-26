/**
 * models/acervoRepository.js
 *
 * Acesso a dados da tabela `acervo`. Nenhuma rota ou controller deve
 * montar SQL diretamente — toda query passa por aqui (Parte 5/6).
 *
 * FALLBACK EM JSON (acervo.json): se o MySQL estiver indisponível
 * (ou a tabela `acervo` não existir ainda), cada operação cai para um
 * arquivo local em vez de falhar. Isso garante duas coisas pedidas
 * explicitamente:
 *   1. GET /api/acervo nunca quebra a Biblioteca — na pior das
 *      hipóteses ela mostra uma lista vazia, nunca um erro de rede.
 *   2. Um upload feito sem o banco conectado não se perde: o arquivo
 *      físico (salvo pelo multer em /uploads) continua existindo, e
 *      o registro dele fica guardado em acervo.json até o banco
 *      voltar. Segue o mesmo padrão já usado em usuarioRepository.js
 *      para login/cadastro.
 */

const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const ACERVO_FILE = path.join(__dirname, '..', 'acervo.json');

function readAcervoJSON() {
    try {
        return JSON.parse(fs.readFileSync(ACERVO_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function saveAcervoJSON(lista) {
    fs.writeFileSync(ACERVO_FILE, JSON.stringify(lista, null, 2));
}

function ordenarPorData(lista) {
    return [...lista].sort((a, b) => new Date(b.data_upload) - new Date(a.data_upload));
}

const acervoRepository = {
    async findAll() {
        let itensMysql = [];
        let mysqlOk = false;

        try {
            const [rows] = await pool.execute('SELECT * FROM acervo ORDER BY data_upload DESC');
            itensMysql = rows;
            mysqlOk = true;
        } catch (err) {
            console.error('MySQL acervoRepository.findAll:', err.message, '— usando fallback em acervo.json');
        }

        // Itens salvos no fallback aparecem sempre, mesmo com o MySQL
        // ativo (ex.: foram criados enquanto o banco estava fora).
        const itensJSON = readAcervoJSON();
        return ordenarPorData(mysqlOk ? [...itensJSON, ...itensMysql] : itensJSON);
    },

    async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM acervo WHERE id = ?', [id]);
            if (rows[0]) return rows[0];
        } catch (err) {
            console.error('MySQL acervoRepository.findById:', err.message, '— tentando fallback em acervo.json');
        }

        const itensJSON = readAcervoJSON();
        return itensJSON.find((item) => String(item.id) === String(id)) || null;
    },

    async create(item) {
        const {
            titulo, descricao, idioma, povo, categoria,
            autor, arquivo, tipo, tamanho, usuario_id,
        } = item;

        try {
            const [result] = await pool.execute(
                `INSERT INTO acervo
                    (titulo, descricao, idioma, povo, categoria, autor, arquivo, tipo, tamanho, usuario_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    titulo, descricao || null, idioma || null, povo || null,
                    categoria || null, autor || null, arquivo || null,
                    tipo || 'outro', tamanho || null, usuario_id || null,
                ]
            );
            return result.insertId;
        } catch (err) {
            console.error('MySQL acervoRepository.create:', err.message, '— salvando no fallback acervo.json');
        }

        // Fallback: o arquivo físico já foi salvo em /uploads pelo multer
        // antes de chegar aqui — só o registro precisa de um lugar para
        // não se perder até o banco voltar.
        const itensJSON = readAcervoJSON();
        const novoId = Date.now();
        itensJSON.push({
            id: novoId,
            titulo,
            descricao: descricao || null,
            idioma: idioma || null,
            povo: povo || null,
            categoria: categoria || null,
            autor: autor || null,
            arquivo: arquivo || null,
            tipo: tipo || 'outro',
            tamanho: tamanho || null,
            usuario_id: usuario_id || null,
            data_upload: new Date().toISOString(),
        });
        saveAcervoJSON(itensJSON);
        return novoId;
    },

    async update(id, item) {
        const {
            titulo, descricao, idioma, povo, categoria,
            autor, arquivo, tipo, tamanho,
        } = item;

        try {
            const [result] = await pool.execute(
                `UPDATE acervo SET
                    titulo = ?, descricao = ?, idioma = ?, povo = ?, categoria = ?,
                    autor = ?, arquivo = COALESCE(?, arquivo), tipo = ?, tamanho = COALESCE(?, tamanho)
                 WHERE id = ?`,
                [
                    titulo, descricao || null, idioma || null, povo || null,
                    categoria || null, autor || null, arquivo || null,
                    tipo || 'outro', tamanho || null, id,
                ]
            );
            if (result.affectedRows > 0) return;
        } catch (err) {
            console.error('MySQL acervoRepository.update:', err.message, '— tentando fallback em acervo.json');
        }

        const itensJSON = readAcervoJSON();
        const indice = itensJSON.findIndex((i) => String(i.id) === String(id));
        if (indice >= 0) {
            itensJSON[indice] = {
                ...itensJSON[indice],
                titulo, descricao: descricao || null, idioma: idioma || null,
                povo: povo || null, categoria: categoria || null, autor: autor || null,
                tipo: tipo || itensJSON[indice].tipo,
                arquivo: arquivo || itensJSON[indice].arquivo,
                tamanho: tamanho || itensJSON[indice].tamanho,
            };
            saveAcervoJSON(itensJSON);
        }
    },

    async remove(id) {
        try {
            const [result] = await pool.execute('DELETE FROM acervo WHERE id = ?', [id]);
            if (result.affectedRows > 0) return;
        } catch (err) {
            console.error('MySQL acervoRepository.remove:', err.message, '— tentando fallback em acervo.json');
        }

        const itensJSON = readAcervoJSON();
        const restantes = itensJSON.filter((i) => String(i.id) !== String(id));
        if (restantes.length !== itensJSON.length) saveAcervoJSON(restantes);
    },
};

module.exports = acervoRepository;
