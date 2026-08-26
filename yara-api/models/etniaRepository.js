/**
 * models/etniaRepository.js
 */

const pool = require('../config/db');

const etniaRepository = {
    async findAll() {
        const [rows] = await pool.execute('SELECT * FROM etnias ORDER BY nome');
        return rows;
    },
};

module.exports = etniaRepository;
