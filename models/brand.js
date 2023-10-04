/**
 * Details about 'brand' data model + validators
 */

const mongoose = require('mongoose');

/***** Genreric varaibles/const *****/

const Brand = mongoose.model('Brand', new mongoose.Schema({
    _id: {
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
    nbStations: {
        type: Number,
        required: true
    }
}));

module.exports.Brand = Brand;