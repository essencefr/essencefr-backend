/**
 * Wrapper called to save/update the raw data into the different collections
 */


const { convertStationsFormat } = require('../convert');
const { Station } = require('../../models/station');

/**
 * Takes stations raw data and save/update documents in the DB
 * @param {Array<Object>} stationRawObjectList raw data provided by the gov API
 */
function processRawData(stationRawObjectList) {
    const stationObjectList = convertStationsFormat(stationRawObjectList);
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
    // ----- OLD BELOW -----
    // get all stations in stationObjectList with _id unknown in the database: store them in an array (let's say 'stationObjectListNew')
    //  -> save stations data into stations documents in the DB: call saveStations(stationObjectListNew)
    //  -> create matching history documents and save prices data in it
    //  -> is the brand unknown ? -> if yes, create new document into the brands collection
    //  -> is the fuel unknown ? -> if yes, create new document into the fuels collection
    // get all stations in stationObjectList with _id already known in the database: store them in an array (let's say 'stationObjectListKnown')
    // get all stations that have data different from the one in the DB (let's say 'stationObjectListToUpdate'). This can be achieved by comparing hash values
    //  -> update the corresponding documents into the DB: call updateStations(stationObjectListToUpdate)
    //  -> store fuel prices into matching history document
    // ----- OLD END -----
    //
    // Improvment idea: the lists of known/unkown stations' _id values can be stored in cache and only actualized when new station documents are created in order to improve performance
    //                  -> no need to execute a query on the DB when it is rare that a new station is being discovered
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
    // look for the stations already in the database:
    const listKnownStationIds = await Station.find({ '_id': {$in: listInputStationIds}}).select('_id');  // TODO Improvment idea: this list can be stored in cache and only actualized when new station documents are created in order to improve performance
    // create output:
    let stationObjectsFiltered = {
        stationObjectsNew: [],      // stations object with _id unknown in the DB
        stationObjectsKnown: []     // stations object with _id already known in the DB
    };
    // filter elements:
    stationObjectList.forEach((stationObject) => {
        if(listKnownStationIds.some(e => e._id == stationObject._id)) {     // i.e. if stationObject._id is in the list of ids known by the DB
            stationObjectsFiltered.stationObjectsKnown.push(stationObject);
        } else {            
            stationObjectsFiltered.stationObjectsNew.push(stationObject);
        };
    });
    return stationObjectsFiltered;
};

module.exports.processRawData = processRawData;
module.exports.filterStationObjects = filterStationObjects;