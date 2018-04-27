const constants = require('./constants');
const program = require('commander');
const { registerHandlers, dispatch } = require('../src/dispatchers/main.dispatcher');

registerHandlers(program)
    .version(constants.version)
    .parse(process.argv);

dispatch(program);
