/**
 * Details about 'station' data model + validators
 */

const mongoose = require('mongoose');

/***** Genreric varaibles/const *****/

const Station = mongoose.model('Station', new mongoose.Schema({
    stationId: Number,
    name: String,
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

module.exports.Station = Station;