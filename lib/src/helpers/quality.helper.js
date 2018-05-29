/* eslint-disable */
const _ = require('lodash');

const fs = require('fs');
const path = require('path');
// const escomplex = require('typhonjs-escomplex');

const logger = require('../services/logger.service');
const constants = require('../../config/constants');

const data = [];
let summary = {};
let numberOfFilesProcessed = 0;

const calculateCyclomaticComplexity = cwd => new Promise((resolve, reject) => {
    const pathToReport = path.join(cwd, constants.fs.directory, constants.fs.lint);
    if (!fs.existsSync(pathToReport)) {
        logger.warn(`File "${constants.fs.lint}" not found. Cylcomatic complexity will not be calculated`);
        return resolve();
    }
    const json = JSON.parse(fs.readFileSync(pathToReport, 'utf-8'));
    /* eslint-disable no-param-reassign */
    const cyclomaticErrors = _
        .chain(json)
        .filter({ ruleName: 'cyclomatic-complexity' }) // Filtering
        // error.name is filename
        .groupBy(error => error.name) // Grouping by file name -> fileName : []
        .map(errorsOfAFile => // For each fileName
            _.reduce(errorsOfAFile, (result, value) => {
                const failureText = value.failure;
                // The regex that will match the given complexity
                const regex = /has a cyclomatic complexity of (.*) which is higher than the threshold of/gm;
                const matched = regex.exec(failureText);
                // matched will ALWAYS BE there
                if (matched) {
                    const complexity = Number.parseInt(matched[1], 10);
                    result.name = value.name.split('/').join('\\').replace(`${cwd}${path.sep}`, '');
                    result.totalFunctions = result.totalFunctions || 0;
                    result.totalComplexity = result.totalComplexity || 0;
                    result.maximumComplexity = result.maximumComplexity || 0;

                    result.totalFunctions += 1;
                    result.totalComplexity += complexity;
                    result.maximumComplexity =
                        Math.max(result.maximumComplexity, complexity);
                    return result;
                }
                // Ideally, this should not happen
                return {};
            }, {}))
        .value();
    /* eslint-enable no-param-reassign */
    const pathToWrite = path.join(cwd, constants.fs.directory, 'complexity.json');
    return fs.writeFile(pathToWrite, JSON.stringify(cyclomaticErrors), (err) => {
        if (err) {
            return reject(err);
        }
        return resolve();
    });
});

const analyzeFile = (parent, fileName) => {
    const key = fileName.replace(`${parent}${path.sep}`, '');
    try {
        const contents = fs.readFileSync(fileName, 'utf-8');
        const report = {};

        // Add the needed fields in the object
        const obj = {
            ...report.methodAggregate,
            maintainability: report.maintainability,
            name: key,
        };

        // Remove unwanted fields from the report
        delete obj.halstead.operands;
        delete obj.halstead.operators;

        // Update the summary
        // mergeWith RECURSIVELY iterates over the object and will call the function
        // The function in turn sums the values
        const customizer = (objValue, srcValue) => {
            if (typeof objValue === 'number') {
                return objValue + srcValue;
            }
            if (typeof objValue === 'object') {
                return _.mergeWith(objValue, srcValue, customizer);
            }
            return undefined;
        };
        summary = _.mergeWith(summary, obj, customizer);

        // Push the obect in the data
        data.push(obj);

        // Update the number of files processed
        numberOfFilesProcessed += 1;
    } catch (e) {
        logger.error(`Can not analyze "${key}". Reason: ${JSON.stringify(e)}`);
    }
};

const explore = (parent, dir, callback) => {
    if (dir.includes('node_modules')) return;
    if (fs.lstatSync(dir).isDirectory()) {
        fs.readdirSync(dir).map(child => explore(parent, path.join(dir, child), callback));
    } else if (dir.match(/[^.spec][^.d]\.js?$/)) {
        // Regex that matches all the files ending with .js
        // But not ending with .test.js or .spec.js or .d.js
        callback(parent, dir);
    }
};

const execute = (root, cwd) => new Promise(async (resolve, reject) => {
    logger.warn('quality.helper.js is deprecated. Use quality.v2.helper.js instead');
    try {
        logger.info('Analyzing source files for quality');
        explore(cwd, cwd, analyzeFile);
        await calculateCyclomaticComplexity(root);
        if (numberOfFilesProcessed === 0) {
            logger.warn('Explorer could not analyze any files. quality.json will not be generated');
        } else {
            // Divide the accumulated summary with the numberOfFiles numberOfFilesProcessed
            const customizer = (objValue, srcValue) => {
                if (typeof srcValue === 'number') {
                    return srcValue / numberOfFilesProcessed;
                }
                if (typeof srcValue === 'object') {
                    return _.assignInWith(objValue, srcValue, customizer);
                }
                return undefined;
            };
            summary = _.assignInWith({}, summary, customizer);

            // Add the summary to the summary.json
            const pathToSummary = path.join(root, constants.fs.directory, constants.fs.summary);
            let existingSummary = {};
            if (fs.existsSync(pathToSummary)) {
                existingSummary = JSON.parse(fs.readFileSync(pathToSummary, 'utf-8'));
            }
            existingSummary.quality = summary;
            fs.writeFileSync(pathToSummary, JSON.stringify(existingSummary));

            // Add the data to the quality.json
            const pathToQuality = path.join(root, constants.fs.directory, constants.fs.quality);
            fs.writeFileSync(pathToQuality, JSON.stringify(data));
            logger.info('Quality reports generated successfully');
            resolve();
        }
    } catch (e) {
        reject(e);
    }
});

module.exports = { execute };
