const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth')
const middleware = require('../config/middleware')

// AUTH ROUTES
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/logout', middleware.verifyCredentials, AuthController.logout);


module.exports = router
