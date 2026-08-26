/**
 * middlewares/auth.js
 *
 * Middlewares de autenticação/autorização via JWT.
 * (Antes definidos dentro de index.js — extraídos para reuso em todas
 * as rotas protegidas, conforme Parte 5 do pedido de refatoração.)
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function autenticar(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token não informado' });
    }
    try {
        req.usuario = jwt.verify(auth.slice(7), env.JWT_SECRET);
        return next();
    } catch {
        return res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
    }
}

function apenasAdmin(req, res, next) {
    if (req.usuario?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acesso restrito a administradores' });
    }
    return next();
}

module.exports = { autenticar, apenasAdmin };
