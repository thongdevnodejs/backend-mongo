const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller.js');
const { authenticate } = require('../middleware/auth.middleware.js');

const PREFIX = 'category';

// Public routes
router.get(`/${PREFIX}`, categoryController.get);
router.post(`/${PREFIX}`, authenticate, categoryController.create);

module.exports = router;