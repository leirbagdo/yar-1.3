/**
 * controllers/contribuicaoController.js
 */

const contribuicaoService = require('../services/contribuicaoService');

const contribuicaoController = {
    async criar(req, res, next) {
        try {
            await contribuicaoService.criar(req.body);
            res.status(201).json({ success: true, message: 'Contribuição recebida, obrigado!' });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = contribuicaoController;
