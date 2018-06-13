const fs = require('fs');
const path = require('path');
const semver = require('semver');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');
const shell = require('../services/shell.service');
const Package = require('../services/package.service');

/* eslint-disable max-len */
const getKarmaCodeCoverage = cwd => new Promise(async (resolve) => {
    const packageJSON = await Package.readPackageJSON();
    const angularVersion = semver.clean(packageJSON.devDependencies['@angular/cli']);
    const shouldUseDefaultConfig = semver.satisfies(angularVersion, '<=5.x.x');

    let karmaConf;
    let configOption;
    if (shouldUseDefaultConfig) {
        karmaConf = constants.test.karma.angular.default.configFile;
        configOption = constants.test.karma.angular.default.configCommand;
    } else {
        karmaConf = constants.test.karma.angular['6'].configFile;
        configOption = constants.test.karma.angular['6'].configCommand;
    }

    const absolutePathToCustomKarmaConfig = path.resolve(path.join(__dirname, '..', '..', 'assets', 'karma', karmaConf));
    // We need to find this because --config flag in ng test takes RELATIVE path to the conf file from the .angular-cli.json
    const relativePathToCustomKarmaConfig = path.relative(process.cwd(), absolutePathToCustomKarmaConfig);
    const testCommand = `ng test ${configOption} ${relativePathToCustomKarmaConfig} --code-coverage`;
    console.log(testCommand);
    await shell.exec(testCommand, { cwd });
    resolve();
});
/* eslint-enable max-len */

/* eslint-disable max-len, no-plusplus */
const copyFilesToUpload = (files, pathToFiles) => new Promise(async (resolve, reject) => {
    try {
        for (let index = 0; index < files.length; index++) {
            const aFileName = files[index];
            const pathToFile = path.join(pathToFiles, aFileName);
            fs.copyFileSync(pathToFile, path.join(process.cwd(), constants.fs.directory, aFileName));
        }
        return resolve();
    } catch (e) {
        return reject(e);
    }
});
/* eslint-enable max-len, no-plusplus */

const execute = cwd => new Promise(async (resolve, reject) => {
    try {
        const pathToConfig = path.join(cwd, constants.fs.directory, constants.fs.config);
        const config = JSON.parse(fs.readFileSync(pathToConfig, 'utf-8'));
        if (config.test && Object.keys(config.test).length !== 0) {
            const { framework, version } = config.test;
            /* eslint-disable indent */
            switch (framework) {
                case 'karma': { // MUST BE as same as one of constants.test.list
                    await getKarmaCodeCoverage(cwd);
                    await copyFilesToUpload(constants.test.karma.files, path.join(cwd, 'coverage'));
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
