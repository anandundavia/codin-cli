const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const server = require('../services/server.service');
const logger = require('../services/logger.service');
const constants = require('../../config/constants');
const login = require('../helpers/login.helper');

const compress = file => new Promise((resolve, reject) => {
    if (!fs.existsSync(file)) {
        const msg = 'Please generate tslint report first using "codein -g"';
        logger.error(msg);
        reject();
    }
    if (!fs.lstatSync(file).isFile) {
        const msg = `Path "${file}" does not resolve to a file.`;
        logger.error(msg);
        reject(new Error(msg));
    }
    const fileName = path.basename(file);
    const compressed = `${file}.gz`;
    const compressedName = path.basename(compressed);
    logger.info(`Compressing ${fileName}`);
    const gzip = zlib.createGzip();
    const inp = fs.createReadStream(file);
    // It should ieally be constants.fs.compressed.
    // But for the sake of reuse-ability, append the .gz to filename
    const out = fs.createWriteStream(compressed);
    inp.pipe(gzip).pipe(out);
    out.on('finish', () => {
        logger.info(`Successfully compressed ${fileName} to ${compressedName}`);
        resolve(compressed);
    });
});


const upload = file => new Promise((resolve, reject) => {
    if (!fs.existsSync(file)) {
        const msg = `No file exisits at path "${file}"`;
        logger.error(msg);
        reject(new Error(msg));
    }
    if (!fs.lstatSync(file).isFile) {
        const msg = `Path "${file}" does not resolve to a file.`;
        logger.error(msg);
        reject(new Error(msg));
    }
    server.upload(file).then(resolve).catch(reject);
});

const execute = async () => {
    try {
        await login.execute();
        const cwd = process.cwd();
        const fileToCompress = path.join(cwd, constants.fs.directory, constants.fs.json);
        const compressedFile = await compress(fileToCompress);
        const msg = await upload(compressedFile);
        logger.info(msg);
    } catch (e) {
        logger.error(e);
    }
};

module.exports = { execute };
