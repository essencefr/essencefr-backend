/**
 * Module for setting up logging features
 */

require('express-async-errors');  // -> activates the middleware errors catching in routes handlers
const logger = require('../logger');

module.exports = function() {
    // process.on('uncaughtException', (e) => {
    //     // console.error(`Caught exception: ${e}\n` + `Exception origin: ${e.stack}`);
    //     console.error(`Caught exception: ${e}\n` + `Exception origin: ${e.stack}`);
    //     process.exit(1);
    // });
    // process.on('unhandledRejection', (reason, p) => {
    //     // console.error(`Unhandled Rejection at: ${p}\n` + `reason: ${reason}`);
    //     logger.error(`Unhandled Rejection at: ${p}\n` + `reason: ${reason}`);
    //     process.exit(1);
    // });
}