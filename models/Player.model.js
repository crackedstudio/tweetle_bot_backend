const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    
    telegramId: {type: String, unique: true},
    telegramName: {type: String},
    referalCode: {type: String, unique: true},
    points: {type: Number, default: 0},
    referedBy: {type: String, default: null},
    referrals: [{type: String}]


}, {timestamps: true})

let Player = mongoose.model('player', PlayerSchema);

exports.module = Player;