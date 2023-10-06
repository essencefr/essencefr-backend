/**
 * Timer module
 */

const logger = require('../logger');

/**
 * Execute a callback and measure its execution time. Messages are log at beginning and end of the callback execution.
 * @param {String} callbackName pretty callback name to use in the log
 * @param {reference} callback 
 */
async function executeAndLogPerformance(callbackName, callback) {
    logger.info(`${callbackName} - START`);
    const startTime = performance.now();  // start timer

    const returnValue = await callback();

    const elapsedTime = Math.round(performance.now() - startTime);
    logger.info(`${callbackName} - END`, { elapsedTimeInMs: elapsedTime });  // divide by a million to get nano to milli

    return returnValue;
}

module.exports.executeAndLogPerformance = executeAndLogPerformance;