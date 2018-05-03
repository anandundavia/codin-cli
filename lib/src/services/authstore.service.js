const fs = require('fs');
const path = require('path');
const os = require('os');

const constants = require('../../config/constants');

const AuthStore = function AuthStore() {
    const pathToCredentials = path.join(os.homedir(), constants.fs.creadentials);

    this.getCredentials = () => new Promise((resolve) => {
        fs.readFile(pathToCredentials, 'utf-8', (err, data) => {
            if (err) {
                return resolve(null);
            }
            return resolve(JSON.parse(data));
        });
    });

    this.setCredentials = credentials => new Promise((resolve, reject) => {
        fs.writeFile(pathToCredentials, JSON.stringify(credentials), (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
};

module.exports = new AuthStore();
