const fs = require('fs');
const path = require('path');
const prompt = require('cli-input');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');
const server = require('../services/server.service');


const saveToConfigFile = data => new Promise((resolve, reject) => {
    const file = path.join(constants.fs.directory, constants.fs.config);
    fs.writeFile(file, JSON.stringify(data), (error) => {
        if (error) {
            return reject(error);
        }
        return resolve();
    });
});

const registerNewProject = () => new Promise((resolve, reject) => {
    const pathToPackageJSON = path.join(process.cwd(), 'package.json');
    // eslint-disable-next-line consistent-return
    fs.readFile(pathToPackageJSON, 'utf-8', (err, data) => {
        if (err) {
            return reject(err);
        }
        const json = JSON.parse(data);
        const project = `${json.name}@${json.version}`;
        server.register(project).then((added) => {
            fs.exists(constants.fs.directory, (exists) => {
                if (!exists) {
                    fs.mkdirSync(constants.fs.directory);
                }
                const projectData = { _id: added.project._id, name: project };
                saveToConfigFile(projectData).then(() => {
                    logger.info(`Registered a new project '${project}'`);
                }).catch(reject);
            });
        }).catch((e) => {
            logger.error(`Failed to register project '${project}' ${JSON.stringify(e)}`);
            reject(e);
        });
    });
});

const showProjectOptions = () => new Promise((resolve, reject) => {
    server.projectList().then((list) => {
        const projectNames = list.map(aProject => aProject.name);
        projectNames.push('** Register A New Project **');

        const opts = { list: projectNames, default: projectNames.length };
        const def = prompt.sets.definitions.option.clone();
        def.message = 'Select from the list of existing projects or register a new one (%s)?';
        def.parameters = [`1-${projectNames.length}`];
        opts.prompt = def;
        const ps = prompt();
        ps.select(opts, (err, res, index) => {
            console.log('selected iundex is : ', index);
            if (err || !res) return reject(err || !res);
            if (index === projectNames.length - 1) {
                return registerNewProject().then(resolve).catch(reject);
            }
            const projectData = Object.assign({}, list[index]);
            return saveToConfigFile(projectData).then(() => {
                logger.info(`Configured existing project '${res.value}'`);
                resolve();
            }).catch(reject);
        });
        ps.on('invalid', (line, index) => {
            if (Number.isNaN(index)) {
                logger.error(`'${line}'not a number.`);
            } else {
                logger.error(`'${index}' not a known option index.`);
            }
        });
    }).catch(reject);
});

const execute = () => showProjectOptions();

module.exports = { execute };
