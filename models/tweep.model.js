const mongoose = require('mongoose');
const TweepSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    argentAdress: { type: String },
    hasagreedToTerms: { type: Boolean, default: false }
}, { timestamps: true });
let Tweep = mongoose.model('tweep', TweepSchema);
module.exports = Tweep;
// This code defines a Mongoose schema and model for a Tweep entity.
// The schema includes fields for email, argent address, and a boolean indicating whether the user has agreed to terms.                         

