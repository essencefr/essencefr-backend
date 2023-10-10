/**
 * Module with validation functions
 */

const Joi = require('joi');

/**
 * Validates the raw station data retrieved from the gov API (https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records)
 * The raw data contains a lot of details, I only check that the detials I really need are present.
 */
function validateStationRaw(jsonData) {
    const stationRawSchema = Joi.object({
        id: Joi.number().required(),

        geom: Joi.object().required().keys({
            lat: Joi.number().required(),
            lon: Joi.number().required(),
        }),

        adresse: Joi.string().required(),
        ville: Joi.string().allow(null).required(),
        cp: Joi.string().required(),

        gazole_maj: Joi.string().allow(null).required(),
        gazole_prix: Joi.string().allow(null).required(),
        sp95_maj: Joi.string().allow(null).required(),
        sp95_prix: Joi.string().allow(null).required(),
        e85_maj: Joi.string().allow(null).required(),
        e85_prix: Joi.string().allow(null).required(),
        gplc_maj: Joi.string().allow(null).required(),
        gplc_prix: Joi.string().allow(null).required(),
        e10_maj: Joi.string().allow(null).required(),
        e10_prix: Joi.string().allow(null).required(),
        sp98_maj: Joi.string().allow(null).required(),
        sp98_prix: Joi.string().allow(null).required()
    })
    return stationRawSchema.validate(jsonData, { allowUnknown: true });  // 'allowUnknown' allows the object to have additional paramaters that are not defined in this schema
};

/**
 * Validates the parameters passed in HTTP request on GET station
 */
function validateRequestParamsGetStation(reqParams) {
    // validation schema (values passed in req params):
    const paramSchema = Joi.object({
        id: Joi.number().required()
    });
    return paramSchema.validate(reqParams);
};

/**
 * Validates the query passed in HTTP request on GET station
 */
function validateRequestQueryGetStation(reqQuery) {
    // validation schema (values passed in req query):
    const querySchema = Joi.object({
        history: Joi.boolean()  // this is optional
    });
    return querySchema.validate(reqQuery);
};

module.exports.validateStationRaw = validateStationRaw;
module.exports.validateRequestParamsGetStation = validateRequestParamsGetStation;
module.exports.validateRequestQueryGetStation = validateRequestQueryGetStation;