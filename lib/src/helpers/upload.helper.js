const fs = require('fs');
const path = require('path');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');
const server = require('../services/server.service');

const execute = file => new Promise((resolve, reject) => {
    if (!fs.existsSync(file)) {
        const msg = `No file exisits at path "${file}"`;
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
        const msg = 'Config file does not exists. Please download a config file or run "codin -i"';
        logger.error(msg);
        reject();
    }
    const project = JSON.parse(fs.readFileSync(config, 'utf-8'));
    server.upload(file, project._id).then(resolve).catch(reject);
});

module.exports = { execute };
