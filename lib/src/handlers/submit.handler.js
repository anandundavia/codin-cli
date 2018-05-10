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
        const json = path.join(cwd, constants.fs.directory, constants.fs.json);
        const summary = path.join(cwd, constants.fs.directory, constants.fs.summary);
        const compressedFile = await compress.execute([json, summary]);
        // const msg = await upload.execute(compressedFile);
        // if (msg.message === 'UPLOADED') {
        //     logger.info('Report uploaded successfully');
        // } else {
        //     logger.error(`Something went wrong while uploading the report. Response: ${JSON.stringify(msg)}`);
        // }
    } catch (e) {
        logger.error(e);
    }
};

module.exports = { execute };
