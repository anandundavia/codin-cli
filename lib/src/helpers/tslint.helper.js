const fs = require('fs');
const path = require('path');

const shell = require('../services/shell.service');
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
        const temporaryDirectoryPath = path.join(cwd, constants.fs.directory);
        // Ideally, this directory will always be there.
        // But if the user just want to generate the report and not
        // do anything about it, then it might not have been created in the first place
        if (!fs.existsSync(temporaryDirectoryPath)) {
            logger.info(`Creating a temporary directory ${constants.fs.directory}`);
            fs.mkdirSync(temporaryDirectoryPath);
        }
        let config = '';
        const isFileCreated = await createRuleFile(cwd);
        if (isFileCreated) {
            const configPath = path.join(constants.fs.directory, constants.fs.rule);
            config = `--config "${configPath}"`;
        } else {
            logger.warn('Failed to create rule file. Using the project default rules');
        }
        let project = '';
        const tsconfigPath = 'tsconfig.json';
        if (fs.existsSync(tsconfigPath)) {
            project = `--project "${tsconfigPath}"`;
        }
        logger.info('Generating tslint report');
        const tslintPath = path.join('node_modules', '.bin', 'tslint');
        const sourcePath = path.join('src', '**', '*.ts');
        const outputPath = path.join(constants.fs.directory, constants.fs.json);
        const command = `"${tslintPath}" "${sourcePath}" --out "${outputPath}" ${project} ${config} --format json`;
        await shell.exec(command, { silent: true, cwd });
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
