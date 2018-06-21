const os = require('os');
const path = require('path');
const inquirer = require('inquirer');


const logger = require('../services/logger.service');
const server = require('../services/server.service');
const authStore = require('../services/authstore.service');
const cookie = require('../services/cookie.service');
const { fs } = require('../../config/constants');

const askEmailAndPassword = () => new Promise((resolve, reject) => {
    const prompts = [{
        name: 'email',
        type: 'input',
        message: 'Enter your email',
        validate: value => !!value, // It means return value ? true : false
    }, {
        name: 'password',
        type: 'password',
        mask: '*',
        message: 'Enter your password',
        validate: value => !!value, // It means return value ? true : false
    }];
    inquirer.prompt(prompts).then(resolve).catch(reject);
});

const execute = () => new Promise(async (resolve, reject) => {
    const credentials = await authStore.getCredentials();
    // Checking if credentials are saved or not
    if (credentials) {
        // Credentials are saved.
        // Let us check if we have the authCookie or not
        const authCookie = cookie.get();
        if (authCookie) {
            // We have the cookie no worries. User is logged in.
            logger.info(`User is already logged in with '${credentials.email}'.`);
            return resolve();
        }
        // We do not have the cookie. Let us login with the stored credentials
        return server.login(credentials.email, credentials.password)
            .then(resolve)
            .catch((err) => {
                /* eslint-disable indent, max-len */
                switch (err.code) {
                    case 'EAI_AGAIN':
                    case 'ECONNREFUSED':
                    case 'ETIMEDOUT': {
                        logger.error('Could not connect to server. Make sure you have working internet connection');
                        reject();
                        break;
                    }
                    case 'ENOTFOUND': {
                        logger.error('Could not connect to server using given proxy');
                        reject();
                        break;
                    }
                    default: {
                        // Show some intuitive message when the login is failed using saved credentials
                        const credentialsPath = path.join(os.homedir(), fs.credentials);
                        logger.error('Failed to login using saved credentials.');
                        logger.info(`\nYou might want to remove the '${credentialsPath}' file. And run 'codin init' again.\n`);
                        reject(err);
                    }
                }
                /* eslint-enable indent, max-len */
            });
    }
    // We do not have saved credentials. Ask for them
    logger.info('Please login to CodIn');
    const login = {};
    try {
        const { email, password } = await askEmailAndPassword();
        login.email = email;
        login.password = password;
    } catch (e) {
        return reject(e);
    }
    return server.login(login.email, login.password).then((data) => {
        // Save the credentials in case the login in successful
        authStore.setCredentials(login);
        resolve(data);
    }).catch(reject);
});
module.exports = { execute };
