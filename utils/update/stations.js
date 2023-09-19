/**
 * Code called to update values in the database
 */

const mongoose = require('mongoose');
const { Station, validateStationRaw } = require("../../models/station");

/**
 * Function that retrieves the stations and gas prices 10km around a given location.
 * Calls API from https://swagger.2aaz.fr/
 * Data issues from https://www.prix-carburants.gouv.fr/rubrique/opendata/
 * @param {Number} longitude 
 * @param {Number} latitude 
 * @returns list of stations data in JSON format such as defined bu the government API
 */
async function fetchStations(longitude, latitude) {
    let response = await fetch(`https://api.prix-carburants.2aaz.fr/stations/around/${longitude},${latitude}?responseFields=FuelsPrices`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Range": "m=0-9999"  // distance around the point (max 10000 (10km))
        }
    });
    let data = await response.json();
    return data;
};

/**
 * Save given stations data into the db. If a station has an _id that already exists in the db, no modification is made.
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