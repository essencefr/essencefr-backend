/**
 * Wrapper called to save/update the raw data into the different collections
 */

const { convertStationsFormat } = require('../../../utils/convert');
const { runInNewMongooseTransaction } = require('../../../utils/transactions');
const { updateHistoryCollection } = require('./history');
const { updateStationsCollection } = require('./stations');

/**
 * Takes stations raw data and save/update documents in the DB
 * @param {Array<Object>} stationRawObjectList raw data provided by the gov API
 */
async function processRawData(stationRawObjectList) {
    // TODO:
    // 
    // # GENERIC:
    // Separate station objects in two categories:
    //      - the ones that are new for the DB
    //      - the ones already known in the DB (based in their '_id')
    // # STATIONS:
    // Execute a bulk write on the 'stations' collection to apply the corresponding operations
    // # HISTORIES:
    // 1) Generate history objects from the new station objects
    // 2) Execute a bulk write on the 'histories' collection to:
    //      - insert these new history documents
    //      - append the new fuel prices to the existing history documents
    // # FUELS:
    // From all the station objects (no separation here), insert a new fuel object in the matching collection if it does not exist yet
    // # BRANDS:
    // From all the station objects (no separation here), insert a new brand object in the matching collection if it does not exist yet
    // 
    const stationObjectList = convertStationsFormat(stationRawObjectList);
    await runInNewMongooseTransaction(async (session) => {
        await updateStationsCollection(stationObjectList, session);
        await updateHistoryCollection(stationObjectList, session);
    });
};

module.exports.processRawData = processRawData;