const crypto = require('crypto');
const util = require('util');

const pbkdf2Async = util.promisify(crypto.pbkdf2);
const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

async function hashPassword(password) {
    if (!password) throw new Error('Password cannot be empty');
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
    return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
    if (!password || !storedHash) return false;
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    
    const derivedKey = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const hashBuffer = Buffer.from(hash, 'hex');

    if (keyBuffer.length !== hashBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, hashBuffer);
}

module.exports = {
    hashPassword,
    verifyPassword
};

