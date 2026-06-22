/**
 * database.js
 *
 * SPRINT 01 — Variáveis de ambiente
 * ERRO ORIGINAL: credenciais do banco escritas diretamente no código
 * (host, user, password, database hard-coded).
 *
 * Correção: todas as configurações sensíveis vêm do arquivo .env via dotenv.
 * O .env NUNCA deve ser commitado no git (adicionar ao .gitignore).
 *
 * Exemplo de .env:
 *   DB_HOST=localhost
 *   DB_USER=root
 *   DB_PASS=
 *   DB_NAME=yara_db
 *   DB_PORT=3307
 *   JWT_SECRET=mude_isto_em_producao
 *   ALLOWED_ORIGINS=http://localhost:5173
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host             : process.env.DB_HOST || 'localhost',
    user             : process.env.DB_USER || 'root',
    password         : process.env.DB_PASS || '',
    database         : process.env.DB_NAME || 'yara_db',
    port             : Number(process.env.DB_PORT) || 3307,
    waitForConnections: true,
    connectionLimit  : 10,
    queueLimit       : 0
});

pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL conectado —', process.env.DB_NAME || 'yara_db');
        conn.release();
    })
    .catch(err => {
        // Avisa mas não derruba o processo — o fallback JSON funciona
        console.error('❌ MySQL indisponível:', err.message);
        console.warn('⚠️  API funcionará com fallback JSON.');
    });

module.exports = pool;
