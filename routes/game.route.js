const express = require('express'),
    router = express.Router(),
    controller = require('../controllers/game.controller')

router.route('/')
    .get()
    .post(controller.processGuess)

router.route('/daily-word')
    .post(controller.updateDailyWord)

module.exports = router;