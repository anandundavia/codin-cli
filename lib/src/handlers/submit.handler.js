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
        const fileToCompress = path.join(cwd, constants.fs.directory, constants.fs.json);
        const compressedFile = await compress.execute(fileToCompress);
        const msg = await upload.execute(compressedFile);
        logger.info(msg);
    } catch (e) {
        logger.error(e);
    }
};

module.exports = { execute };
