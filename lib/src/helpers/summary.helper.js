const _ = require('lodash');

const fs = require('fs');
const path = require('path');

const logger = require('../services/logger.service');
const constants = require('../../config/constants');


const execute = cwd => new Promise((resolve, reject) => {
    try {
        const reportPath = path.join(cwd, constants.fs.directory, constants.fs.json);
        fs.readFile(reportPath, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            logger.info('Generating report summary');
            const json = JSON.parse(data);
            const total = json.length;
            const errorsAndWarnings = _.groupBy(json, aJson => aJson.ruleSeverity);
            // -> { ERROR: [], WARNING: [] }
            const errorCounts = _.countBy(errorsAndWarnings.ERROR, x => x.ruleName);
            const warningCounts = _.countBy(errorsAndWarnings.WARNING, x => x.ruleName);

            const summary = {
                lint: {
                    total,
                    totalErrors: errorsAndWarnings.ERROR ? errorsAndWarnings.ERROR.length : 0,
                    totalWarnings: errorsAndWarnings.WARNING ? errorsAndWarnings.WARNING.length : 0,
                    errorCounts,
                    warningCounts,
                },
            };
            const summaryPath = path.join(cwd, constants.fs.directory, constants.fs.summary);
            return fs.writeFile(summaryPath, JSON.stringify(summary), (e) => {
                if (e) {
                    return reject(e);
                }
                logger.info('Generated report summary');
                return resolve();
            });
        });
    } catch (e) {
        reject(e);
    }
});

module.exports = { execute };

