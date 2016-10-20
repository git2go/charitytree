const express = require('express');
const router = express.Router();
const AuthController = require('../controllers').AuthController
const OrgController = require('../controllers').OrgController
const DonorController = require('../controllers').DonorController
const ProjectController = require('../controllers').ProjectController
const multer = require('multer');

// AUTH ROUTES
router.post('/auth/signup', AuthController.signup);
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);

// ORG ROUTES
router.get('/org/:id', OrgController.getInfo);
router.put('/org/profile', OrgController.updateProfile);
router.put('/org/profileImg/upload', multer().single('profile_img'), OrgController.updateProfile);
router.get('/org/profileImg', OrgController.getProfileImg)
router.post('/org/media/upload', multer().array('media'), OrgController.uploadMedia)

// DONOR ROUTES
router.post('/donor/follow/:orgId', DonorController.follow)
router.put('/donor/profile', DonorController.updateProfile)
router.post('/donor/endorse/:orgId', DonorController.endorse)

// PROJECT ROUTES
router.post('/project/create', ProjectController.create)
router.post('/project/:id/media/upload', multer().array('media'), ProjectController.uploadMedia)
router.put('/project/:id/needs/update', ProjectController.updateNeeds)

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
router.get('*', function (req, res, next) {
    return res.sendFile(path.join(__dirname, '../../client/index.html'));
});

module.exports = router
