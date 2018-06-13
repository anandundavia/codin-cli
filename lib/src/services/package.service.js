const fs = require('fs');
const path = require('path');

const Package = function Package() {
    this.readPackageJSON = () => new Promise((resolve, reject) => {
        const pathToPackageJSON = path.join(process.cwd(), 'package.json');
        fs.readFile(pathToPackageJSON, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(JSON.parse(data));
        });
    });
};

module.exports = new Package();
