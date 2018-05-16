const tslint = require('../helpers/tslint.helper');
const summary = require('../helpers/summary.helper');
const quality = require('../helpers/quality.helper');

const logger = require('../services/logger.service');

const execute = async () => {
    try {
        const cwd = process.cwd();
        // await tslint.execute(cwd);
        // await summary.execute(cwd);
        await quality.execute(cwd);
    } catch (e) {
        logger.error(e);
    }
};

module.exports = { execute };
