const path = require('path');

const logger = require('../services/logger.service');
const constants = require('../../config/constants');
const login = require('../helpers/login.helper');
const compress = require('../helpers/compress.helper');
const upload = require('../helpers/upload.helper');

const execute = async () => {
    try {
        await login.execute();
        const cwd = process.cwd();
        const filesToCompress = [
            path.join(cwd, constants.fs.directory, constants.fs.lint), // lint.json
            path.join(cwd, constants.fs.directory, constants.fs.summary), // summary.json
            path.join(cwd, constants.fs.directory, constants.fs.quality), // quality.json
            path.join(cwd, constants.fs.directory, constants.fs.coverage), // coverage.json
        ];
        const compressedFile = await compress.execute(filesToCompress);
        const msg = await upload.execute(compressedFile);
        if (msg.message === 'UPLOADED') {
            logger.info('Report uploaded successfully');
        } else {
            logger.error(`Something went wrong while uploading the report. Response: ${JSON.stringify(msg)}`);
        }
    } catch (e) {
        logger.error(e);
    }
};

module.exports = { execute };
