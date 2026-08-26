/**
 * models/contribuicaoRepository.js
 */

const pool = require('../config/db');

const contribuicaoRepository = {
    async create({ nome, email, tipo, descricao }) {
        await pool.execute(
            'INSERT INTO contribuicoes (nome, email, tipo, descricao) VALUES (?, ?, ?, ?)',
            [nome, email || null, tipo || 'outro', descricao]
        );
    },
};

module.exports = contribuicaoRepository;
