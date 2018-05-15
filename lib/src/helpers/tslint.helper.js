const fs = require('fs');
const shell = require('shelljs');
const path = require('path');

const logger = require('../services/logger.service');
const constants = require('../../config/constants');

const rules = JSON.stringify(require('../../assets/tslint/rules'));

const createRuleFile = cwd => new Promise((resolve) => {
    const writePath = path.join(cwd, constants.fs.directory, constants.fs.rule);
    return fs.writeFile(writePath, rules, (error) => {
        if (error) {
            return resolve(false);
        }
        return resolve(true);
    });
});

const removeRuleFile = cwd => new Promise((resolve) => {
    const filePath = path.join(cwd, constants.fs.directory, constants.fs.rule);
    fs.unlink(filePath, (err) => {
        if (err) {
            return resolve(false);
        }
        return resolve(true);
    });
});

const execute = cwd => new Promise(async (resolve, reject) => {
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
        let config = '';
        const isFileCreated = await createRuleFile(cwd);
        if (isFileCreated) {
            config = `--config ./${temporaryDirectoryName}/${constants.fs.rule}`;
        } else {
            logger.warn('Failed to create rule file. Using the project default rules');
        }
        const outputFile = constants.fs.json;
        logger.info('Generating tslint report');
        const command = `"node_modules/.bin/tslint" "src/**/*.ts" --project tsconfig.json ${config} --format json --out ./${temporaryDirectoryName}/${outputFile}`;
        shell.exec(command, { cwd });
        logger.info('Generated tslint report');
        resolve();
    } catch (e) {
        reject(e);
    } finally {
        // Delete the file so that the user can not change the rules
        removeRuleFile(cwd);
    }
});

module.exports = { execute };
