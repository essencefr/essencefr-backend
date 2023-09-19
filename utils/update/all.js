/**
 * Wrapper called to save/update the raw data into the different collections
 */


const { convertStationsFormat } = require('../convert');

/**
 * Takes stations raw data and save/update documents in the DB
 * @param {*} stationsDataRaw raw data provided by the gov API
 */
function processRawData(stationsDataRaw) {
    const stationsData = convertStationsFormat(stationsDataRaw);
    // TODO:
    // get all stations in stationsData with _id unknown in the database: store them in an array (let's say 'stationsDataNew')
    // save them into the DB: call saveStations(stationsDataNew)
    //  + is the brand unknown ? -> if yes, create new document into the brands collection
    //  + is the fuel unknown ? -> if yes, create new document into the fuels collection
    // get all stations in stationsData with _id already known in the database: store them in an array (let's say 'stationsDataUpdate')
    // update the corresponding documents into the DB: call updateStations(stationsDataUpdate)
};