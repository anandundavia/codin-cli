const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');

const getKarmaCodeCoverage = (cwd, coverageCommand) => new Promise(async (resolve, reject) => {
    const pathToCustomKarmaConfig = path.resolve(path.join(__dirname, '..', '..', 'assets', 'karma', 'karma.conf.js'));
    const testCommand = path.join('node_modules', '.bin', 'karma');
    const process = shell.exec(`"${testCommand}" start "${pathToCustomKarmaConfig}" ${coverageCommand}`, { cwd, async: true });
    setTimeout(() => {
        logger.warn('Killing Karma process after 3 minutes');
        shell.exec(`taskkill /pid ${process.pid} /f /t`);
    }, 3 * 60 * 1000);

    process.on('error', reject);
    process.on('close', resolve);
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
        return logger.info('Testing is not set up, coverage will not be submitted');
    } catch (e) {
        return reject(e);
    }
});

module.exports = { execute };
