require('dotenv').config()
const Player = require('../models/Player.model')
const { Account, RpcProvider, Contract, cairo, CallData } = require("starknet"),
gameAbi = require('../utils/abis/gameAbi.json');

const provider = new RpcProvider({ nodeUrl: process.env.PROVIDER});

const account = new Account(
    provider,
    process.env.ACCT_ADDRESS,
    process.env.PRIVATE_KEY
);

const gameContract = new Contract(
    gameAbi,
    process.env.GAME_CONTRACT,
    account
);


exports.registerPlayer = async (req, res) => {

    try {

        // Player.findOne();

        let deploymentCall = await account.deployAccount(req.body);

        // await provider.waitForTransaction(deploymentCall.transaction_hash);

        return res.send(deploymentCall)
        
    } catch (error) {
        return res.status(400).json({message: error.message, error: error});
    }
}


exports.outsideExecution = async (req, res) => {

    // res.send(req.body);
    
    try {

        let outsideCall = await account.execute([req.body]);

        return res.send(outsideCall)

        
    } catch (error) {
        return res.status(400).json({message: error.message, error: error});
    }
}

module.exports = exports