/**
 * Details about 'fuel' data model + validators
 */

const mongoose = require('mongoose');

/***** Genreric varaibles/const *****/

const Fuel = mongoose.model('Fuel', new mongoose.Schema({
    fuelId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        required: true
    },
    picto: {
        type: String,
        required: true
    }
}));

module.exports.Fuel = Fuel;