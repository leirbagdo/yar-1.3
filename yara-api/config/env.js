/**
 * config/env.js
 *
 * Ponto único de leitura das variáveis de ambiente.
 * Antes cada arquivo lia `process.env.X` diretamente e duplicava os
 * valores-padrão (ex.: PORT aparecia em index.js e em outros pontos).
 * Centralizar aqui evita divergências e facilita testes.
 */

require('dotenv').config();

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 8080,

    JWT_SECRET: process.env.JWT_SECRET || 'yara_secret_dev',
    JWT_EXPIRES_IN: '8h',

    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),

    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASS: process.env.DB_PASS || '',
    DB_NAME: process.env.DB_NAME || 'yara_db',
    DB_PORT: Number(process.env.DB_PORT) || 3307,

    SALT_ROUNDS: 10,

    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    MAX_UPLOAD_SIZE_MB: Number(process.env.MAX_UPLOAD_SIZE_MB) || 25,
};

module.exports = env;
