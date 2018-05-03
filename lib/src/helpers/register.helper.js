const fs = require('fs');
const path = require('path');
const prompt = require('cli-input');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');
const server = require('../services/server.service');


const saveToConfigFile = data => new Promise((resolve, reject) => {
    fs.exists(constants.fs.directory, (exists) => {
        if (!exists) {
            fs.mkdirSync(constants.fs.directory);
        }
        const file = path.join(constants.fs.directory, constants.fs.config);
        fs.writeFile(file, JSON.stringify(data), (error) => {
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
});

const registerNewProject = () => new Promise((resolve, reject) => {
    const pathToPackageJSON = path.join(process.cwd(), 'package.json');
    fs.readFile(pathToPackageJSON, 'utf-8', (err, data) => {
        if (err) {
            return reject(err);
        }
        const json = JSON.parse(data);
        const project = `${json.name}@${json.version}`;
        return server.register(project).then((added) => {
            const projectData = { _id: added.project._id, name: project };
            return saveToConfigFile(projectData).then(() => {
                resolve(project);
            }).catch(reject);
        }).catch((e) => {
            logger.error(`Failed to register project '${project}' ${JSON.stringify(e)}`);
            reject(e);
        });
    });
});

const execute = () => new Promise((resolve, reject) => {
    logger.info('Fetching your projects. Please wait...');
    server
        .projectList()
        .then((list) => {
            const projectNames = list.map(aProject => aProject.name);
            projectNames.push('** Register A New Project **');

            const def = prompt.sets.definitions.option.clone();
            def.message = 'Select from the list of existing projects or Register a new project (%s)';
            def.parameters = [`1-${projectNames.length}`];

            const opts = {
                list: projectNames,
                default: projectNames.length - 1,
                prompt: def,
            };
            const ps = prompt({ trim: true, delimiter: '>' });
            ps.select(opts, (err, res, index) => {
                ps.close();
                if (err || !res) {
                    return reject(err || !res);
                }
                if (index === projectNames.length - 1) {
                    return registerNewProject().then((name) => {
                        logger.info(`Registered a new project '${name}'`);
                        resolve();
                    }).catch(reject);
                }
                const projectData = Object.assign({}, list[index]);
                return saveToConfigFile(projectData).then(() => {
                    logger.info(`Configured existing project '${res.value}'`);
                    resolve();
                }).catch(reject);
            });
            ps.on('invalid', (line, index) => {
                if (Number.isNaN(index)) {
                    return logger.error(`'${line}'not a number.`);
                }
                return logger.error(`'${index}' not a known option index.`);
            });
        })
        .catch(reject);
});

module.exports = { execute };
