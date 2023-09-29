/**
 * Code called to update values in the database
 */

const cache = require('../../cache/cache');
const { Station } = require("../../models/station");
const { runInMongooseTransaction } = require('../transactions');


/**
 * Insert and update documents in DB collection in a single 'bulkWrite' instruction, within a transaction
 * @param {Array<Object>} stationObjectsToInsert List of station objects to insert in the DB
 * @param {Array<Object>} stationObjectsToUpdate List of station objects to update within the DB
 */
async function updateStationsCollection(stationObjectsToInsert, stationObjectsToUpdate, session=null) {
    if (typeof stationObjectsToInsert == 'undefined') throw Error(`You should provide a 'stationObjectsToInsert' parameter. Given: '${stationObjectsToInsert}'`);
    if (typeof stationObjectsToUpdate == 'undefined') throw Error(`You should provide a 'stationObjectsToUpdate' parameter. Given: '${stationObjectsToUpdate}'`);
    let bulkOperations = [];
    let listNewStationIds = [];
    // insert operations:
    for(let i=0; i < stationObjectsToInsert.length; i++) {
        listNewStationIds.push(stationObjectsToInsert[i]._id);
        bulkOperations.push({
            insertOne:
                {
                    document: stationObjectsToInsert[i]
                }
        });
    };
    // update operations:
    for(let i=0; i < stationObjectsToUpdate.length; i++) {
        bulkOperations.push({
            updateOne:
                {
                    filter: { _id: stationObjectsToUpdate[i]._id,
                              lastUpdate: { $ne: stationObjectsToUpdate[i].lastUpdate } },
                    update: { $set: stationObjectsToUpdate[i] }
                }
        });
    };
    // save the data within a transaction so that no data will be stored if an _id already exists:
    await runInMongooseTransaction(session, async (session) => {
        const bulkWriteResult = await Station.bulkWrite(bulkOperations, { session });
        // update cache only if the 'bulkWrite' operation completes without error
        if (bulkWriteResult.ok) cache.pushInKnownStationIds(listNewStationIds);
    });
};

module.exports.updateStationsCollection = updateStationsCollection;