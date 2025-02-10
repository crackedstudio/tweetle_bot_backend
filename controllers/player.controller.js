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
        return res.status(500).json({message: error.message, error: error});
    }
}

exports.cliamPoints = async (req, res) => {

    let {tg_id} = req.params 

    try {

        let player = await Player.findOne({telegramId: tg_id});

        player.points = 0; //reset points to zero
        await player.save(); 

        let outsideCall = await account.execute([req.body]);

        return res.send(outsideCall);

        
    } catch (error) {
        return res.status(500).json({message: error.message, error: error});
    }
}

exports.getUser = async (req, res) => {
    const { telegramId } = req.params;
  
    try {
      const user = await Player.findOne({ telegramId });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
  
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  };


exports.getUserReferals = async (req, res) => {

    let {referralCode} = req.params
    
    try {
        // Find all players with the specified referral code in the 'referred_by' field
        const players = await Player.find({ referred_by: referralCode });
    
        if (!players || players.length === 0) {
          return res.status(404).json({ message: 'No players found referred by this code.' });
        }
    
        return res.status(200).json({
          message: `Players referred by ${referralCode}`,
          data: players,
        });
      } catch (error) {
        console.error('Error fetching referred players:', error);
        return res.status(500).json({
          message: 'An error occurred while fetching referred players.',
          error: error.message,
        });
      }
}


exports.outsideExecution = async (req, res) => {

    // res.send(req.body);
    
    try {

        let outsideCall = await account.execute([req.body]);

        return res.send(outsideCall)

        
    } catch (error) {
        return res.status(500).json({message: error.message, error: error});
    }
}

exports.getUserByTgId = async (req, res) => {

  const {tg_id} = req.params;

  try {

    let player = await Player.findOne({ telegramId: tg_id });

    return res.status(200).json({success: true, data: player.username})
    
  } catch (error) {
    return res.status(500).json({message: error.message, error: error});
  }
}

module.exports = exports