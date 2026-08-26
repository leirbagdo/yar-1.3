/**
 * routes/authRoutes.js
 */

const express = require('express');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);

module.exports = router;
