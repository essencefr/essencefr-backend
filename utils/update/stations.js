/**
 * Code called to update values in the database
 */

const mongoose = require('mongoose');
const { Station } = require("../../models/station");


/**
 * Save given stations data into the db. If a station has an _id that already exists in the db, no station is added at all.
 * @param stationsData list of stations data in format matching the mongoose schema defined in models
 */
async function saveStations(stationsData){
    // save the data within a transaction so that no data will be stored if an _id already exists:
    // TODO: Improvement - use a wrapper for transactions. More details here: https://blog.tericcabrel.com/how-to-use-mongodb-transaction-in-node-js/
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await Station.collection.insertMany(stationsData, { session });
        await session.commitTransaction();  // commit transaction
    } catch (e) {
        await session.abortTransaction();
        throw Error(e);
    } finally {
        session.endSession();
    }
};

/**
 * Update the stations documents in the DB with the data provided
 * @param stationsData data provided, matching the mongoose schema defined in models
 */
function updateStations(stationsData) {

};

module.exports.saveStations = saveStations;