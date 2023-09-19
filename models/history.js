/**
 * Details about 'history' data model + validators
 */

const mongoose = require('mongoose');

/***** Genreric varaibles/const *****/

const History = mongoose.model({ collection: 'histories' }, new mongoose.Schema({
    stationId: {
        type: Number,
        required: true
    },
    stationName: {
        type: String,
        required: true
    },
    fuelId: {
        type: Number,
        required: true
    },
    fuelShortName: {
        type: String,
        required: true
    },
    history: {
        type: [{
            date: Date,
            price: Number,
        }],
        default: []
    }
}));