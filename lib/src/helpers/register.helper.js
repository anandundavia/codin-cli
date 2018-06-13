const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const constants = require('../../config/constants');
const logger = require('../services/logger.service');
const server = require('../services/server.service');
const Package = require('../services/package.service');

const getProjectName = () => new Promise(async (resolve, reject) => {
    try {
        const json = await Package.readPackageJSON();
        return resolve(`${json.name}@${json.version}`);
    } catch (e) {
        return reject(e);
    }
});

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

const registerNewProject = project => new Promise(async (resolve, reject) => {
    try {
        const added = await server.register(project);
        const projectData = { _id: added.project._id, ...project };
        await saveToConfigFile(projectData);
        return resolve();
    } catch (e) {
        logger.error(`Failed to register project ${JSON.stringify(e)}`);
        return reject(e);
    }
});

const getProjectType = () => new Promise(async (resolve, reject) => {
    try {
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
        const answers = await inquirer.prompt(prompts);
        return resolve(answers.projectType);
    } catch (e) {
        return reject(e);
    }
});

const getAngularSpecificInformation = () => new Promise(async (resolve, reject) => {
    /**
     * codin supports two testing frameworks => 1. Karma and 2. Jest
     * For the most Angular projects, Karma will be the default project runner
     */
    const _getTestingInformation = () => new Promise(async (res, rej) => {
        try {
            const prompts = [{
                type: 'confirm',
                name: 'setupTesting',
                message: 'Do you want to setup testing? [ Setting up testing will help you track code coverage ]',
            }];
            const answers = await inquirer.prompt(prompts);
            if (answers.setupTesting) {
                const json = await Package.readPackageJSON();
                const existingTestCommand = json.scripts.test;

                // Let us check if the existing test command is ng test
                if (existingTestCommand && existingTestCommand.includes('ng test')) {
                    // That means the testing framework is Karma
                    logger.info(`"${existingTestCommand}" will be used for finding the coverage`);
                    const karmaVersion = json.devDependencies.karma;
                    return res({
                        command: existingTestCommand,
                        framework: 'karma',
                        version: karmaVersion,
                        coverage: constants.test.karma.coverage,
                    });
                }
                logger.warn('Testing frameworks other than Karma are not yet supported. Testing information will not be taken');
                return res({}); // Resolve to empty object as of now

                // Testing framework is not karma, it can mostly be jest or any other framework
                // Take user input
                // To be done in v2
                // const prompts = [{
                //     name: 'testCommand',
                //     type: 'input',
                //     message: 'Enter your test command (it will be used to find code coverage)',
                //     validate: value => !!value, // It means return value ? true : false
                // }];
                // const answer = await inquirer.prompt(prompts);
                // return resolve(answer.testCommand);
            }
            logger.info('Skipping testing setup. Code coverage will not be tracked');
            return res({}); // Resolve to empty object
        } catch (e) {
            return rej(e);
        }
    });
    try {
        const angular = {};
        angular.test = await _getTestingInformation();
        return resolve(angular);
    } catch (e) {
        return reject(e);
    }
});

const getProjectTypeSpecificInformation = projectType => new Promise(async (resolve, reject) => {
    try {
        /* eslint-disable indent */
        switch (projectType) {
            case 'angular': { // MUST BE as same one of constants.projects.list
                const angular = await getAngularSpecificInformation();
                return resolve(angular);
            }
            default: {
                logger.warn(`Project type ${projectType} is not completely supported yet. Skipping some optional setup`);
                return resolve({});
            }
        }
        /* eslint-enable indent */
    } catch (e) {
        return reject(e);
    }
});

const execute = () => new Promise(async (resolve, reject) => {
    try {
        const projectType = await getProjectType();
        logger.info(`Fetching your ${projectType} projects. Please wait...`);
        const allProjects = await server.projectList();

        // Filter all the projects based on the project type
        const list = allProjects.filter(aProject => aProject.type === projectType);

        const newProjectName = await getProjectName();
        const registerNewProjectOption = `** Register A New Project ** (${newProjectName})`;
        // Filter out just names
        const projectNames = list.map(aProject => aProject.name);
        // Add the default, new project option in the list
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

        const answers = await inquirer.prompt(prompts);
        const selectedProjectName = answers.projectName;
        if (selectedProjectName === registerNewProjectOption.toLowerCase()) {
            const name = newProjectName;
            const projectTypeSpecificInfo = await getProjectTypeSpecificInformation(projectType);
            const project = { name, type: projectType, ...projectTypeSpecificInfo };
            await registerNewProject(project);
            logger.info(`Registered a new ${projectType} project '${name}'`);
            return resolve(true); // It is a new project
        }

        const projectIndex = projectNames.findIndex(k => k === selectedProjectName);
        const projectData = Object.assign({}, list[projectIndex]);
        delete projectData.contributors;
        delete projectData.meta;
        await saveToConfigFile(projectData);
        logger.info(`Configured existing project '${projectData.name}'`);
        return resolve(false); //  It is not a new project
    } catch (e) {
        return reject(e);
    }
});

module.exports = { execute };
