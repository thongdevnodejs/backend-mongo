const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

const PREFIX = 'payment';

// PayPal routes
router.post(`/${PREFIX}/paypal/create-order`, authenticate, paymentController.createPayPalOrder);
router.post(`/${PREFIX}/paypal/capture-payment`, authenticate, paymentController.capturePayPalPayment);
router.get(`/${PREFIX}/paypal/order/:orderId`, authenticate, paymentController.getPayPalOrderDetails);
router.post(`/${PREFIX}/paypal/webhook`, paymentController.handlePayPalWebhook);

module.exports = router;
