/**
 * Code called to update values in the database
 */

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
    // insert operations:
    for(let i=0; i < stationObjectsToInsert.length; i++) {
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
    // execute:
    // save the data within a transaction so that no data will be stored if an _id already exists:
    if(session) {  // i.e. a transaction has already been initialized
        await Station.bulkWrite(bulkOperations, { session });
    } else {
        await runInMongooseTransaction(async (session) => {
            await Station.bulkWrite(bulkOperations, { session });
        });
    };
};

module.exports.updateStationsCollection = updateStationsCollection;