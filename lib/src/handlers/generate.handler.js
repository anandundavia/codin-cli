const fs = require('fs');
const path = require('path');

const tslint = require('../helpers/tslint.helper');
const summary = require('../helpers/summary.helper');
const quality = require('../helpers/quality.v2.helper');
// const coverage = require('../helpers/coverage.helper');
// const dfs = require('../helpers/dfs.helper');

const constants = require('../../config/constants');

const logger = require('../services/logger.service');

const execute = async () => {
    try {
        const cwd = process.cwd();
        const configPath = path.join(cwd, constants.fs.directory, constants.fs.config);
        const project = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        /* eslint-disable indent */
        switch (project.type) {
            case 'angular': { // These project name MUST be as same as keys of constants.projects
                await tslint.execute(cwd);
                await summary.execute(cwd);
                await quality.execute(cwd);
                // await coverage.execute(cwd);
                break;
            }
            default: {
                const msg = `Project type ${project.type} are not yet supported by codin-cli`;
                logger.error(msg);
                return;
            }
        }
    } catch (e) {
        logger.error(e);
    }
};

module.exports = { execute };
