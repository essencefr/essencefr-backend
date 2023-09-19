/**
 * Details about 'history' data model + validators
 */

const mongoose = require('mongoose');

/***** Genreric varaibles/const *****/

const History = mongoose.model({ collection: 'histories' }, new mongoose.Schema({
    station: {
        type: {
            id : {
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
            id : {
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
        default: []
    }
}));

module.exports.History = History;