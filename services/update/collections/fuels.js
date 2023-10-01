/**
 * Code called to update the documents in the database
 */

const cache = require('../../cache');
const { Fuel } = require('../../../models/fuel');
const { runInMongooseTransaction } = require("../../../utils/transactions");


/**
 * Insert and update documents in DB collection in a single 'bulkWrite' instruction, within a transaction
 * 
 * No update operation is performed. We consider that the fuel documents never change.
 * 
 * @param {Array<Object>} fuelObjectsToInsert List of fuel objects to insert in the DB
 */
async function bulkWriteFuelsCollection(fuelObjectsToInsert, session=null) {
    if (typeof fuelObjectsToInsert == 'undefined') throw Error(`You should provide a 'fuelObjectsToInsert' parameter. Given: '${fuelObjectsToInsert}'`);
    let bulkOperations = [];
    let listNewFuelIds = [];
    // insert operations:
    for(let i=0; i < fuelObjectsToInsert.length; i++) {
        listNewFuelIds.push(fuelObjectsToInsert[i]._id);
        bulkOperations.push({
            insertOne:
                {
                    document: fuelObjectsToInsert[i]
                }
        });
    };
    // save the data within a transaction so that no data will be stored if an _id already exists:
    await runInMongooseTransaction(session, async (session) => {
        const bulkWriteResult = await Fuel.bulkWrite(bulkOperations, { session });
        // update cache only if the 'bulkWrite' operation completes without error
        if (bulkWriteResult.ok) cache.pushInKnownFuelIds(listNewFuelIds);
    });
};

module.exports.bulkWriteFuelsCollection = bulkWriteFuelsCollection;