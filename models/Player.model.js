const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    
    telegramId: {type: String, unique: true},
    username: {type: String},
    points: {type: Number, default: 0},
    referral_code: { type: String, unique: true },
    referred_by: { type: String },

}, {timestamps: true})

let Player = mongoose.model('player', PlayerSchema);

module.exports = Player;