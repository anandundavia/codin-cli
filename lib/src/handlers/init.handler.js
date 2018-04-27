const login = require('../helpers/login.helper');
const logger = require('../services/logger.service');
const register = require('../helpers/register.helper');
const gitHook = require('../helpers/githook.helper');

const execute = async () => {
    try {
        await login.execute();
        const isNewProject = await register.execute();
        if (isNewProject) {
            await gitHook.execute();
        }
        logger.info('Code Investigator initialized successfully.');
    } catch (e) {
        logger.error(e);
    }
};

module.exports = { execute };
