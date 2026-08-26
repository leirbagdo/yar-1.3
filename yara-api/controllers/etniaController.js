/**
 * controllers/etniaController.js
 */

const etniaService = require('../services/etniaService');

const etniaController = {
    async listar(req, res, next) {
        try {
            const etnias = await etniaService.listar();
            res.json({ success: true, data: etnias });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = etniaController;
