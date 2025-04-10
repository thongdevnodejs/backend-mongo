const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller.js');
const { authenticate } = require('../middleware/auth.middleware.js');

const PREFIX = 'cart';

// Apply authentication middleware to all cart routes
router.use(authenticate);

// Cart routes
router.post(`/${PREFIX}`, cartController.add);
router.delete(`/${PREFIX}`, cartController.remove);
router.put(`/${PREFIX}`, cartController.update);
router.get(`/${PREFIX}`, cartController.getByUserId);

module.exports = router;