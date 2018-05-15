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

const registerNewProject = projectType => new Promise((resolve, reject) => {
    const pathToPackageJSON = path.join(process.cwd(), 'package.json');
    fs.readFile(pathToPackageJSON, 'utf-8', (err, data) => {
        if (err) {
            return reject(err);
        }
        const json = JSON.parse(data);
        const projectName = `${json.name}@${json.version}`;
        const project = {
            name: projectName,
            type: projectType,
        };
        return server.register(project).then((added) => {
            const projectData = { _id: added.project._id, ...project };
            return saveToConfigFile(projectData).then(() => {
                resolve(projectName);
            }).catch(reject);
        }).catch((e) => {
            logger.error(`Failed to register project '${project}' ${JSON.stringify(e)}`);
            reject(e);
        });
    });
});

const getProjectType = () => new Promise((resolve, reject) => {
    const listOfProjectTypes = constants.projects.list;
    const prompts = [{
        type: 'list',
        name: 'projectType',
        message: 'Select type of the project',
        choices: listOfProjectTypes,
        paginated: false,
        pageSize: listOfProjectTypes.length,
        filter: val => val.toLowerCase(),
    }];

    inquirer.prompt(prompts).then((answers) => {
        resolve(answers.projectType);
    }).catch(reject);
});

const execute = () => new Promise(async (resolve, reject) => {
    try {
        const projectType = await getProjectType();
        logger.info(`Fetching your ${projectType} projects. Please wait...`);
        const allProjects = await server.projectList();
        const list = allProjects.filter(aProject => aProject.type === projectType);
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
            if (selectProjectName === registerNewProjectOption.toLowerCase()) {
                return registerNewProject(projectType).then((name) => {
                    logger.info(`Registered a new ${projectType} project '${name}'`);
                    resolve(true);
                }).catch(reject);
            }
            const projectIndex = projectNames.findIndex(k => k === selectProjectName);
            const projectData = Object.assign({}, list[projectIndex]);
            return saveToConfigFile(projectData).then(() => {
                logger.info(`Configured existing project '${projectData.name}'`);
                resolve(false);
            }).catch(reject);
        }).catch(reject);
    } catch (e) {
        reject(e);
    }
});

module.exports = { execute };
