const fs = require('fs');
const path = require('path');
const constants = require('../../config/constants');

const Cookie = function Cookie() {
    this.set = cookie => new Promise((resolve, reject) => {
        const pathToCookie = path.join(constants.fs.directory, constants.fs.creadentials);
        fs.writeFile(pathToCookie, cookie, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });

    this.get = () => new Promise((resolve, reject) => {
        const pathToCookie = path.join(constants.fs.directory, constants.fs.creadentials);
        fs.readFile(pathToCookie, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
};

module.exports = new Cookie();
