const fs = require('fs');
const path = require('path');
const tscomplex = require('ts-complex');

const logger = require('../services/logger.service');
const constants = require('../../config/constants');

const data = [];

const summarize = (array) => {
    // Each object of the array will have maintainability, and name keys
    // name -> file name
    // maintainability -> { minMaintainability, averageMaintainability }
    // We are to find average of them
    const summary = { minMaintainability: 0, averageMaintainability: 0 };
    let count = 0;
    array.forEach((anReport) => {
        if (anReport.maintainability.averageMaintainability > 0) {
            summary.averageMaintainability += anReport.maintainability.averageMaintainability;
            summary.minMaintainability += anReport.maintainability.minMaintainability;
            count += 1;
        }
    });
    summary.averageMaintainability /= count;
    summary.minMaintainability /= count;

    return summary;
};

const analyzeFile = (parent, fileName) => {
    const key = fileName.replace(`${parent}${path.sep}`, '');
    try {
        const report = tscomplex.calculateMaintainability(fileName);
        const obj = { maintainability: report, name: key };
        // Push the obect in the data
        data.push(obj);
    } catch (e) {
        logger.error(`Can not analyze "${key}". Reason: ${JSON.stringify(e)}`);
    }
};

const explore = (parent, dir, callback) => {
    if (dir.includes('node_modules')) return;
    if (dir.includes('.git')) return;
    if (fs.lstatSync(dir).isDirectory()) {
        fs.readdirSync(dir).map(child => explore(parent, path.join(dir, child), callback));
    } else if (dir.match(/[^.spec][^.d]\.ts?$/)) {
        // Regex that matches all the files ending with .ts
        // But not ending with .spec.ts or .d.ts
        callback(parent, dir);
    }
};

const execute = cwd => new Promise(async (resolve, reject) => {
    try {
        logger.info('Analyzing source files for quality');
        explore(cwd, cwd, analyzeFile);
        if (data.length === 0) {
            logger.warn('Explorer could not analyze any files. quality.json will not be generated');
        } else {
            const summary = summarize(data);
            // Add the summary to the summary.json
            const pathToSummary = path.join(cwd, constants.fs.directory, constants.fs.summary);
            let existingSummary = {};
            if (fs.existsSync(pathToSummary)) {
                existingSummary = JSON.parse(fs.readFileSync(pathToSummary, 'utf-8'));
            }
            existingSummary.quality = summary;
            fs.writeFileSync(pathToSummary, JSON.stringify(existingSummary));

            // Add the data to the quality.json
            const pathToQuality = path.join(cwd, constants.fs.directory, constants.fs.quality);
            fs.writeFileSync(pathToQuality, JSON.stringify(data));
            logger.info('Quality reports generated successfully');
            resolve();
        }
    } catch (e) {
        reject(e);
    }
});

module.exports = { execute };
