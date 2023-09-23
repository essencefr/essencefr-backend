/**
 * Code called to update values in the database
 */

const mongoose = require('mongoose');
const { Station } = require("../../models/station");
const { runInMongooseTransaction } = require('../transactions');


/**
 * Save given stations data into the db. If a station has an _id that already exists in the db, no station is added at all.
 * @param stationObjectList list of station objects matching the mongoose schema defined in models
 */
async function saveStations(stationObjectList){
    // save the data within a transaction so that no data will be stored if an _id already exists:
    await runInMongooseTransaction(async (session) => {
        await Station.insertMany(stationObjectList, { session });
    });
};

/**
 * Update the stations documents in the DB with the data provided
 * @param stationObjectList list of station objects matching the mongoose schema defined in models
 */
function updateStations(stationObjectList) {

};

module.exports.saveStations = saveStations;