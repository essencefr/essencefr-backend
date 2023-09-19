/**
 * Module for setting DB connection
 */

const config = require('config');
const mongoose = require('mongoose');

module.exports = function() {
    let mongoURI = config.get('dbConnectionString');
    if(process.env.NODE_ENV == 'test') mongoURI += '-test';  // use the test DB if we are in test mode (best way found so far to overwrite the env var value such as deefined in the config file)
    mongoose.connect(mongoURI)
    .then(() => console.log(`Connected to MongoDB: ${mongoURI}`));
    // .catch(err => console.error(`Cannot connect to MongoDB: ${mongoURI}`, err));  // -> no catch here so that the error is caught by the generic listener
}