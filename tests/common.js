/**
 * Modules with common features used in various tests
 */

const logger = require('../logger');
const config = require('config');
const mongoose = require('mongoose');

/**
 * Connect to the DB
 */
function connectToDB() {
    let mongoURI = config.get('dbConnectionString');
    if(process.env.NODE_ENV == 'test') mongoURI += '-test';  // use the test DB if we are in test mode (best way found so far to overwrite the env var value such as deefined in the config file)
    mongoose.connect(mongoURI)
        .then(() => logger.info(`Connected to MongoDB: ${mongoURI.replace(/(?<=\/\/)\w*(?=:)/, '<username>').replace(/(?<=:)\w*(?=@)/, '<password>')}`));
}

/**
 * Clear all documents in all collections in DB
 */
async function clearCollections() {
    const collections = mongoose.connection.collections;

    await Promise.all(Object.values(collections).map(async (collection) => {
        await collection.deleteMany({});
    }));
}

module.exports.connectToDB = connectToDB;
module.exports.clearCollections = clearCollections;