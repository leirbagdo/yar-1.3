/**
 * models/depoimentoRepository.js
 */

const pool = require('../config/db');

const depoimentoRepository = {
    async findAprovados() {
        const [rows] = await pool.execute(
            "SELECT * FROM depoimentos WHERE status='aprovado' ORDER BY created_at DESC"
        );
        return rows;
    },

    async create({ autor, texto, etnia }) {
        await pool.execute(
            "INSERT INTO depoimentos (autor, texto, etnia, status) VALUES (?, ?, ?, 'pendente')",
            [autor, texto, etnia || null]
        );
    },

    async updateStatus(id, status) {
        await pool.execute('UPDATE depoimentos SET status = ? WHERE id = ?', [status, id]);
    },
};

module.exports = depoimentoRepository;
