const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const { authenticate } = require('../middleware/auth.middleware');

const PREFIX = 'webhook';

// PayPal webhook endpoint (no authentication required as it's called by PayPal)
// router.post(`/${PREFIX}/paypal`, webhookController.handlePayPalWebhook);

// Payment verification endpoint (requires authentication)
router.post(`/orders/verify-payment`, authenticate, webhookController.verifyPayment);

module.exports = router;
