const _ = require('lodash');

const fs = require('fs');
const path = require('path');
const escomplex = require('typhonjs-escomplex');

const logger = require('../services/logger.service');
const constants = require('../../config/constants');

const data = {};
let summary = {};
let numberOfFilesProcessed = 0;

const analyzeFile = (parent, fileName) => {
    const key = fileName.replace(`${parent}${path.sep}`, '');
    try {
        const contents = fs.readFileSync(fileName, 'utf-8');
        const report = escomplex.analyzeModule(contents);

        // Add the needed fields in the object
        data[key] = { ...report.methodAggregate, maintainability: report.maintainability };
        // Remove unwanted fields from the report
        delete data[key].halstead.operands;
        delete data[key].halstead.operators;

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
        summary = _.mergeWith(summary, data[key], customizer);

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
    try {
        logger.info('Analyzing source files for quality');
        explore(cwd, cwd, analyzeFile);
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
