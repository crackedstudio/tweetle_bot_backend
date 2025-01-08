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

    let {outsideExecutionCall} = req.body;

    try {

        Player.findOne();

        let deploymentCall = await account.execute(outsideExecutionCall);

        await provider.waitForTransaction(deploymentCall.transaction_hash);

        return res.status(200).json({message: 'successfully registered !'})
        
    } catch (error) {
        return res.status(400).json({message: error.message, error: error});
    }
}


exports.outsideExecution = async (req, res) => {
    
    try {

        let outsideCall = await account.execute(req.body);

        let r = await provider.waitForTransaction(outsideCall.transaction_hash);

        return res.status(200).json({message: 'executed', data: r})

        
    } catch (error) {
        return res.status(400).json({message: error.message, error: error});
    }
}

module.exports = exports