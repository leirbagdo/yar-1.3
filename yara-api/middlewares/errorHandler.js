/**
 * middlewares/errorHandler.js
 *
 * Middleware global de erros — precisa ser o ÚLTIMO `app.use()` registrado.
 * Garante que nenhum stack trace ou detalhe interno vaze para o cliente.
 */

const multer = require('multer');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    console.error('[ERRO INTERNO]', err.message);

    if (err instanceof multer.MulterError || /Tipo de arquivo não suportado/.test(err.message)) {
        return res.status(400).json({ success: false, message: err.message });
    }

    const status = err.status || 500;
    return res.status(status).json({
        success: false,
        message: status === 500 ? 'Erro interno do servidor' : err.message,
    });
}

function notFoundHandler(req, res) {
    res.status(404).json({ success: false, message: 'Rota não encontrada' });
}

module.exports = { errorHandler, notFoundHandler };
