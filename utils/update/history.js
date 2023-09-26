/**
 * Functions used to update values in the database
 */

const { History } = require("../../models/history");
const { runInMongooseTransaction } = require('../transactions');


/**
 * Insert and update documents in DB collection in a single 'bulkWrite' instruction, within a transaction
 * @param {Array<Object>} historyObjectsToInsert List of history objects to insert in the DB
 * @param {Array<Object>} historyObjectsToUpdate List of history objects to update within the DB
 */
async function updateHistoryCollection(historyObjectsToInsert, historyObjectsToUpdate) {
    if(typeof historyObjectsToInsert == 'undefined') throw Error(`You should provide a 'historyObjectsToInsert' parameter. Given: '${historyObjectsToInsert}'`);
    if(typeof historyObjectsToUpdate == 'undefined') throw Error(`You should provide a 'historyObjectsToUpdate' parameter. Given: '${historyObjectsToUpdate}'`);
    let bulkOperations = [];
    // insert operations:
    for(let i=0; i < historyObjectsToInsert.length; i++) {
        bulkOperations.push({
            insertOne:
                {
                    document: historyObjectsToInsert[i]
                }
        });
    };
    // update operations:
    for(let i=0; i < historyObjectsToUpdate.length; i++) {
        bulkOperations.push({
            updateOne:
                {
                    filter: {
                        'station._id': historyObjectsToUpdate[i].station._id,
                        'fuel._id': historyObjectsToUpdate[i].fuel._id
                    },
                    update: { $push: { history: historyObjectsToUpdate[i].history[0] } }  // TODO: ensure that historyObjectsToUpdate[i].history has a single element
                }
        });
    };
    // execute:
    // save the data within a transaction so that no data will be stored if an _id already exists:
    await runInMongooseTransaction(async (session) => {
        await History.bulkWrite(bulkOperations, { session });
    });
};

module.exports.updateHistoryCollection = updateHistoryCollection;