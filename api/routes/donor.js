"use strict";

const express = require('express');
const router = express.Router();
const DonorController = require('../controllers/donor')
const middleware = require('../config/middleware')


// DONOR ROUTES
router.use(middleware.verifyCredentials)

router.post('/follow/:orgId', DonorController.follow)
router.put('/profile', DonorController.updateProfile)
router.post('/endorse/:orgId', DonorController.endorse)
router.get('/dashboardData', DonorController.dashboardData)

module.exports = router
