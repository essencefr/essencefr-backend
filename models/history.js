/**
 * Details about 'history' data model + validators
 */

const mongoose = require('mongoose');
const Joi = require('joi');


/***** Genreric varaibles/const *****/

const historySchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    station: {
        type: {
            _id : {
                type: Number,
                required: true,
                immutable: true
            },
            name: {
                type: String,
                required: true
            }
        },
        required: true
    },
    fuel: {
        type: {
            _id : {
                type: Number,
                required: true,
                immutable: true
            },
            shortName: {
                type: String,
                required: true
            }
        },
        required: true
    },
    history: {
        type: [{
            date: {
                type: Date,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
        }],
        // default: []  // arrays are always '[]' by default in mongoose models
    },
    lastUpdate: { type: Date, required: true }
});

// custom static method:
historySchema.static('findByStationAndFuelIds', function(stationId, fuelId) {
    return this.findById(parseInt(`${stationId}${fuelId}`));
});

const History = mongoose.model('Histories', historySchema);

/***** Validation functions *****/

/**
 * Ensure that object given has the required format to be passed to the DB-update function
 * This format is called historyUpdateObject
 * @param {Object} object 
 */
function validateHistoryUpdate(object) {
    const historyUpdateSchema = Joi.object({
        station: Joi.object().required().keys({
            _id: Joi.number().required(),
            name: Joi.string().required()
        }),
        fuel: Joi.object().required().keys({
            _id: Joi.number().required(),
            shortName: Joi.string().required()
        }),
        newPrice: Joi.object().required().keys({
            price: Joi.number().required(),
            date: Joi.date().required()
        })
    });
    return historyUpdateSchema.validate(object);
}

module.exports.History = History;
module.exports.validateHistoryUpdate = validateHistoryUpdate;