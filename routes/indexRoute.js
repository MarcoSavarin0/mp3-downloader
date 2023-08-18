const express = require('express')
const router = express.Router();
const controller = require('../controller/indexController')
router.get('/',controller.index)
router.post('/converter-mp3', controller.converterMp3)

module.exports = router