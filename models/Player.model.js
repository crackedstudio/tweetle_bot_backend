const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    
    telegram_name: {type: String},
    refferal_code: {type: String},
    points: {type: Number, default: 0},
    total_referals: {type: Number, default: 0},
    reffered_by: {type: String}

}, {timestamps: true})

let Player = mongoose.model('player', PlayerSchema);

exports.module = Player;