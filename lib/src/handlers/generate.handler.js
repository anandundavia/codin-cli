const fs = require('fs');
const shell = require('shelljs');
const path = require('path');

const logger = require('../services/logger.service');
const constants = require('../../config/constants');

const execute = async () => {
    const cwd = process.cwd();
    const temporaryDirectoryName = constants.fs.directory;
    const temporaryDirectoryPath = path.join(cwd, temporaryDirectoryName);
    if (!fs.existsSync(temporaryDirectoryPath)) {
        logger.info(`Creating a temporary direcotry ${temporaryDirectoryName}`);
        fs.mkdirSync(temporaryDirectoryPath);
    }
    logger.info('Generating tslint report');
    const outputFile = constants.fs.json;
    const command = `"node_modules/.bin/tslint" src/**/*.ts --format json --out ./${temporaryDirectoryName}/${outputFile}`;
    shell.exec(command, { cwd });
    logger.info(`Generated tslint report successfully at ${temporaryDirectoryPath}`);
};

module.exports = { execute };
