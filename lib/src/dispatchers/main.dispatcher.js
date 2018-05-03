const init = require('../handlers/init.handler');
const generate = require('../handlers/generate.handler');
const submit = require('../handlers/submit.handler');

const logger = require('../services/logger.service');

// They are to be defined in the sequnce
// they need to be executed when multiple
// shorthands are passed
const handlers = [{
    shortHand: 'i',
    command: 'init',
    description: 'Initialize Code Investigator in current Angular Project',
    handler: init,
}, {
    shortHand: 'g',
    command: 'generate',
    description: 'Generate the tslint report and submit it to the server',
    handler: generate,
}, {
    shortHand: 's',
    command: 'submit',
    description: 'Generate the tslint report and submit it to the server',
    handler: submit,
}];

// Resigter the 'argument' property for all the handlers
(() => {
    handlers.forEach((aHandler) => {
        Object.defineProperty(aHandler, 'argument', {
            value: (() => `-${aHandler.shortHand} --${aHandler.command}`)(),
        });
    });
})();

const registerHandlers = (program) => {
    handlers.forEach(aHandler => program.option(
        aHandler.argument,
        aHandler.description,
    ));
    return program;
};

const dispatch = async (program) => {
    const handlersToExecute = handlers.filter(aHandler => program[aHandler.command]);

    for(const aHandler of handlersToExecute) {
        logger.info(`EXECUTING "${aHandler.command}"`);
        await aHandler.handler.execute();
    }
};

module.exports = { registerHandlers, dispatch };
