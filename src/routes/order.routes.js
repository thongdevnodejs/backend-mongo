const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller.js');
const webhookController = require('../controllers/webhook.controller.js');
const { authenticate } = require('../middleware/auth.middleware.js');

const PREFIX = 'orders';
router.post(`/${PREFIX}/verify-payment`, authenticate, webhookController.verifyPayment);

// Public routes (admin only in production)
router.get(`/${PREFIX}`, authenticate, orderController.getOrders);
router.get(`/${PREFIX}/stats`, authenticate, orderController.getStats);
router.get(`/${PREFIX}/user`, authenticate, orderController.getUserOrders);
router.get(`/${PREFIX}/:id`, authenticate, orderController.getOrderById);

// Protected routes
router.post(`/${PREFIX}`, authenticate, orderController.create);
router.put(`/${PREFIX}/:id/status`, authenticate, orderController.updateStatus);
router.put(`/${PREFIX}/:id/cancel`, authenticate, orderController.cancelOrder);
router.put(`/${PREFIX}/:id/tracking`, authenticate, orderController.updateTracking);

module.exports = router;