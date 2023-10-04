/**
 * Details about 'history' data model + validators
 */

const mongoose = require('mongoose');


/***** Genreric varaibles/const *****/

const historySchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    station: {
        type: {
            _id: {
                type: Number,
                required: true,
                immutable: true
            },
            name: {
                type: String,
                default: ''
            }
        },
        required: true
    },
    fuel: {
        type: {
            _id: {
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
        required: true,
        // default: [],  // arrays are always '[]' by default in mongoose models
        // custom validators:
        validate: [
            {
                validator: function (v) { return v.length >= 1; },
                message: function (props) { return `${props.path} must have length >= 1, got '${props.value}'`; }
            },
            {
                validator: function (v) { return v[v.length -1].date == this.lastUpdate; },
                message: function (props) { return `Date of last element in ${props.path} must match 'lastUpdate', got '${props.value}'`; }
            }
        ]
    },
    lastUpdate: {
        type: Date,
        required: true
    }
});

// custom static method:
historySchema.static('findByStationAndFuelIds', function (stationId, fuelId) {
    return this.findById(parseInt(`${stationId}${fuelId}`));
});

const History = mongoose.model('Histories', historySchema);

module.exports.History = History;