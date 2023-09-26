/**
 * Details about 'history' data model + validators
 */

const mongoose = require('mongoose');

/***** Genreric varaibles/const *****/

const historySchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    station: {
        type: {
            _id : {
                type: Number,
                required: true
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
                required: true
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
    }
});

// custom static method:
historySchema.static('findByStationAndFuelIds', function(stationId, fuelId) {
    return this.findById(parseInt(`${stationId}${fuelId}`));
});

const History = mongoose.model('Histories', historySchema);

module.exports.History = History;