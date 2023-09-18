/**
 * Code called to update values in the database
 */

const { Station } = require("../models/station");

/**
 * Function that retrieves the stations and gas prices 10km around a given location.
 * Calls API from https://swagger.2aaz.fr/
 * Data issues from https://www.prix-carburants.gouv.fr/rubrique/opendata/
 * @param {Number} longitude 
 * @param {Number} latitude 
 * @returns Array<Station> with 'Station' format defined in models
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
 * Save given station data into the db
 * @param {Station} stationData     Station data formated such as defined in models 
 */
async function saveStation(stationData){
    const newDoc = new Station({
        stationId: stationData.id,
        name: stationData.name,
        brand: {
            id: stationData.Brand.id,
            name: stationData.Brand.name
        },
        address: {
            streetLine: stationData.Address.street_line,
            cityLine: stationData.Address.city_line
        },
        coordinates: {
            latitude: stationData.Coordinates.latitude,
            longitude: stationData.Coordinates.longitude
        }
    });
    stationData.Fuels.forEach(element => {
        newDoc.fuels.push({
            id: element.id,
            shortName: element.shortName,
            date: new Date(element.Update.value),
            available: element.available,
            price: element.Price.value,
        });
    });
    // save new document:
    await newDoc.save();
    // send the newly created object:
    res.send(newDoc);
}

module.exports.saveStation = saveStation;