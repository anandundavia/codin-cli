const fs = require('fs');
const path = require('path');

const tslint = require('../helpers/tslint.helper');
const summary = require('../helpers/summary.helper');
const quality = require('../helpers/quality.helper');
// const coverage = require('../helpers/coverage.helper');
// const dfs = require('../helpers/dfs.helper');

const constants = require('../../config/constants');

const typescript = require('../services/typescript.service');
const logger = require('../services/logger.service');

// TODO: This should check which type of project is it
// And generate the report accordingly
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
                const compiledPath = await typescript.compile(cwd);
                await quality.execute(cwd, compiledPath);
                await typescript.cleanup(cwd);
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
