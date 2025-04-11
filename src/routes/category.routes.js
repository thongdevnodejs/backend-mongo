const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller.js');
const { authenticate } = require('../middleware/auth.middleware.js');

const PREFIX = 'category';

// Public routes
router.get(`/${PREFIX}`, categoryController.get);
router.get(`/${PREFIX}/:id`, categoryController.getById);

// Protected routes (require authentication)
router.post(`/${PREFIX}`, authenticate, categoryController.create);
router.put(`/${PREFIX}/:id`, authenticate, categoryController.update);
router.delete(`/${PREFIX}/:id`, authenticate, categoryController.delete);

module.exports = router;