/**
 * Wrapper called to save/update the raw data into the different collections
 */

const cache = require('../../cache');
const { filterKnownObjects } = require('../../../utils/filter');
const { convertStationsFormat, generateHistoryObjectList } = require('../../../utils/convert');
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
    const listKnownStationIds = await cache.getKnownStationIds();
    const stationObjectListFiltered = filterKnownObjects(stationObjectList, listKnownStationIds);
    const historyObjectsList = generateHistoryObjectList(stationObjectList);
    const listKnownHistoryIds = await cache.getKnownHistoryIds();
    const historyObjectListFiltered = filterKnownObjects(historyObjectsList, listKnownHistoryIds);

    // console.log('stationObjectListFiltered.stationObjectsNew: ', stationObjectListFiltered.stationObjectsNew);
    // console.log('stationObjectListFiltered.stationObjectsKnown: ', stationObjectListFiltered.stationObjectsKnown);
    // console.log('historyObjectsNew: ', historyObjectsNew);
    // console.log('historyUpdateObjects: ', historyUpdateObjects);

    await runInNewMongooseTransaction(async (session) => {
        await updateStationsCollection(stationObjectListFiltered.objectsNew, stationObjectListFiltered.objectsKnown, session);
        await updateHistoryCollection(historyObjectListFiltered.objectsNew, historyObjectListFiltered.objectsKnown, session);
    });
};

module.exports.processRawData = processRawData;