require('dotenv').config()
const { Account, RpcProvider, Contract, cairo, CallData } = require("starknet"),
gameAbi = require('../utils/abis/gameAbi.json'),
Player = require('../models/Player.model');

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


exports.processGuess = async (req, res) => {

  let {word, i, tg_id} = req.body

  try {
    let result = [];
    let outcome = [];
    let points = 0;

    // Query daily word
    const response = await gameContract.get_game_word(word, i);

    for (let i = 0; i < 5; i++) {
        const letter = response[1][i];
        const isValid = response[0].includes(letter); // Check if the letter exists in arr1
        const isRight = response[0][i] === letter; // Check if the letter is at the same index in both arrays
    
        // Add the letter and its validation status as an object to the result array
        result.push({
          [letter]: {
            isValid,
            isRight
          }
        });

        if (isValid && isRight) {
          outcome.push(2)
          points + 5
        }else if(!isRight && isValid) {
          outcome.push(1)
          points + 3
        }else if(!isValid && !isRight) {
          outcome.push(0)
        }else {
          points + 0
          outcome.push(3)
        }
      }

    // Update the player's points in the database
    const player = await Player.findOne({ tg_id }); // Find the player by tg_id
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    player.points = (player.points || 0) + points; // Add new points to existing points
    await player.save(); // Save the updated player

    return res.status(200).json({ message: 'success', data: outcome, points: player.points });

  } catch (error) {
    return res.status(400).json({message: error.message, error: error});
  }
}

exports.updateDailyWord = async (req, res) => {
    try {    
       gameContract.connect(account)
       let multiCall = await account?.execute([ 
          {
            contractAddress: process.env.GAME_CONTRACT,
            entrypoint: "set_new_daily_game",
          }
       ]);
      
      await provider.waitForTransaction(multiCall.transaction_hash);

      return res.status(200).json({message: 'success'})
        
    } catch (error) {
      return  res.json({message: error.message, error: error})
    }
}
