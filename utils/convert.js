/**
 * Module with conversion functions
 */

const cache = require('../services/cache');
const { validateStationRaw } = require('../models/station');

/**
 * Convert a single station raw object into the format expected by the DB
 * @param {Object} stationRawObject single station object in JSON format such as defined by the government API
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
        lastUpdate: stationRawObject.LastUpdate.value,
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
 * Generate history object(s) from single station object (as many history objects as fuel types in given station object)
 * @param {Object} stationObject station object
 */
function generateHistoryObject(stationObject) {
    // /!\ No need to validate 'stationObject' parameter AS LONG AS this function is always called after generating stationObjects with the function 'convertStationsFormat' above
    // This allows the server to directly parse the station objects and improve its performance
    let historyObjects = [];
    let historyObject = null;
    for (let i = 0; i < stationObject.fuels.length; i++) {
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
            ],
            lastUpdate: stationObject.fuels[i].date
        };
        historyObjects.push(historyObject);
        historyObject = null;
    };
    return historyObjects;
};

/**
 * Generate fuel object(s) from single station object (as many fuel objects as fuel types in given station object)
 * @param {Object} stationRawObject single station object in JSON format such as defined by the government API
 */
async function generateFuelObject(stationRawObject, bypassValidation = false) {
    // /!\ The following validation can be optionnal ONLY IF the given 'stationRawObject' has already been validated (for example, with the function 'convertStationsFormat' above)
    if (!bypassValidation) {
        const { error } = validateStationRaw(stationRawObject);
        if (error) throw Error(`Validation error: ${error.details[0].message}`);
    }
    let fuelObjects = [];
    let fuelObject = null;
    const listKnownFuelIds = await cache.getKnownFuelIds();
    for (let i = 0; i < stationRawObject.Fuels.length; i++) {
        if (!listKnownFuelIds.includes(stationRawObject.Fuels[i].id)) {
            fuelObject = {
                _id: stationRawObject.Fuels[i].id,
                name: stationRawObject.Fuels[i].name,
                shortName: stationRawObject.Fuels[i].short_name,
                picto: stationRawObject.Fuels[i].picto
            }
            fuelObjects.push(fuelObject);
            fuelObject = null;
        }
    };
    return fuelObjects;
};

/**
 * Generate brand object(s) from single station object (as many brand objects as brand types in given station object)
 * @param {Object} stationRawObject single station object in JSON format such as defined by the government API
 */
async function generateBrandObject(stationRawObject, bypassValidation = false) {
    // /!\ The following validation can be optionnal ONLY IF the given 'stationRawObject' has already been validated (for example, with the function 'convertStationsFormat' above)
    if (!bypassValidation) {
        const { error } = validateStationRaw(stationRawObject);
        if (error) throw Error(`Validation error: ${error.details[0].message}`);
    }
    let brandObject = null;
    const listKnownBrandIds = await cache.getKnownBrandIds();
    if (!listKnownBrandIds.includes(stationRawObject.Brand.id)) {
        brandObject = {
            _id: stationRawObject.Brand.id,
            name: stationRawObject.Brand.name,
            shortName: stationRawObject.Brand.short_name
        }
    }
    return brandObject;
};

/**
 * Wrapper to generate specific objects from multiple input objects
 * @param {Array<Object>} inputObjectList array of objects
 * @param {reference} generationFunction reference to the generation function that should return an object or an array of objects
 */
function generateObjectList(inputObjectList, generationFunction) {
    let objectList = [];
    inputObjectList.forEach(element => {
        const generated = generationFunction(element);  // returns an object or an array of objects
        if (Array.isArray(generated)) { objectList.push(...generated); }
        else { objectList.push(generated); }
    });
    return objectList;
};

/**
 * Async wrapper to generate specific objects from multiple input objects
 * @param {Array<Object>} inputObjectList array of objects
 * @param {reference} generationFunction reference to the generation function that should return an object or an array of objects
 */
async function generateObjectListAsync(inputObjectList, generationFunction) {
    let objectList = [];
    await Promise.all(inputObjectList.map(async (element) => {
        const generated = await generationFunction(element);  // returns an object or an array of objects
        if (Array.isArray(generated)) { objectList.push(...generated); }
        else if (generated != null) { objectList.push(generated); }
    }));
    return objectList;
};

module.exports.convertStationsFormat = (inputObjectList) => { return generateObjectList(inputObjectList, convertStationFormat) };
module.exports.generateHistoryObjectList = (inputObjectList) => { return generateObjectList(inputObjectList, generateHistoryObject) };
module.exports.generateFuelObjectList = (inputObjectList, bypassValidation = false) => {
    return generateObjectListAsync(
        inputObjectList,
        async (stationRawObject) => { return await generateFuelObject(stationRawObject, bypassValidation); }
    )
};
module.exports.generateBrandObjectList = (inputObjectList, bypassValidation = false) => {
    return generateObjectListAsync(
        inputObjectList,
        async (stationRawObject) => { return await generateBrandObject(stationRawObject, bypassValidation); }
    )
};