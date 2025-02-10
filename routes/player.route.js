const express = require('express')
const router = express.Router(),
    controller = require('../controllers/player.controller');

router.route('/deploy-account')
    .post(controller.registerPlayer)

router.route('/execute-outside')
    .post(controller.outsideExecution)

router.route('/:telegramId')
    .get(controller.getUser)

router.route('/username/:tg_id')
    .get(controller.getUserByTgId)

router.route('/claim-points/:tg_id')
    .post(controller.cliamPoints)

router.route('/referred-by/:referralCode')
    .get(controller.getUserReferals)

module.exports = router;