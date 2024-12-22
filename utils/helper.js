const crypto = require('crypto');

/**
 * Generates a unique referral code.
 * @param {string | number} userId - Optional identifier for the user.
 * @param {number} length - Length of the referral code (default: 8).
 * @returns {string} - Unique referral code.
 */
function generateReferralCode(userId = '', length = 8) {
    // Base string: Randomized alphanumeric characters
    const baseCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const prefix = userId ? `${userId}` : '';

    return (prefix + baseCode).substring(0, length);
}

const feltToString = felt => felt.toString(16)
  // Split into 2 chars
  .match(/.{2}/g)
  // Get char from code
  .map( c => String.fromCharCode(parseInt( c, 16 ) ) )
  // Join to a string
  .join('');

function tupleToObject(tuple) {
    const [array1, array2] = tuple;
    return { array1, array2 };
}

exports.func = {
  feltToString,
  tupleToObject
}