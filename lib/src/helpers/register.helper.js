const fs = require('fs');
const path = require('path');

const logger = require('../services/logger.service');
const server = require('../services/server.service');

const execute = () => new Promise(async (resolve, reject) => {
    const cwd = process.cwd();
    const pathToPackageJSON = path.join(cwd, 'package.json');
    // eslint-disable-next-line consistent-return
    fs.readFile(pathToPackageJSON, 'utf-8', (err, data) => {
        if (err) {
            return reject(err);
        }
        const json = JSON.parse(data);
        const project = `${json.name}@${json.version}`;
        server.register(project).then(() => {
            logger.info(`Registered project '${project}'`);
            resolve();
        }).catch((e) => {
            logger.info(`Failed to register project '${project}' ${e}`);
            reject(e);
        });
    });
});

module.exports = { execute };
