/**
 * controllers/acervoController.js
 *
 * Camada HTTP do acervo digital: só traduz request/response.
 * Toda regra de negócio está em services/acervoService.js.
 */

const acervoService = require('../services/acervoService');

const acervoController = {
    async listar(req, res, next) {
        try {
            const itens = await acervoService.listar();
            res.json({ success: true, data: itens });
        } catch (err) {
            next(err);
        }
    },

    async buscarPorId(req, res, next) {
        try {
            const item = await acervoService.buscarPorId(req.params.id);
            res.json({ success: true, data: item });
        } catch (err) {
            next(err);
        }
    },

    async criar(req, res, next) {
        try {
            const item = await acervoService.criar(req.body, req.file, req.usuario?.id);
            res.status(201).json({ success: true, data: item, message: 'Item cadastrado com sucesso' });
        } catch (err) {
            next(err);
        }
    },

    async atualizar(req, res, next) {
        try {
            const item = await acervoService.atualizar(req.params.id, req.body, req.file);
            res.json({ success: true, data: item, message: 'Item atualizado com sucesso' });
        } catch (err) {
            next(err);
        }
    },

    async excluir(req, res, next) {
        try {
            await acervoService.excluir(req.params.id);
            res.json({ success: true, message: 'Item removido com sucesso' });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = acervoController;
