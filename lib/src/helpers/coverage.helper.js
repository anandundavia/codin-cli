const fs = require('fs');
const path = require('path');
const semver = require('semver');
const { mergeWith } = require('lodash');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');
const shell = require('../services/shell.service');
const Package = require('../services/package.service');

/* eslint-disable max-len, no-plusplus */
const changeFileStructure = (files, cwd) => new Promise(async (resolve, reject) => {
    if (files.length === 0) return resolve();
    try {
        const newContent = {};
        for (let index = 0; index < files.length; index++) {
            const aFileName = files[index];

            newContent[aFileName] = newContent[aFileName] || [];
            const pathToFile = path.join(cwd, aFileName);
            const content = JSON.parse(fs.readFileSync(pathToFile).toString());
            const keys = Object.keys(content);
            let isSummaryThere = false;
            let summary = {};
            keys.forEach((aKey) => {
                // in coverage-summary, there will be one field named 'total'
                // Which will contain complete summary
                if (aKey === 'total') {
                    isSummaryThere = true;
                    summary = Object.assign({}, content[aKey]);
                    // Remove the summary once saved in other object
                    delete content[aKey];
                } else {
                    // coverage-final contains path field
                    delete content[aKey].path;
                    // Remove the absolute path
                    const fileName = aKey.replace(`${process.cwd()}${path.sep}`, '');
                    newContent[aFileName].push({ name: fileName, ...content[aKey] });
                }
            });
            if (isSummaryThere) {
                const pathToSummary = path.join(process.cwd(), constants.fs.directory, constants.fs.summary);
                const existingSummary = JSON.parse(fs.readFileSync(pathToSummary).toString());
                existingSummary.coverage = summary;
                fs.writeFileSync(pathToSummary, JSON.stringify(existingSummary));
            }
        }
        let mergedObject = newContent[files[0]];
        const combiner = (src, val) => ({ ...src, ...val });
        for (let index = 1; index < files.length; index++) {
            const aFileName = files[index];
            mergedObject = mergeWith(mergedObject, newContent[aFileName], combiner);
        }
        const pathToCoverage = path.join(process.cwd(), constants.fs.directory, constants.fs.coverage);
        const pathToCoverageFinal = path.join(process.cwd(), constants.fs.directory, constants.fs.coverageFinal);
        const pathToCoverageSummary = path.join(process.cwd(), constants.fs.directory, constants.fs.coverageSummary);
        fs.writeFileSync(pathToCoverage, JSON.stringify(mergedObject));
        fs.unlinkSync(pathToCoverageFinal);
        fs.unlinkSync(pathToCoverageSummary);
        return resolve();
    } catch (e) {
        return reject(e);
    }
});
/* eslint-enable max-len, no-plusplus */

/* eslint-disable max-len */
const getKarmaCodeCoverage = cwd => new Promise(async (resolve) => {
    const packageJSON = await Package.readPackageJSON();
    const angularVersion = semver.clean(packageJSON.dependencies['@angular/core']);
    const shouldUseDefaultConfig = semver.satisfies(angularVersion, '<=5.5.x');

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
    await shell.exec(testCommand, { cwd });
    resolve();
});
/* eslint-enable max-len */

/* eslint-disable max-len, no-plusplus */
const copyFilesToUploadDirectory = (files, pathToFiles) => new Promise(async (resolve, reject) => {
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
                    await copyFilesToUploadDirectory(constants.test.karma.files, path.join(cwd, 'coverage'));
                    await changeFileStructure(constants.test.karma.files, path.join(cwd, constants.fs.directory));
                    return resolve();
                }
                default: {
                    logger.warn(`Code coverage for framework '${framework}@${version}' is not yet supported`);
                    return resolve();
                }
            }
            /* eslint-enable indent */
        }
        logger.info('Testing is not set up, coverage will not be generated / submitted');
        return resolve();
    } catch (e) {
        return reject(e);
    }
});

module.exports = { execute };
