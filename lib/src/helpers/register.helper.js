const read = require('read');
const fs = require('fs');
const path = require('path');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');
const server = require('../services/server.service');

const askConfirmation = () => new Promise((resolve, reject) => {
    logger.warn('A config file already exists. Registering a new project will overwrite the config file and create a new project.');
    read({
        prompt: 'Do you want to continue?',
        default: 'N',
        terminal: true,
        edit: true,
    }, (err, result) => {
        if (err) {
            return reject(err);
        }
        const answer = result.toLowerCase().trim();
        if (answer === 'y' || answer === 'yes') {
            logger.warn('Config file will be overwritten');
            return registerNewProject();
        }
        logger.info('Not registering new project, existing config file will be used.');
        return resolve();
    });
});

const registerNewProject = () => new Promise((resolve, reject) => {
    const pathToPackageJSON = path.join(process.cwd(), 'package.json');
    // eslint-disable-next-line consistent-return
    fs.readFile(pathToPackageJSON, 'utf-8', (err, data) => {
        if (err) {
            return reject(err);
        }
        const json = JSON.parse(data);
        const project = `${json.name}@${json.version}`;
        server.register(project).then(() => {
            logger.info(`Registered a new project '${project}'`);
            resolve();
        }).catch((e) => {
            logger.info(`Failed to register project '${project}' ${e}`);
            reject(e);
        });
    });
})

const execute = () => new Promise(async () => {
    const cwd = process.cwd();
    const configPath = path.join(cwd, constants.fs.directory, constants.fs.config);
    fs.exists(configPath, (exists) => {
        if (exists) {
            return askConfirmation();
        }
        return registerNewProject();
    });
});

module.exports = { execute };
