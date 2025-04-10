const express = require('express');
const authController = require('../controllers/auth.controller.js');
const router = express.Router();
const PREFIX = 'auth';

// Public routes
router.post(`/${PREFIX}/login`, authController.login);
router.post(`/${PREFIX}/register`, authController.register);

module.exports = router; 