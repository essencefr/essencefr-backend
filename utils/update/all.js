/**
 * Wrapper called to save/update the raw data into the different collections
 */


const { convertStationsFormat } = require('../convert');
const { Station } = require('../../models/station');

/**
 * Takes stations raw data and save/update documents in the DB
 * @param {*} stationRawObjectList raw data provided by the gov API
 */
function processRawData(stationRawObjectList) {
    const stationObjectList = convertStationsFormat(stationRawObjectList);
    // TODO:
    // get all stations in stationObjectList with _id unknown in the database: store them in an array (let's say 'stationObjectListNew')
    //  -> save stations data into stations documents in the DB: call saveStations(stationObjectListNew)
    //  -> create matching history documents and save prices data in it
    //  -> is the brand unknown ? -> if yes, create new document into the brands collection
    //  -> is the fuel unknown ? -> if yes, create new document into the fuels collection
    // get all stations in stationObjectList with _id already known in the database: store them in an array (let's say 'stationObjectListKnown')
    // get all stations that have data different from the one in the DB (let's say 'stationObjectListToUpdate'). This can be achieved by comparing hash values
    //  -> update the corresponding documents into the DB: call updateStations(stationObjectListToUpdate)
    //  -> store fuel prices into matching history document
    //
    // Improvment idea: the lists of known/unkown stations' _id values can be stored in cache and only actualized when new station documents are created in order to improve performance
    //                  -> no need to execute a query on the DB when it is rare that a new station is being discovered
};

/**
 * Separate a stationObjectList in two arrays:
 *  - one containing the data related to stations unknown in the DB
 *  - one containing the data related to stations already known in the DB  // TODO: make it be an array containing only the stations objects that have new values (compare hash)
 * @param {*} stationObjectList list of station objects matching the mongoose schema defined in models
 */
async function filterstationObjectList(stationObjectList) {
    // create array with only station ids from input:
    let listInputStationIds = [];
    stationObjectList.forEach((stationObject) => {
        listInputStationIds.push(stationObject._id);
    });
    // look for the stations already in the database:
    const listKnownStationIds = await Station.find({ '_id': {$in: listInputStationIds}}).select('_id');  // TODO Improvment idea: this list can be stored in cache and only actualized when new station documents are created in order to improve performance
    // create output:
    let stationObjectListFiltered = {
        stationObjectListNew: [],    // stations object with _id unknown in the DB
        stationObjectListKnown: []   // stations object with _id already known in the DB
    };
    // filter elements:
    stationObjectList.forEach((stationObject) => {
        if(listKnownStationIds.some(e => e._id == stationObject._id)) {  // i.e. if stationObject._id is in the list of ids known by the DB
            stationObjectListFiltered.stationObjectListKnown.push(stationObject);
        } else {            
            stationObjectListFiltered.stationObjectListNew.push(stationObject);
        };
    });
    return stationObjectListFiltered;
};

module.exports.processRawData = processRawData;
module.exports.filterstationObjectList = filterstationObjectList;