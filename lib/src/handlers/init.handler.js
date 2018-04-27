const fs = require('fs');
const path = require('path');

const login = require('../helpers/login.helper');
const logger = require('../services/logger.service');
const register = require('../helpers/register.helper');

const execute = async () => {
    try {
        await login.execute();
        const isNewProject = await register.execute();
        if (isNewProject) {
            const cwd = process.cwd();
            logger.info(`Initializing Code Investigator in "${cwd}"`);
            const gitPath = path.join(cwd, '.git');
            if (!fs.existsSync(gitPath)) {
                logger.error(`No git repository is initialized.${'\n'}Please initialize a git repository first`);
                return;
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
            const codeInComands = `#!/usr/bin/env node${'\n'}codein --submit${'\n'}exit 0`;
            fs.appendFileSync(postCommitFile, codeInComands);
        }
        logger.info('Code Investigator initialized successfully.');
    } catch (e) {
        logger.error(e);
    }
};

module.exports = { execute };
