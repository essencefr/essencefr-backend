/**
 * Details about 'station' data model + validators
 */

const mongoose = require('mongoose');
const Joi = require('joi');

/***** Genreric varaibles/const *****/

const Station = mongoose.model('Station', new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    brand: {
        id: Number,
        name: String
    },
    address: {
        streetLine: String,
        cityLine: String
    },
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    fuels: {
        type: [{
            id: Number,
            shortName: String,
            date: Date,
            available: Boolean,
            price: Number,
        }],
        default: []
    }
}));

/***** Validation functions *****/

/**
 * Validates the raw station data retrieved from the gov API.
 * The raw data contains a lot of details, I only check that the detials I really need are present.
 */
function validateStationRaw(jsonData) {
    const stationSchema = Joi.object({
        id: Joi.number().required(),
        name: Joi.string().required(),
        Brand: Joi.object().required().keys({
            id: Joi.number().required(),
            name: Joi.string().required()
        }),
        Address: Joi.object().required().keys({
            street_line: Joi.string().required(),
            city_line: Joi.string().required()
        }),
        Coordinates: Joi.object().required().keys({
            latitude: Joi.number().required(),
            longitude: Joi.string().required()
        }),
        Fuels: Joi.array().required().items(
            Joi.object().required().keys({
                id: Joi.number().required(),
                name: Joi.string().required(),
                available: Joi.boolean().required(),
                Update: Joi.object().required().keys({
                    value: Joi.date().required()
                }),
                Price: Joi.object().required().keys({
                    value: Joi.number().required()
                }),
            })
        ).sparse()  // allows undefined values inside the array
    });
    return stationSchema.validate(jsonData, { allowUnknown: true });
};

/**
 * Validates the 'id' parameter passed in HTTP request
 */
function validateRequestParams(reqParams) {
    // id validation schema (id passed in req params):
    const idSchema = Joi.object({
        id: Joi.number().required()
    });
    return idSchema.validate(reqParams);
};

module.exports.Station = Station;
module.exports.validateStationRaw = validateStationRaw;
module.exports.validateRequestParams = validateRequestParams;