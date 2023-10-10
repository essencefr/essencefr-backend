/**
 * Module with update routine
 */

const logger = require("../../logger");
const { convertStationsFormat } = require("../../utils/convert");
const { fetchStations } = require("../../utils/fetch");
const { executeAndLogPerformance } = require("../../utils/timer");
const { runInNewMongooseTransaction } = require("../../utils/transactions");
const { updateStationsCollection } = require("./collections/stations");

/**
 * Takes stations raw data and save/update documents in the DB
 * @param {Array<Object>} stationRawObjectList raw data provided by the gov API
 * @param {number} bunchSize number of station objects to process together at the same time to increase performance
 * with bunchSize = 50
 *      -> total raw process time = 3 min and very few transaction errors
 *      -> each process of a bunch of objects takes ~ 1 sec
 */
async function processRawData(stationRawObjectList, bunchSize=100) {
    let stationObjectList = null;
    await executeAndLogPerformance('generate station object list', 'silly', async () => {
        stationObjectList = convertStationsFormat(stationRawObjectList);
    });
    // do operations station by station to avoid too many mongoose transaction errors:
    for(let i=0; i<stationObjectList.length; i+=bunchSize){
        const indexMax = (i+bunchSize < stationObjectList.length) ? i+bunchSize : stationObjectList.length-1;
        await executeAndLogPerformance(`Processing object(s) ${i+1} to ${indexMax+1} over ${stationObjectList.length}`, 'info', async () => {
            try {
                await runInNewMongooseTransaction(async (session) => {
                    await updateStationsCollection(stationObjectList.slice(i, indexMax), session);
                });
            } catch (error) {
                error.message = 'Process raw data > ' + error.message;  // update error message
                logger.error(error);
                // throw error;  // re-throw
            };
        });
    }
};

/**
 * Main update routine function.
 * So far it only updates one zone (development version)
 */
async function updateRoutine() {
    try {
        const rawData = await fetchStations();
        await executeAndLogPerformance('Process raw data', 'info', async () => {
            await processRawData(rawData.slice(0, 200));  // TODO remove this limit. Only consider the first 200 objects for test purposes
        });
    } catch (err) {
        logger.error(err);
    }
}

module.exports.processRawData = async (stationRawObjectList, bunchSize=100) => { await executeAndLogPerformance('Process raw data', 'info', async () => { await processRawData(stationRawObjectList, bunchSize) }) };
module.exports.updateRoutine = async () => { await executeAndLogPerformance('Update routine', 'info', async () => { await updateRoutine() }) };