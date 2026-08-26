/**
 * routes/depoimentoRoutes.js
 */

const express = require('express');
const depoimentoController = require('../controllers/depoimentoController');
const { autenticar, apenasAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', depoimentoController.listar);
router.post('/', depoimentoController.criar);
router.patch('/:id/status', autenticar, apenasAdmin, depoimentoController.moderar);

module.exports = router;
