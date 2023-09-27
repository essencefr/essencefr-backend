/**
 * Functions used to update values in the database
 */

const { History, validateHistoryUpdate } = require("../../models/history");
const { runInMongooseTransaction } = require('../transactions');


/**
 * Insert and update documents in DB collection in a single 'bulkWrite' instruction, within a transaction
 * @param {Array<Object>} historyObjectsToInsert List of history objects to insert in the DB
 * @param {Array<Object>} historyObjectsToUpdate List of history objects to update within the DB. Should respect the format historyUpdateSchema defined in models
 */
async function updateHistoryCollection(historyObjectsToInsert, historyObjectsToUpdate, session=null) {
    if (typeof historyObjectsToInsert == 'undefined') throw Error(`You should provide a 'historyObjectsToInsert' parameter. Given: '${historyObjectsToInsert}'`);
    if (typeof historyObjectsToUpdate == 'undefined') throw Error(`You should provide a 'historyObjectsToUpdate' parameter. Given: '${historyObjectsToUpdate}'`);
    let bulkOperations = [];
    // insert operations:
    for (let i = 0; i < historyObjectsToInsert.length; i++) {
        bulkOperations.push({
            insertOne: {
                document: historyObjectsToInsert[i]
            }
        });
    };
    // update operations:
    for (let i = 0; i < historyObjectsToUpdate.length; i++) {
        const { error } = validateHistoryUpdate(historyObjectsToUpdate[i]);
        if (error) throw Error(`Validation error: ${error.details[0].message}`);
        // updateOne operation parameters:
        let filter = {
            'station._id': historyObjectsToUpdate[i].station._id,
            'fuel._id': historyObjectsToUpdate[i].fuel._id
            // or just : _id: parseInt(`${historyObjectsToUpdate[i].station._id}${historyObjectsToUpdate[i].fuel._id}`) (which filter is faster ? -> analysis TODO)
        };
        let update = {
            $set: { 'station.name': historyObjectsToUpdate[i].station.name,
                    'fuel.shortName': historyObjectsToUpdate[i].fuel.shortName }
        };
        // add elements to operation parameters if historyUpdateObject has a newPrice field:
        if (historyObjectsToUpdate[i].newPrice) {
            filter.lastUpdate = { $ne: historyObjectsToUpdate[i].newPrice.date };
            update.$push = { history: historyObjectsToUpdate[i].newPrice }
        };
        // push updateOne operation in the array:
        bulkOperations.push({
            updateOne: {
                filter: filter,
                update: update
            }
        });
    };
    // execute:
    // save the data within a transaction so that no data will be stored if an _id already exists:
    if(session) {  // i.e. a transaction has already been initialized
        await History.bulkWrite(bulkOperations, { session });
    } else {
        await runInMongooseTransaction(async (session) => {
            await History.bulkWrite(bulkOperations, { session });
        });
    };
};

module.exports.updateHistoryCollection = updateHistoryCollection;