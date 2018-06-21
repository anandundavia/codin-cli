const fs = require('fs');
const path = require('path');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');
const server = require('../services/server.service');

const execute = file => new Promise((resolve, reject) => {
    if (!fs.existsSync(file)) {
        const msg = `No file exists at path "${file}"`;
        logger.error(msg);
        reject(new Error(msg));
    }
    if (!fs.lstatSync(file).isFile) {
        const msg = `Path "${file}" does not resolve to a file.`;
        logger.error(msg);
        reject(new Error(msg));
    }

    const config = path.join(process.cwd(), constants.fs.directory, constants.fs.config);
    if (!fs.existsSync(config)) {
        const msg = 'Config file does not exists. Please download a config file or run "codin init"';
        logger.error(msg);
        reject(new Error(msg));
    }
    const project = JSON.parse(fs.readFileSync(config, 'utf-8'));
    server.upload(file, project._id).then(resolve).catch((err) => {
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
                reject(err);
                break;
            }
        }
        /* eslint-enable indent, max-len */
    });
});

module.exports = { execute };
