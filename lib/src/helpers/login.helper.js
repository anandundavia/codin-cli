const read = require('read');

const logger = require('../services/logger.service');
const server = require('../services/server.service');

const ask = (question, silent = false) => new Promise((resolve, reject) => {
    read({ prompt: `${question} > `, silent }, (er, answer) => {
        if (er) {
            return reject(er);
        }
        return resolve(answer);
    });
});

const execute = () => new Promise(async (resolve, reject) => {
    let isLoggedIn;
    try {
        isLoggedIn = await server.isLoggedIn();
    } catch (e) {
        isLoggedIn = false;
    }
    if (!isLoggedIn) {
        logger.info('Please login to CodeIn');
        const login = { email: 'anand.undavia@tcs.com', password: 'anand.undavia' };
        try {
            login.email = await ask('Enter your email');
            login.password = await ask('Enter your password', true);
            server.login(login.email, login.password).then(resolve).catch(reject);
        } catch (e) {
            reject(e);
        }
    } else {
        logger.info('User is already logged in. Skipping login');
        resolve();
    }
});
module.exports = { execute };
