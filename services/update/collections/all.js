/**
 * Wrapper called to save/update the raw data into the different collections
 */

const logger = require('../../../logger');
const { convertStationsFormat } = require('../../../utils/convert');
const { runInNewMongooseTransaction } = require('../../../utils/transactions');
const { updateStationsCollection } = require('./stations');
const { updateHistoryCollection } = require('./history');
const { updateBrandsCollection } = require('./brands');
const { updateFuelsCollection } = require('./fuels');
const { executeAndLogPerformance } = require('../../../utils/timer');

/**
 * Takes stations raw data and save/update documents in the DB
 * @param {Array<Object>} stationRawObjectList raw data provided by the gov API
 */
async function processRawData(stationRawObjectList) {    
    const stationObjectList = convertStationsFormat(stationRawObjectList);
    try {
        await runInNewMongooseTransaction(async (session) => {
            await Promise.all([
                updateStationsCollection(stationObjectList, session),
                updateHistoryCollection(stationObjectList, session),
                updateFuelsCollection(stationRawObjectList, session, true),            
                updateBrandsCollection(stationRawObjectList, session, true)
            ]);
        });
    } catch (error) {
        error.message = 'Process raw data > ' + error.message;  // update error message
        throw error;  // re-throw
    };
};

// module.exports.processRawData = processRawData;
module.exports.processRawData = async (stationRawObjectList) => { await executeAndLogPerformance('Process raw data', async () => { await processRawData(stationRawObjectList) }) };