const express = require('express');
const router = express.Router();
const tweepController = require('../controllers/tweep.controller.js');  

router.post('/get-free-tokens/:email/:argentAdress', tweepController.getFreeTokens);

module.exports = router;
// This code defines a route for claiming free tokens in a Tweep application.
// It uses Express.js to create a router and maps the POST request to the `getFreeTokens` method in the `tweepController`.
// The route is set up to handle requests at the path `/get-free-tokens`.
// The `getFreeTokens` method is responsible for processing the request, checking if the user has already claimed tokens,
// saving the user's information, and executing a token transfer to the specified Argent address.           