const shell = require('shelljs');
const ora = require('ora');

const constants = require('../../config/constants');

const spinner = ora({ spinner: constants.spinner });
spinner.color = 'blue';

const _old = {
    exec: shell.exec,
};

const messages = [
    'Please wait...',
    'Hold on...',
    'Almost there...',
    'Processing...',
    'Executing...',
];

// ! you can use this if you want to get last message
// (() => {
//     logger.on('logging', (transport, level, msg) => { spinner.text = msg });
// })();

shell.exec = (command, options, callback) => new Promise((resolve, reject) => {
    const index = Number.parseInt((Math.random() * 100) % messages.length, 10);
    spinner.text = messages[index];
    spinner.start();
    /* eslint-disable no-param-reassign, no-unused-vars */
    options.async = true;
    const process = _old.exec(command, options, callback);
    // TODO: make use of code and signal
    process.on('exit', (code, signal) => {
        spinner.stop();
        resolve();
    });
    process.on('error', (err) => {
        spinner.stop();
        reject(err);
    });
    // TODO: make use of this
    // process.on('close', (x) => {
    //     console.log('close', x);
    // });
});

module.exports = shell;
