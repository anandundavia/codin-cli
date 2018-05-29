const fs = require('fs');
const path = require('path');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');
const shell = require('../services/shell.service');

const getKarmaCodeCoverage = (cwd, coverageCommand) => new Promise(async (resolve) => {
    const pathToCustomKarmaConfig = path.resolve(path.join(__dirname, '..', '..', 'assets', 'karma', 'karma.conf.js'));
    const karmaPath = path.join('node_modules', '.bin', 'karma');
    const testCommand = `"${karmaPath}" start "${pathToCustomKarmaConfig}" ${coverageCommand}`;
    await shell.exec(testCommand, { cwd });
    resolve();
});

const execute = cwd => new Promise(async (resolve, reject) => {
    try {
        const pathToConfig = path.join(cwd, constants.fs.directory, constants.fs.config);
        const config = JSON.parse(fs.readFileSync(pathToConfig, 'utf-8'));
        if (config.test && Object.keys(config.test).length !== 0) {
            const { framework, version, coverage } = config.test;
            /* eslint-disable indent */
            switch (framework) {
                case 'karma': { // MUST BE as same as one of constants.test.list
                    await getKarmaCodeCoverage(cwd, coverage);
                    return resolve();
                }
                default: {
                    logger.warn(`Code coverage for framework '${framework}@${version}' is not yet supported`);
                    return resolve();
                }
            }
            /* eslint-enable indent */
        }
        logger.info('Testing is not set up, coverage will not be submitted');
        return resolve();
    } catch (e) {
        return reject(e);
    }
});

module.exports = { execute };
