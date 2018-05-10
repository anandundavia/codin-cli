const fs = require('fs');
const shell = require('shelljs');
const path = require('path');

const logger = require('../services/logger.service');
const constants = require('../../config/constants');


const execute = cwd => new Promise((resolve, reject) => {
    try {
        const temporaryDirectoryName = constants.fs.directory;
        const temporaryDirectoryPath = path.join(cwd, temporaryDirectoryName);
        // Ideally, this directory will always be there.
        // But if the user just want to generate the report and not
        // do anything about it, then it might not have been created in the first place
        if (!fs.existsSync(temporaryDirectoryPath)) {
            logger.info(`Creating a temporary directory ${temporaryDirectoryName}`);
            fs.mkdirSync(temporaryDirectoryPath);
        }
        logger.info('Generating tslint report');
        const outputFile = constants.fs.json;
        const command = `"node_modules/.bin/tslint" src/**/*.ts --format json --out ./${temporaryDirectoryName}/${outputFile}`;
        shell.exec(command, { cwd });
        logger.info('Generated tslint report');
        resolve();
    } catch (e) {
        reject(e);
    }
});

module.exports = { execute };