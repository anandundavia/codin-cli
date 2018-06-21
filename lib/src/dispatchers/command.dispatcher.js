const init = require('../handlers/init.handler');
const generate = require('../handlers/generate.handler');
const submit = require('../handlers/submit.handler');

const logger = require('../services/logger.service');
const server = require('../services/server.service');

// They are to be defined in the sequence
// they need to be executed when multiple
// short-hands are passed
const handlers = [{
    shortHand: 'i',
    command: 'init',
    description: 'Initialize Code Investigator in current Angular Project',
    handler: init,
    options: [{
        option: '--proxy',
        description: 'HTTP or HTTPS proxy to use connecting to the server',
    }],
}, {
    shortHand: 'g',
    command: 'generate',
    description: 'Generate the lint, code coverage and code quality reports',
    handler: generate,
}, {
    shortHand: 's',
    command: 'submit',
    description: 'Submit the generated reports to the server',
    handler: submit,
    options: [{
        option: '--proxy',
        description: 'HTTP or HTTPS proxy to use connecting to the server',
    }],
}];

const registerHandlers = (program) => {
    handlers.forEach((aHandler) => {
        const _program = program.command(aHandler.command);
        _program.alias(aHandler.shortHand);
        if (aHandler.options) {
            aHandler.options.forEach((anOption) => {
                _program.option(anOption.option, anOption.description);
            });
        }
        // Commander passes the options in the action callback
        // Thus you will have to define the action callback accordingly
        // As of now, we only have one option and that is to use proxy
        // TODO: Refactor the action callback to multiplex the args and calling the handler
        _program.action(async (_proxy) => {
            let proxy = null;
            if (typeof _proxy === 'string') {
                proxy = _proxy;
            }
            server.setProxyAddress(proxy);
            logger.info(`EXECUTING "${aHandler.command}"`);
            try {
                await aHandler.handler.execute();
            } catch (e) {
                logger.error(e);
            }
        });
    });
    return program;
};

const dispatch = (program) => {
    program.parse(process.argv);
};

module.exports = { registerHandlers, dispatch };
