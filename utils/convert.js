/**
 * Module with conversion functions
 */


const { validateStationRaw } = require('../models/station');

/**
 * Convert a single station raw object into the format expected by the DB
 * @param stationRawObject single station object in JSON format such as defined by the government API
 */
function convertStationFormat(stationRawObject) {
    const { error } = validateStationRaw(stationRawObject);
    if (error) throw Error(`Validation error: ${error.details[0].message}`);
    const stationObject = {
        _id: stationRawObject.id,
        name: stationRawObject.name,
        brand: {
            _id: stationRawObject.Brand.id,
            name: stationRawObject.Brand.name
        },
        address: {
            streetLine: stationRawObject.Address.street_line,
            cityLine: stationRawObject.Address.city_line
        },
        coordinates: {
            latitude: stationRawObject.Coordinates.latitude,
            longitude: stationRawObject.Coordinates.longitude
        },
        fuels: []
    };
    stationRawObject.Fuels.forEach(element => {
        stationObject.fuels.push({
            _id: element.id,
            shortName: element.short_name,
            date: new Date(element.Update.value),
            available: element.available,
            price: element.Price.value
        });
    });
    return stationObject;
};

/**
 * Convert multiple station raw objects into the format expected by the DB
 * @param {*} stationRawObjectList multiple station objects in JSON format such as defined by the government API
 */
function convertStationsFormat(stationRawObjectList) {
    let stationObjectList = [];
    stationRawObjectList.forEach(element => {
        stationObjectList.push(convertStationFormat(element));
    });
    return stationObjectList;
};

module.exports.convertStationsFormat = convertStationsFormat;