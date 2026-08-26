/**
 * index.js
 *
 * Ponto de entrada do processo. Toda a lógica de montagem do Express
 * vive em app.js — este arquivo só sobe o servidor HTTP, e apenas
 * quando executado diretamente (não quando importado pelos testes).
 */

const app = require('./app');
const env = require('./config/env');

if (require.main === module) {
    app.listen(env.PORT, () => {
        console.log(`🌿 Yara API rodando em http://localhost:${env.PORT}`);
    });
}

module.exports = app;
