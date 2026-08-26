/**
 * app.js
 *
 * Monta o app Express: middlewares globais, arquivos estáticos de
 * upload, rotas e o handler de erro (sempre por último).
 *
 * Extraído de index.js para que os testes (index.test.js) possam
 * importar o app sem precisar chamar app.listen() — correção de um
 * problema real: antes o app.listen() rodava incondicionalmente ao
 * importar o módulo, e o app nunca era exportado, então os testes
 * automatizados descritos em index.test.js não tinham como funcionar.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const env = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// ─── CORS restrito à whitelist do front-end ───────────────────
app.use(cors({
    origin: (origin, callback) => {
        // Permite chamadas sem origin (Postman, curl) apenas em dev
        if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS: origem não permitida — ${origin}`));
    },
    credentials: true,
}));

app.use(express.json());

// ─── Arquivos enviados pelo acervo ficam publicamente acessíveis ──
app.use('/uploads', express.static(path.join(__dirname, env.UPLOAD_DIR)));

// ─── Rotas da API ──────────────────────────────────────────────
app.use('/', routes);

// ─── 404 e erros (sempre por último) ──────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
