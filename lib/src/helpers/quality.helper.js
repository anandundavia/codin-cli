const _ = require('lodash');

const fs = require('fs');
const path = require('path');
const escomplex = require('typhonjs-escomplex');

const logger = require('../services/logger.service');
const constants = require('../../config/constants');

let success = 0;
let errors = 0;

const explore = (dir) => {
    if (dir.includes('node_modules')) return;
    if (fs.lstatSync(dir).isDirectory()) {
        fs.readdirSync(dir).map(child => explore(path.join(dir, child)));
    } else {
        const fileName = dir;
        // Regex that matches all the files ending with .ts
        // But not ending with .spec.ts or .d.ts
        if (fileName.match(/[^.spec][^.d]\.ts?$/)) {
            try {
                const contents = fs.readFileSync(fileName, 'utf-8');
                const report = escomplex.analyzeModule(contents);
                // console.log(fileName);
                // console.log(report.methodAggregate);
                success++;
            } catch (e) {
                console.log(fileName);
                // console.log(e);
            }
        }
    }
};

const execute = cwd => new Promise(async (resolve, reject) => {
    try {
        explore(cwd);
        console.log(success);
        console.log(errors);
    } catch (e) {
        reject(e);
    }
});

module.exports = { execute };