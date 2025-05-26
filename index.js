require('dotenv').config()
const express = require('express'),
    app = express(),
    TelegramBot = require('node-telegram-bot-api'),
    models = require('./models'),
    gameRoutes = require('./routes/game.route'),
    playerRoutes = require('./routes/player.route'),
    cors = require('cors'),
    cron = require('node-cron'),
    gameController = require('./controllers/game.controller');
    Player = require('./models/Player.model'),
    { Account, RpcProvider, Contract, cairo, CallData } = require("starknet"),
   tweepRoutes = require('./routes/tweep.route.js'),
    gameAbi = require('./utils/abis/gameAbi.json');

    
  const provider = new RpcProvider({ nodeUrl: process.env.PROVIDER});

    const BOT_TOKEN =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_BOT_TOKEN
    : process.env.NODE_ENV === "test"
    ? process.env.TEST_BOT_TOKEN
    : process.env.DEV_BOT_TOKEN;
const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_SERVER_URL
    : process.env.NODE_ENV === "test"
    ? process.env.TEST_SERVER_URL
    : process.env.DEV_SERVER_URL;

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
  

app.use(cors())    

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({extended: true, limit: "50mb" }))


app.use((req, res, next) => {
  console.log(req.method, req.path)

  next()
})

app.get('/', (req, res) => {
  res.send('Server is up and running');
})

app.use('/game', gameRoutes);
app.use('/player', playerRoutes);
app.use('/tweep', tweepRoutes);

// Extend the TelegramBot class to customize behavior
class CustomTelegramBot extends TelegramBot {
  // Override the request method
  _request(path, options = {}) {
    // Modify the API URL to append /test to the path
    const testPath = `test/${path}`;
    return super._request(testPath, options);
  }
}

const bot =
  process.env.NODE_ENV === "production"
    ? new TelegramBot(BOT_TOKEN, {
        webhook: true,
      })
    : new CustomTelegramBot(BOT_TOKEN, {
        webHook: true,
      });

// bot.setWebHook(`${SERVER_URL}/bot${BOT_TOKEN}`);

bot.on("message", async (msg) => {
  console.log(msg);
});


// Handle the /start command
bot.onText(/\/start(.*)/, async (msg, match) => {
  const tg_id = msg.from.id;
  const username = msg.from.username || '';
  const first_name = msg.from.first_name || '';
  const last_name = msg.from.last_name || '';
  const referral_code = match[1]; // Extract referral code from the /start command

  try {
    // Check if the user already exists in the database
    let user = await Player.findOne({ telegramId: tg_id });

    if (!user) {
      // Generate a unique referral code for the new user
      const newReferralCode = `REF-${tg_id}`;

      let trimmed_ref = referral_code.trim();

      // Create a new user record
      user = new Player({
        telegramId: tg_id,
        username,
        referral_code: newReferralCode,
        referred_by: trimmed_ref || null, // Associate referrer if referral_code exists
      });

      await user.save();

      // Optionally, reward the referrer
      if (referral_code) {
        const referrer = await Player.findOne({ referral_code: trimmed_ref });
        if (referrer) {
          referrer.points = referrer.points + 25; // Reward referrer with points
          await referrer.save();

          // Notify the referrer about the new referral
          bot.sendMessage(referrer.telegramId, `🎉 Someone joined using your referral code!`);
        }
      }
    }

    bot.sendMessage(
      tg_id,
      `Welcome to the Mini App! 🎉\n\nYour referral code is: ${`REF-${tg_id}`}\n\nShare it with your friends to earn rewards!`
    );

    console.log(`User ${first_name} (${tg_id}) has started the mini app.`);
  } catch (error) {
    console.error('Error handling /start command:', error);
  }
});

// bot.on("polling_error", (error) => {
//   console.log("Polling error:", error); // Log polling errors
// });

// bot.on("webhook_error", (error) => {
//   console.log("Webhook error:", error); // Log webhook errors
// });


// app.post(`/bot${BOT_TOKEN}`, (req, res) => {
//   bot.processUpdate(req.body);
//   res.sendStatus(200);
// });


// // Matches "/echo [whatever]"
// bot.onText(/\/echo(.+)/, (msg, match) => {

//     // The 'msg' is the received Message from Telegram
//     // and 'match' is the result of executing the regexp 
//     // above on the text content of the message

//     let chatId = msg.chat.id;

//     // The captured "whatever"
//     let resp = match[1];

//     // send back the matched "whatever" to the chat
//     bot.sendMessage(chatId, resp);
// });

// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     const messageText = msg.text;
//     let result = [];
//     let emojiArray = []

//     let wordOfTheDay = ['C', 'o', 'v', 'i', 'd']
//     let msgArray = messageText.split('')

//     console.log(wordOfTheDay, msgArray)

//     if (messageText.length != 5) {
//         return bot.sendMessage(chatId, 'You reply must be a 5 letter word')
//     }

//     for (let i = 0; i < msgArray.length; i++) {
//         const letter = msgArray[i];
//         const isValid = wordOfTheDay.includes(letter); // Check if the letter exists in arr1
//         const isRight = wordOfTheDay[i] === letter; // Check if the letter is at the same index in both arrays
    
//         // Add the letter and its validation status as an object to the result array
//         result.push({
//           [letter]: {
//             isValid,
//             isRight
//           }
//         });

//         if (isValid && isRight) {
//             emojiArray.push('🟩')
//         }else if(!isRight && isValid) {
//             emojiArray.push('🟧')
//         }else if(!isValid && !isRight) {
//             emojiArray.push('⬛')
//         }
//       }
    
//     console.log(result);
//     console.log(emojiArray);

//     return bot.sendMessage(chatId, `${emojiArray.join('')}`)
//   });

cron.schedule('0 0 * * *', async () => {
  try {    
    console.log('Running daily game update task...');

    let tx =  await gameContract.set_daily_game();
    console.log('Transaction sent:', t.hash);


    console.log('Daily game updated successfully:', tx);
  } catch (error) {
    console.error('Error updating daily game:', error);
  }
}, { timezone: "UTC" });

app.listen(process.env.PORT, () => {
    console.log('-----------------------------------------')
    console.log("Tweetle backend started @", process.env.PORT)
    // console.log(`web hook set to ${SERVER_URL}/bot${BOT_TOKEN}`)
    console.log('-----------------------------------------')
})