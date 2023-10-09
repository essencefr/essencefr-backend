/**
 * Wrapper called to save/update the raw data into the different collections
 */

const { convertStationsFormat } = require('../../../utils/convert');
const { runInNewMongooseTransaction } = require('../../../utils/transactions');
const { updateStationsCollection } = require('./stations');
const { executeAndLogPerformance } = require('../../../utils/timer');

/**
 * Takes stations raw data and save/update documents in the DB
 * @param {Array<Object>} stationRawObjectList raw data provided by the gov API
 */
async function processRawData(stationRawObjectList) {
    let stationObjectList = null;
    await executeAndLogPerformance('generate station object list', 'silly', async () => {
        stationObjectList = convertStationsFormat(stationRawObjectList);
    });
    for(let i=0; i<stationObjectList.length; i++){
        await executeAndLogPerformance(`Processing object ${i+1}/${stationObjectList.length} (stationId: ${stationObjectList[i]._id})`, 'info', async () => {
            try {
                await runInNewMongooseTransaction(async (session) => {
                    await updateStationsCollection([stationObjectList[i]], session);
                });
            } catch (error) {
                error.message = 'Process raw data > ' + error.message;  // update error message
                throw error;  // re-throw
            };
        });
    }
};

module.exports.processRawData = async (stationRawObjectList) => { await executeAndLogPerformance('Process raw data', 'info', async () => { await processRawData(stationRawObjectList) }) };