/**
 * controllers/depoimentoController.js
 */

const depoimentoService = require('../services/depoimentoService');

const depoimentoController = {
    async listar(req, res, next) {
        try {
            const depoimentos = await depoimentoService.listarAprovados();
            res.json({ success: true, data: depoimentos });
        } catch (err) {
            next(err);
        }
    },

    async criar(req, res, next) {
        try {
            await depoimentoService.criar(req.body);
            res.status(201).json({ success: true, message: 'Depoimento enviado para moderação' });
        } catch (err) {
            next(err);
        }
    },

    async moderar(req, res, next) {
        try {
            await depoimentoService.moderar(req.params.id, req.body.status);
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = depoimentoController;
