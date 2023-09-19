/**
 * Code called to update values in the database
 */

const mongoose = require('mongoose');
const { Station, validateStationRaw } = require("../../models/station");

/**
 * Save given stations data into the db. If a station has an _id that already exists in the db, no station is added at all.
 * @param stationsDataRaw   list of stations data in JSON format such as defined bu the government API
 */
async function saveStations(stationsDataRaw){
    // convert the raw data:
    let stationsData = [];
    stationsDataRaw.forEach(element => {
        stationsData.push(convertFormat(element));
    });
    // save the data within a transaction so that no data will be stored if an _id already exists:
    // TODO: Improvement - use a wrapper for transactions. More details here: https://blog.tericcabrel.com/how-to-use-mongodb-transaction-in-node-js/
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await Station.collection.insertMany(stationsData, { session });
        await session.commitTransaction();  // commit transaction
    } catch (e) {
        await session.abortTransaction();
        throw Error(e);
    } finally {
        session.endSession();
    }
};

/**
 * Convert a raw station format into the format expected by the database
 * @param stationDataRaw    single station data in JSON format such as defined bu the government API
 */
function convertFormat(stationDataRaw) {
    const { error } = validateStationRaw(stationDataRaw);
    if(error) throw Error(`Validation error: ${error.details[0].message}`);
    const stationData = {
        _id: stationDataRaw.id,
        name: stationDataRaw.name,
        brand: {
            id: stationDataRaw.Brand.id,
            name: stationDataRaw.Brand.name
        },
        address: {
            streetLine: stationDataRaw.Address.street_line,
            cityLine: stationDataRaw.Address.city_line
        },
        coordinates: {
            latitude: stationDataRaw.Coordinates.latitude,
            longitude: stationDataRaw.Coordinates.longitude
        },
        fuels: []
    };
    stationDataRaw.Fuels.forEach(element => {
        stationData.fuels.push({
            id: element.id,
            shortName: element.short_name,
            date: new Date(element.Update.value),
            available: element.available,
            price: element.Price.value,
        });
    });
    return stationData;
};

module.exports.saveStations = saveStations;