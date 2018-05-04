const fs = require('fs');
const path = require('path');

const logger = require('../services/logger.service');


const execute = () => new Promise((resolve, reject) => {
    const cwd = process.cwd();
    logger.info(`Initializing Code Investigator in "${cwd}"`);
    const gitPath = path.join(cwd, '.git');
    if (!fs.existsSync(gitPath)) {
        logger.error(`No git repository is initialized.${'\n'}Please initialize a git repository first`);
        return reject();
    }
    logger.info(`Git repository found at "${gitPath}"`);
    const postCommitFile = path.join(gitPath, 'hooks', 'post-commit');
    if (fs.existsSync(postCommitFile)) {
        logger.warn('Existing "post-commit" hook found. It will be deleted.');
        fs.unlinkSync(postCommitFile);
    }
    logger.info('Creating "post-commit" hook.');
    fs.closeSync(fs.openSync(postCommitFile, 'w'));
    // TODO: Should these lines be somewhere else ?
    const codInCommands = `#!/usr/bin/env node${'\n'}codin --submit${'\n'}exit 0`;
    fs.appendFileSync(postCommitFile, codInCommands);
    return resolve();
});

module.exports = { execute };
