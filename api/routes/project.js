const express = require('express')
const router = express.Router()
const ProjectController = require('../controllers/project')
const middleware = require('../config/middleware')
const multer = require('multer')


// PROJECT ROUTES
router.use(middleware.verifyCredentials)

router.post('/create', ProjectController.create)
router.post('/:id/media/upload', multer().array('media'), ProjectController.uploadMedia)
router.put('/:id/needs/update', ProjectController.updateNeeds)
router.get('/media/:id', ProjectController.getMedia)

module.exports = router;
