const express = require('express');
const userController = require('../controllers/user.controller.js');
const { authenticate } = require('../middleware/auth.middleware.js');
const router = express.Router();

const PREFIX = 'user';
router.get(`/${PREFIX}/profile`, authenticate, userController.getProfile);

router.get(`/${PREFIX}/:email`, authenticate, userController.getByEmail);
router.post(`/${PREFIX}`, authenticate, userController.create);
router.put(`/${PREFIX}/profile`, authenticate, userController.updateProfile);


module.exports = router;