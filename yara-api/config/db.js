/**
 * config/db.js
 *
 * Pool de conexões MySQL.
 * (Antes vivia em /database.js na raiz — movido para config/ para seguir
 * a convenção MVC pedida na Sprint 04 / refatoração estrutural.)
 */

const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    port: env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Testa a conexão uma vez na subida do processo, sem derrubar o servidor
// caso o MySQL esteja indisponível — a API cai para o fallback em JSON.
pool.getConnection()
    .then((conn) => {
        console.log('✅ MySQL conectado —', env.DB_NAME);
        conn.release();
    })
    .catch((err) => {
        console.error('❌ MySQL indisponível:', err.message);
        console.warn('⚠️  API funcionará com fallback em JSON, onde aplicável.');
    });

module.exports = pool;
