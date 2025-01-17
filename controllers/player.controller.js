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

        console.log(req.body)

        let deploymentFee = await account.estimateAccountDeployFee(req.body, {})

        console.log(deploymentFee.suggestedMaxFee)
        console.log(req.body.contractAddress)

        const transfer = await account.execute({
            contractAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
            entrypoint: "transfer",
            calldata: CallData.compile({
                address: req.body.contractAddress,
                amount: cairo.uint256( Number(deploymentFee.suggestedMaxFee) * 100),
            }),
        }) 

        console.log('sent', transfer)

        // let deploymentCall = await account.deployAccount(req.body);

        // await provider.waitForTransaction(deploymentCall.transaction_hash);
        // console.log(deploymentCall)
        return res.send({message: "sent stark to address"})
        
    } catch (error) {
        console.log(error)
        return res.status(400).json({message: error.message, error: error});
    }
}

exports.cliamPoints = async (req, res) => {

    let {tg_id} = req.params 

    try {

        let outsideCall = await account.execute([req.body]);

        let player = await Player.findOne({telegramId: tg_id});

        player.points = 0; //reset points to zero
        await player.save(); 

        return res.send(outsideCall);

        
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