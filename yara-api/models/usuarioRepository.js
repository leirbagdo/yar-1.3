/**
 * models/usuarioRepository.js
 *
 * Acesso a dados da tabela `usuarios`, com fallback em JSON (users.json)
 * para ambientes sem MySQL configurado — comportamento já existente,
 * apenas isolado em uma camada própria.
 */

const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const USERS_FILE = path.join(__dirname, '..', 'users.json');

function readUsersJSON() {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function saveUsersJSON(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

const usuarioRepository = {
    async findByEmail(email) {
        try {
            const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
            if (rows.length > 0) return { origem: 'mysql', usuario: rows[0] };
        } catch (err) {
            console.error('MySQL usuarioRepository.findByEmail:', err.message, '— usando fallback JSON');
        }

        const usuarios = readUsersJSON();
        const usuario = usuarios.find((u) => u.email === email);
        return usuario ? { origem: 'json', usuario } : null;
    },

    async create({ nome, email, senhaHash }) {
        try {
            const [existe] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
            if (existe.length > 0) return { ok: false, motivo: 'duplicado' };

            await pool.execute(
                'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
                [nome, email, senhaHash]
            );
            return { ok: true, origem: 'mysql' };
        } catch (err) {
            console.error('MySQL usuarioRepository.create:', err.message, '— usando fallback JSON');
        }

        const usuarios = readUsersJSON();
        if (usuarios.find((u) => u.email === email)) return { ok: false, motivo: 'duplicado' };

        usuarios.push({ id: Date.now(), nome, email, senha: senhaHash, role: 'user' });
        saveUsersJSON(usuarios);
        return { ok: true, origem: 'json' };
    },
};

module.exports = usuarioRepository;
