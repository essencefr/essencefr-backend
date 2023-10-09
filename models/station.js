/**
 * Details about 'station' data model + validators
 */

const mongoose = require('mongoose');

/***** Genreric varaibles/const *****/

const Station = mongoose.model('Station', new mongoose.Schema({
    _id: { type: Number, required: true },
    name: { type: String, default: null },
    brand: {
        type: {
            _id: { type: Number, required: true },
            name: { type: String, required: true }
        },
        // required: true
        default: null
    },
    address: {
        type: {
            streetLine: { type: String, required: true },
            cityLine: { type: String, required: true }
        },
        required: true
    },
    coordinates: {
        type: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true }
        },
        required: true
    },
    fuels: {
        type: [{
            _id: { type: Number, required: true, immutable: true },
            shortName: { type: String, required: true },
            date: { type: Date, required: true },
            price: { type: Number, required: true },
            history: {  // basically an array that stores old prices
                type: [{
                    date: { type: Date, required: true },
                    price: { type: Number, required: true }
                }],
                required: true,
                validate: [
                    // custom validator -> an history can never be empty:
                    {
                        validator: function (value) { return value.length >= 1; },
                        message: function (props) { return `${props.path} must have length >= 1, got '${props.value}'`; }
                    }
                ]
            }
        }],
        required: true,
        validate: [
            // custom validator -> the last history entry's date must match the fuel current date:
            {
                validator: function (value) {
                    let status = true;
                    for(let i=0; i<value.length; i++) {
                        if (value[i].history[value[i].history.length -1].date != value[i].date) {
                            status = false;
                            break;
                        }
                    }
                    return status;
                },
                message: function (props) { return `Last date in history in ${props.path} must match current date, got fuels: '${props.value}'`; }
            }
        ]
        // default: []  // arrays are always '[]' by default in mongoose models
    },
}));

module.exports.Station = Station;