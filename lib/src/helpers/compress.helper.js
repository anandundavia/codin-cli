const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const logger = require('../services/logger.service');


const execute = file => new Promise((resolve, reject) => {
    if (!fs.existsSync(file)) {
        const msg = 'Please generate tslint report first using "codin -g"';
        logger.error(msg);
        reject();
    }
    if (!fs.lstatSync(file).isFile) {
        const msg = `Path "${file}" does not resolve to a file.`;
        logger.error(msg);
        reject(new Error(msg));
    }
    const fileName = path.basename(file);
    // It should ieally be constants.fs.compressed.
    // But for the sake of reuse-ability, append the .gz to filename
    const compressed = `${file}.gz`;
    const compressedName = path.basename(compressed);
    logger.info(`Compressing ${fileName}`);
    const gzip = zlib.createGzip();
    const inp = fs.createReadStream(file);
    const out = fs.createWriteStream(compressed);
    inp.pipe(gzip).pipe(out);
    out.on('finish', () => {
        logger.info(`Successfully compressed ${fileName} to ${compressedName}`);
        resolve(compressed);
    });
});

module.exports = { execute };
