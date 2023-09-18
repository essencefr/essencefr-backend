/**
 * Module for setting DB connection
 */

const config = require('config');
const mongoose = require('mongoose');

module.exports = function() {
    const mongoURI = config.get('dbConnectionString');
    mongoose.connect(mongoURI)
    .then(() => console.log(`Connected to MongoDB: ${mongoURI}`));
    // .catch(err => console.error(`Cannot connect to MongoDB: ${mongoURI}`, err));  // -> no catch here so that the error is caught by the generic listener
}