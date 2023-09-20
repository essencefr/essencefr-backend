/**
 * Module with conversion functions
 */


const { validateStationRaw } = require('../models/station');

/**
 * Convert a single station raw data into the format expected by the DB
 * @param stationDataRaw single station data in JSON format such as defined by the government API
 */
function convertStationFormat(stationDataRaw) {
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
            // historyId: xxx,  // TODO: should be a reference to the matching history document
        });
    });
    return stationData;
};

/**
 * Convert multiple stations raw data into the format expected by the DB
 * @param {*} stationsDataRaw multiple stations data in JSON format such as defined by the government API
 */
function convertStationsFormat(stationsDataRaw) {
    let stationsData = [];
    stationsDataRaw.forEach(element => {
        stationsData.push(convertStationFormat(element));
    });
    return stationsData;
};

module.exports.convertStationsFormat = convertStationsFormat;