const mongoose = require('mongoose')

const attemptSchema = new mongoose.Schema({
    telegramId: {type: String, required: true},
    wordIndex: { type: Number, required: true},
    guess: {type: String, required: true},
    outcome: { type: [Number], required: true},
    gameType: {type: String, required: true},
    gameId: {type: Number, required: true},
}, {timestamps: true})

let Attempt = mongoose.model('attempt', attemptSchema);

module.exports = Attempt;

