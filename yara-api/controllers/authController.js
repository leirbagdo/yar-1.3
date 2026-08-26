/**
 * controllers/authController.js
 */

const authService = require('../services/authService');

const authController = {
    async signup(req, res, next) {
        try {
            await authService.cadastrar(req.body);
            res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!' });
        } catch (err) {
            next(err);
        }
    },

    async login(req, res, next) {
        try {
            const resultado = await authService.autenticar(req.body);
            res.json({ success: true, ...resultado });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = authController;
