/**
 * Module with conversion functions
 */


const { validateStationRaw } = require('../models/station');

/**
 * Convert a single station raw object into the format expected by the DB
 * @param {Object} stationRawObject single station object in JSON format such as defined by the government API
 */
function convertStationFormat(stationRawObject) {
    const { error } = validateStationRaw(stationRawObject);
    if(error) throw Error(`Validation error: ${error.details[0].message}`);
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
 * @param {Array<Object>} stationRawObjectList multiple station objects in JSON format such as defined by the government API
 */
function convertStationsFormat(stationRawObjectList) {
    let stationObjectList = [];
    stationRawObjectList.forEach(element => {
        stationObjectList.push(convertStationFormat(element));
    });
    return stationObjectList;
};

/**
 * Generate history object(s) from single station object (as many history objects as fuel types in given station object)
 * @param {Object} stationObject station object
 */
function generateHistoryObject(stationObject) {
    // /!\ No need to validate 'stationObject' parameter AS LONG AS this function is always called after generating stationObjects with the function 'convertStationsFormat' above
    // This allows the server to directly parse the station objects and improve its performance
    let historyObjects = [];
    let historyObject = null;
    for(let i = 0; i < stationObject.fuels.length; i++) {
        historyObject = {
            _id: parseInt(`${stationObject._id}${stationObject.fuels[i]._id}`),
            station: {
                _id: stationObject._id,
                name: stationObject.name
            },
            fuel: {
                _id: stationObject.fuels[i]._id,
                shortName: stationObject.fuels[i].shortName
            },
            history: [
                {
                    date: stationObject.fuels[i].date,
                    price: stationObject.fuels[i].price
                }
            ]
        };
        historyObjects.push(historyObject);
        historyObject = null;
    };
    return historyObjects;
};

/**
 * Generate history objects from multiple station objects
 * @param {Array<Object>} stationObjectList array of station object
 */
function generateHistoryObjectList(stationObjectList) {
    let historyObjectList = [];
    stationObjectList.forEach(element => {
        historyObjectList.push(...generateHistoryObject(element));
    });
    return historyObjectList;
};

/**
 * Generate historyUpdate object(s) from a single station object
 * @param {Object} stationObject station object
 */
function generateHistoryUpdateObject(stationObject) {
    let historyUpdateObjects = [];
    let historyUpdateObject = null;
    for(let i = 0; i < stationObject.fuels.length; i++) {
        historyUpdateObject = {
            station: {
                _id: stationObject._id,
                name: stationObject.name
            },
            fuel: {
                _id: stationObject.fuels[i]._id,
                shortName: stationObject.fuels[i].shortName
            },
            newPrice: {
                date: stationObject.fuels[i].date,
                price: stationObject.fuels[i].price
            }
        };
        historyUpdateObjects.push(historyUpdateObject);
        historyUpdateObject = null;
    };
    return historyUpdateObjects;
};

/**
 * Generate historyUpdate object(s) from multiple station objects
 * @param {Array<Object>} stationObjectList array of station object
 */
function generateHistoryUpdateObjectList(stationObjectList) {
    let historyUpdateObjectList = [];
    stationObjectList.forEach(element => {
        historyUpdateObjectList.push(...generateHistoryUpdateObject(element));
    });
    return historyUpdateObjectList;
};

module.exports.convertStationsFormat = convertStationsFormat;
module.exports.generateHistoryObjectList = generateHistoryObjectList;
module.exports.generateHistoryUpdateObjectList = generateHistoryUpdateObjectList;