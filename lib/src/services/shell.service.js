const shell = require('shelljs');
const ora = require('ora');

const spinner = ora();
const _old = {
    exec: shell.exec,
};

shell.prototype.exec = (command, options, callback) => new Promise((resolve, reject) => {
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
