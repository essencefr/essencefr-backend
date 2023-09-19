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
    //  -> save stations data into stations documents in the DB: call saveStations(stationsDataNew)
    //  -> create matching history documents and save prices data in it
    //  -> is the brand unknown ? -> if yes, create new document into the brands collection
    //  -> is the fuel unknown ? -> if yes, create new document into the fuels collection
    // get all stations in stationsData with _id already known in the database: store them in an array (let's say 'stationsDataUpdate')
    //  -> update the corresponding documents into the DB: call updateStations(stationsDataUpdate)
    //  -> store fuel prices into matching history document
    //
    // Improvment idea: the lists of known/unkown stations' _id values can be stored in cache and only actualized when new station documents are created in order to improve performance
    //                  -> no need to execute a query on the DB when there it is rare that a new station is being discovered
};