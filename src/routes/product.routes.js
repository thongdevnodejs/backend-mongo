const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');
const { authenticate } = require('../middleware/auth.middleware');

const PREFIX = 'products';

router.get(`/${PREFIX}`, productController.get);
router.get(`/${PREFIX}/:id`, productController.getById);
router.post(`/${PREFIX}`, authenticate, productController.createProduct);
router.put(`/${PREFIX}/:id`, authenticate, productController.updateProduct);
router.delete(`/${PREFIX}/:id`, authenticate, productController.deleteProduct);

module.exports = router;