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

        latitude: Joi.string().required(),
        longitude: Joi.number().required(),

        adresse: Joi.string().required(),
        ville: Joi.string().required(),
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

module.exports.validateStationRaw = validateStationRaw;