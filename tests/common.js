/**
 * Modules with common features used in various tests
 */

const mongoose = require('mongoose');
require('../index');  // init the server (nedeed for DB connection and other startup features)


/**
 * Clear all documents in all collections in DB
 */
async function clearCollections() {
    const collections = mongoose.connection.collections;

    await Promise.all(Object.values(collections).map(async (collection) => {
        await collection.deleteMany({});
    }));
}

module.exports.clearCollections = clearCollections;