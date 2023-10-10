/**
 * Module with conversion functions
 */

const { validateStationRaw } = require('./validate');

// These are the only supported fuels because of the `select` param in the API used: (TODO: store them in the DB)
const listSupportedFuels = [
    {
        "_id": 6,
        "name": "Super Sans Plomb 98",
        "shortName": "SP98",
        "picto": "E5",
        "keyInRawData": "sp98"
    },
    {
        "_id": 2,
        "name": "Super Sans Plomb 95",
        "shortName": "SP95",
        "picto": "E5",
        "keyInRawData": "sp95"
    },
    {
        "_id": 4,
        "name": "GPLc",
        "shortName": "GPLc",
        "picto": "LPG",
        "keyInRawData": "gplc"
    },
    {
        "_id": 1,
        "name": "Gazole",
        "shortName": "Gazole",
        "picto": "B7",
        "keyInRawData": "gazole"
    },
    {
        "_id": 5,
        "name": "Super Sans Plomb 95 E10",
        "shortName": "SP95-E10",
        "picto": "E10",
        "keyInRawData": "e10"
    },
    {
        "_id": 3,
        "name": "Super Ethanol E85",
        "shortName": "E85",
        "picto": "E85",
        "keyInRawData": "e85"
    }
];

/**
 * Convert a single station raw object into the format expected by the DB
 * @param {Object} stationRawObject single station object in JSON format such as defined by the government API
 */
function convertStationFormat(stationRawObject) {
    const { error } = validateStationRaw(stationRawObject);
    if (error) {
        // throw an error object with custom properties:
        let err = new Error(`Validation error on raw station object: ${error.details[0].message}`);
        err.error = error;  // 'error' also contains the object given to Joi for validation, so no need to use the following lin (but kept commented for traceability)
        // err.stationRawObject = value;  // 'value' comes from const { value, error } = validateStationRaw(stationRawObject);
        throw err;
    }
    let arrayFuels = [];
    listSupportedFuels.forEach(fuel => {
        if(stationRawObject[fuel.keyInRawData + '_prix'] != null) {
            const fuelDate = new Date(stationRawObject[fuel.keyInRawData + '_maj'] + '+02:00');  // consider that data is already fetched with dates interpreted at UTC+2 (thus, mongoose will do the conversion to store them at UTC+0)
            const fuelPrice = stationRawObject[fuel.keyInRawData + '_prix'];
            arrayFuels.push({
                _id: fuel._id,
                shortName: fuel.shortName,
                date: fuelDate,
                price: fuelPrice,
                history: [{  // start to fill history with current price and date
                    date: fuelDate,
                    price: fuelPrice,
                }]
            });
        }
    });
    const stationObject = {
        _id: stationRawObject.id,
        name: null,
        brand: null,
        address: {
            streetLine: stationRawObject.adresse,
            cityLine: stationRawObject.cp + ' ' + (stationRawObject.ville ? stationRawObject.ville : '')
        },
        coordinates: {
            latitude: stationRawObject.geom.lat,
            longitude: stationRawObject.geom.lon
        },
        fuels: arrayFuels
    };
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
                name: stationObject.name == null ? '' : stationObject.name,  // set to '' (empty string) if value is 'null'
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
 * Wrapper to generate specific objects from multiple input objects
 * @param {Array<Object>} inputObjectList array of objects
 * @param {reference} generationFunction reference to the generation function that should return an object or an array of objects
 */
function generateObjectList(inputObjectList, generationFunction) {
    let objectList = [];
    inputObjectList.forEach(element => {
        const generated = generationFunction(element);  // returns an object or an array of objects
        if (Array.isArray(generated)) { objectList.push(...generated); }
        else if (generated != null) { objectList.push(generated); }
    });
    return [...new Map(objectList.map(v => [JSON.stringify(v), v])).values()];  // returns a list with removed duplicates objects (based on their values)
};

module.exports.convertStationsFormat = (inputObjectList) => { return generateObjectList(inputObjectList, convertStationFormat) };
module.exports.generateHistoryObjectList = (inputObjectList) => { return generateObjectList(inputObjectList, generateHistoryObject) };