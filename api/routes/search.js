const express = require('express')
const router = express.Router();

const SearchController = require('../controllers/search')

router.get('/', SearchController.locate);

module.exports = router
