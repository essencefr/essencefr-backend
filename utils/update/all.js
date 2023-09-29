/**
 * Wrapper called to save/update the raw data into the different collections
 */

const cache = require('../../cache/cache');
const { convertStationsFormat, generateHistoryObjectList, generateHistoryUpdateObjectList } = require('../convert');
const { runInNewMongooseTransaction } = require('../transactions');
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
    // Improvment idea: the lists of known/unkown stations' _id values can be stored in cache and only actualized when new station documents are created in order to improve performance
    //                  -> no need to execute a query on the DB when it is rare that a new station is being discovered
    const stationObjectList = convertStationsFormat(stationRawObjectList);
    const stationObjectListFiltered = await filterStationObjects(stationObjectList);
    const historyObjectsNew = generateHistoryObjectList(stationObjectListFiltered.stationObjectsNew);
    const historyUpdateObjects = generateHistoryUpdateObjectList(stationObjectListFiltered.stationObjectsKnown);

    // console.log('stationObjectListFiltered.stationObjectsNew: ', stationObjectListFiltered.stationObjectsNew);
    // console.log('stationObjectListFiltered.stationObjectsKnown: ', stationObjectListFiltered.stationObjectsKnown);
    // console.log('historyObjectsNew: ', historyObjectsNew);
    // console.log('historyUpdateObjects: ', historyUpdateObjects);

    await runInNewMongooseTransaction(async (session) => {
        await updateStationsCollection(stationObjectListFiltered.stationObjectsNew, stationObjectListFiltered.stationObjectsKnown, session);
        await updateHistoryCollection(historyObjectsNew, historyUpdateObjects, session);
    });
};

/**
 * Separate a stationObjectList in two arrays:
 *  - one containing the station objects unknown by the DB
 *  - one containing the station objects already known in the DB  // TODO: make it be an array containing only the stations objects that have new values (compare hash)
 * @param {Array<Object>} stationObjectList list of station objects matching the mongoose schema defined in models
 */
async function filterStationObjects(stationObjectList) {
    // create array with only station ids from input:
    let listInputStationIds = [];
    stationObjectList.forEach((stationObject) => {
        listInputStationIds.push(stationObject._id);
    });
    // look for the station ids already in the database through cache:
    const listKnownStationIds = await cache.getKnownStationIds();
    // create output:
    let stationObjectsFiltered = {
        stationObjectsNew: [],      // stations object with _id unknown in the DB
        stationObjectsKnown: []     // stations object with _id already known in the DB
    };
    // filter elements:
    stationObjectList.forEach((stationObject) => {
        if (listKnownStationIds.includes(stationObject._id)) {     // i.e. if stationObject._id is in the list of ids known by the DB
            stationObjectsFiltered.stationObjectsKnown.push(stationObject);
        } else {
            stationObjectsFiltered.stationObjectsNew.push(stationObject);
        };
    });
    return stationObjectsFiltered;
};

module.exports.processRawData = processRawData;
module.exports.filterStationObjects = filterStationObjects;