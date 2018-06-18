const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const tar = require('tar-stream');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');

const pack = (tarPackage, file) => new Promise((resolve, reject) => {
    fs.exists(file, (exists) => {
        if (!exists) {
            const msg = `File "${file}" is required to be submitted but not found. Have you executed "codin -g"?`;
            logger.error(msg);
            return reject(new Error(msg));
        }
        return fs.lstat(file, (err, stats) => {
            if (err) {
                return reject(err);
            }
            if (!stats.isFile) {
                const msg = `Path "${file}" does not resolve to a file.`;
                logger.error(msg);
                return reject(new Error(msg));
            }
            const name = path.basename(file);
            return fs.readFile(file, 'utf-8', (readError, data) => {
                if (readError) {
                    return reject(readError);
                }
                logger.info(`Adding ${name} to tarball`);
                const entry = tarPackage.entry({ name }, data, (error) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve();
                });
                return entry.end();
            });
        });
    });
});

const execute = files => new Promise(async (resolve, reject) => {
    try {
        const tarPackage = tar.pack();
        for (let index = 0; index < files.length; index += 1) {
            const aFile = files[index];
            // eslint-disable-next-line no-await-in-loop
            await pack(tarPackage, aFile);
        }
        tarPackage.finalize();
        // eslint-disable-next-line max-len
        const compressed = path.join(process.cwd(), constants.fs.directory, constants.fs.compressed);
        const gzip = zlib.createGzip();
        const out = fs.createWriteStream(compressed);
        logger.info('Compressing tarball');
        tarPackage.pipe(gzip).pipe(out);
        out.on('finish', () => {
            logger.info(`Successfully generated ${constants.fs.compressed}`);
            resolve(compressed);
        });
    } catch (e) {
        logger.error(e);
        reject(e);
    }
});

module.exports = { execute };
