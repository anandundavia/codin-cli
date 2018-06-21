const constants = require('./constants');
const program = require('commander');

// To use codin codin -i, codin -g, codin -s commands, use option.dispatcher
// const { registerHandlers, dispatch } = require('../src/dispatchers/option.dispatcher');

// To use newer codin init, generate and submit commands, use command.dispacher
const { registerHandlers, dispatch } = require('../src/dispatchers/command.dispatcher');

registerHandlers(program)
    .version(constants.version);

// If you are using option.dispatcher, you will have to parse and dispatch arguments separately.
// To do so, add '.parse(process.argv);' after the registerHandlers call

// If you are using command.dispatcher, there's no need for that.

dispatch(program);
