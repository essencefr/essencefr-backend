/**
 * Details about 'history' data model + validators
 */

const mongoose = require('mongoose');

/***** Genreric varaibles/const *****/

const History = mongoose.model('Histories', new mongoose.Schema({
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
}));

module.exports.History = History;