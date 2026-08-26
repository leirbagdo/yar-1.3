/**
 * services/contribuicaoService.js
 */

const contribuicaoRepository = require('../models/contribuicaoRepository');

const contribuicaoService = {
    async criar({ nome, email, tipo, descricao }) {
        if (!nome?.trim() || !descricao?.trim()) {
            const erro = new Error('nome e descricao são obrigatórios');
            erro.status = 400;
            throw erro;
        }
        await contribuicaoRepository.create({
            nome: nome.trim(), email: email?.trim(), tipo, descricao: descricao.trim(),
        });
    },
};

module.exports = contribuicaoService;
