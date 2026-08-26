/**
 * routes/traducaoRoutes.js
 */

const express = require('express');
const traducaoController = require('../controllers/traducaoController');

const router = express.Router();

router.post('/', traducaoController.traduzir);

module.exports = router;
