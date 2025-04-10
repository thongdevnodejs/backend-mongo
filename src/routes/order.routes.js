const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller.js');
const { authenticate } = require('../middleware/auth.middleware.js');

const PREFIX = 'order';

// Apply authentication middleware to all order routes
router.use(authenticate);

router.get(`/${PREFIX}`, orderController.get);
router.post(`/${PREFIX}`, orderController.create);

module.exports = router; 