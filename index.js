require('dotenv').config()
const express = require('express'),
    app = express(),
    TelegramBot = require('node-telegram-bot-api'),
    models = require('./models'),
    gameRoutes = require('./routes/game.route'),
    playerRoutes = require('./routes/player.route'),
    cors = require('cors');

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

app.use(cors())    

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({extended: true, limit: "50mb" }))


app.use((req, res, next) => {
  console.log(req.method, req.path)

  next()
})

app.use('/game', gameRoutes);
app.use('/player', playerRoutes);

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

bot.setWebHook(`${SERVER_URL}/bot${BOT_TOKEN}`);

bot.on("message", async (msg) => {
  console.log(msg);
});

bot.onText(/\/start/, (msg) => {
  console.log(msg.from)
});

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


app.listen(process.env.PORT, () => {
    console.log('-----------------------------------------')
    console.log("Tweetle backend started @", process.env.PORT)
    console.log(`web hook set to ${SERVER_URL}/bot${BOT_TOKEN}`)
    console.log('-----------------------------------------')
})