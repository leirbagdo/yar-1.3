/**
 * routes/etniaRoutes.js
 */

const express = require('express');
const etniaController = require('../controllers/etniaController');

const router = express.Router();

router.get('/', etniaController.listar);

module.exports = router;
