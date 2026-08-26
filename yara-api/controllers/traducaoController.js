/**
 * controllers/traducaoController.js
 */

const traducaoService = require('../services/traducaoService');

const traducaoController = {
    traduzir(req, res, next) {
        try {
            const resultado = traducaoService.traduzir(req.body);
            res.json({ success: true, ...resultado });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = traducaoController;
