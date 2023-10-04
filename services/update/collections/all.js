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

/**
 * Takes stations raw data and save/update documents in the DB
 * @param {Array<Object>} stationRawObjectList raw data provided by the gov API
 */
async function processRawData(stationRawObjectList) {
    logger.info('Starting raw data processing');
    
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
        logger.error(error.message, { error });
    };
        
    logger.info('End of raw data processing');
};

module.exports.processRawData = processRawData;