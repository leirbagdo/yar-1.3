/**
 * middlewares/rateLimiter.js
 *
 * Limita tentativas de login/cadastro para mitigar brute force.
 * (Antes definido inline em index.js.)
 */

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20,
    message: { success: false, message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter };
