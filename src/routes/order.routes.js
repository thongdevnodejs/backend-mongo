const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller.js');
const { authenticate } = require('../middleware/auth.middleware.js');

const PREFIX = 'orders';

// Áp dụng middleware xác thực cho tất cả các routes
router.use(`/${PREFIX}`, authenticate);

// Routes cho cả user và admin
router.get(`/${PREFIX}`, orderController.getOrders);
router.get(`/${PREFIX}/:id`, orderController.getOrderById);
router.post(`/${PREFIX}`, orderController.create);

// Route chỉ dành cho admin
router.put(`/${PREFIX}/:id/status`, orderController.updateStatus);

module.exports = router;