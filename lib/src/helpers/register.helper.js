const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

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
            const registerNewProjectOption = '** Register A New Project **';

            const projectNames = list.map(aProject => aProject.name);
            projectNames.push(registerNewProjectOption);

            const prompts = [{
                type: 'list',
                name: 'projectName',
                message: 'Select from the list of existing projects or Register a new project',
                choices: projectNames,
                paginated: false,
                pageSize: projectNames.length,
                filter: val => val.toLowerCase(),
            }];

            inquirer.prompt(prompts).then((answers) => {
                const selectProjectName = answers.projectName;
                if (selectProjectName === registerNewProjectOption) {
                    return registerNewProject().then((name) => {
                        logger.info(`Registered a new project '${name}'`);
                        resolve(true);
                    }).catch(reject);
                }
                const projectIndex = projectNames.findIndex(k => k === selectProjectName);
                const projectData = Object.assign({}, list[projectIndex]);
                return saveToConfigFile(projectData).then(() => {
                    logger.info(`Configured existing project '${projectData}'`);
                    resolve(false);
                }).catch(reject);
            }).catch(reject);
        })
        .catch(reject);
});

module.exports = { execute };
