const express = require('express')
const router = express.Router(),
    controller = require('../controllers/player.controller');


router.route('/execute-outside')
    .post(controller.outsideExecution)


module.exports = router;