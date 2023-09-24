/**
 * Code called to update values in the database
 */

const mongoose = require('mongoose');
const { Station } = require("../../models/station");
const { runInMongooseTransaction } = require('../transactions');


/**
 * Save given station objects into the db. If a station has an _id that already exists in the db, no station object is added at all (rollback).
 * @param stationObjectList list of station objects matching the mongoose schema defined in models
 */
async function saveStations(stationObjectList){
    // save the data within a transaction so that no data will be stored if an _id already exists:
    await runInMongooseTransaction(async (session) => {
        await Station.insertMany(stationObjectList, { session });
    });
};

/**
 * Update the station documents in the DB with the data provided
 * @param stationObjectList list of station objects matching the mongoose schema defined in models
 */
async function updateStations(stationObjectList) {
    // I tried to use mongoose 'Models.bulkSave()' in order to modify data only if it had changed but the behavior was unexpected (data seemed to be overwritten anyway)
    // So I cam e back with the initial idea: using 'Models.updateOne()'.
    // This is not ideal because I have to send multiple requests to the DB instead of a single one containing all the modifications to make.
    // Therefore, this update function will certainy need improvement but I will leave this for later (this priority is to create a fully operational POC)
    //
    // For this function:
    // 1 - recursively call 'Models.updateOne()' with filter: station._id and data to update: whole sation object (can be improved by checking if only fuels array need to be updated)
};

module.exports.saveStations = saveStations;
module.exports.updateStations = updateStations;