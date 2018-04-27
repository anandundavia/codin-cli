const fs = require('fs');
const os = require('os');
const path = require('path');
const constants = require('../../config/constants');

const Cookie = function Cookie() {
    const pathToCookie = path.join(os.homedir(), constants.fs.creadentials);
    this.set = cookie => new Promise((resolve, reject) => {
        fs.writeFile(pathToCookie, cookie, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });

    this.get = () => new Promise((resolve, reject) => {
        fs.readFile(pathToCookie, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
};

module.exports = new Cookie();
