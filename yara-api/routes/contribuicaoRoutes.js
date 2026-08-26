/**
 * routes/contribuicaoRoutes.js
 */

const express = require('express');
const contribuicaoController = require('../controllers/contribuicaoController');

const router = express.Router();

router.post('/', contribuicaoController.criar);

module.exports = router;
