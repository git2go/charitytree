const express = require('express');
const router = express.Router();
const middleware = require('../config/middleware')
const OrgController = require('../controllers/organization')
const multer = require('multer');

// ORG ROUTES
router.use(middleware.verifyCredentials)

router.get('/:id', OrgController.getInfo);
router.put('/profile', OrgController.updateProfile);
router.get('/profileImg', OrgController.getProfileImg)
router.put('/profileImg/upload', multer().single('profile_img'), OrgController.updateProfile);
router.get('/media/:id', OrgController.getMedia)
router.post('/media/upload', multer().array('media'), OrgController.uploadMedia)
router.get('/projects', OrgController.projects)

module.exports = router;
