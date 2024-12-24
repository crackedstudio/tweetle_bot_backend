require('dotenv').config()
const { Account, RpcProvider, Contract, cairo, CallData } = require("starknet"),
gameAbi = require('../utils/abis/gameAbi.json');
const { MerkleTree } = require('merkletreejs');
const circomlibjs = require('circomlibjs');
const { func } = require('../utils/helper');

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

  let {word} = req.body

  try {
    let result = [];
    let emojiArray = []

    // Query daily word
    const response = await gameContract.get_daily_word(word);

    if (word.length != 5) {
      throw new Error('Guess must be a five letter word');
    }

    for (let i = 0; i < 5; i++) {
        const letter = response[1][i];
        const isValid = response[0].includes(letter); // Check if the letter exists in arr1
        const isRight = response[0][i] === letter; // Check if the letter is at the same index in both arrays

        // console.log(letter.toString(16), response[0][i].toString(16))
        // console.log(func.tupleToObject(response))
    
        // Add the letter and its validation status as an object to the result array
        result.push({
          [letter]: {
            isValid,
            isRight
          }
        });

        if (isValid && isRight) {
            emojiArray.push(2)
        }else if(!isRight && isValid) {
            emojiArray.push(1)
        }else if(!isValid && !isRight) {
            emojiArray.push(0)
        }else {
          emojiArray.push(3)
        }
      }
    
    // console.log(result);
    console.log(emojiArray);
    console.log(response)

    return res.status(200).json({message: 'success', data: emojiArray});

  } catch (error) {
    return res.status(400).json({message: error.message, error: error});
  }
}

exports.updateDailyWord = async (req, res) => {
    try {    
      console.log(1)
       gameContract.connect(account)
       let multiCall = await account?.execute([
          {
            contractAddress: process.env.VRF_PROVIDER_ADDRESS,
            entrypoint: 'request_random',
            calldata: CallData.compile({
              caller: process.env.GAME_CONTRACT,
              source: {type: 0, address: account.address},
            })
          }, 
          {
            contractAddress: process.env.GAME_CONTRACT,
            entrypoint: "create_new_game",
          }
       ]);

       console.log(2)
      
      await provider.waitForTransaction(multiCall.transaction_hash);

      return res.status(200).json({message: 'success'})
        
    } catch (error) {
      return  res.json({message: error.message, error: error})
    }
}
