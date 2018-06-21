const fs = require('fs');
const path = require('path');

const tslint = require('../helpers/tslint.helper');
const summary = require('../helpers/summary.helper');
const quality = require('../helpers/quality.v2.helper');
const coverage = require('../helpers/coverage.helper');
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
                // Because we do not want to break everything if coverage fails,
                // Wrap this piece of crap around try catch
                // Let's be honest, it is a PITA
                try {
                    logger.info('Finding code coverage. This might take a while');
                    await coverage.execute(cwd);
                } catch (coverageError) {
                    logger.error('Something went wrong wile generating coverage reports');
                }
                break;
            }
            default: {
                const msg = `Project type ${project.type} are not yet supported by codin-cli`;
                logger.error(msg);
                return;
            }
        }
    } catch (e) {
        /* eslint-disable indent */
        switch (e.code) {
            case 'ENOENT': {
                logger.error('Project is not initialized. Run "codin init" first');
                break;
            }
            default: {
                break;
            }
        }
        /* eslint-enable indent */
        logger.error(e);
    }
};

module.exports = { execute };
