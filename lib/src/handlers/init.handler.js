const login = require('../helpers/login.helper');
const logger = require('../services/logger.service');
const register = require('../helpers/register.helper');
const gitHook = require('../helpers/githook.helper');

const execute = async () => {
    try {
        await login.execute();
        await register.execute();
        // TODO: Give the option to user whether he wants to set it on commits or on push
        // if (isNewProject) {
        //     await gitHook.execute();
        // }
        logger.info('Code Investigator initialized successfully.');
    } catch (e) {
        logger.error(e);
    }
};

module.exports = { execute };
