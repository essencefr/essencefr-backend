/**
 * Functions used to update values in the database
 */

const cache = require('../../cache');
const { History } = require('../../../models/history');
const { filterKnownObjects } = require('../../../utils/filter');
const { runInMongooseTransaction, executeAfterMongooseTransaction } = require('../../../utils/transactions');
const { generateHistoryObjectList } = require('../../../utils/convert');


/**
 * Insert and update documents in DB collection in a single 'bulkWrite' instruction, within a transaction
 * @param {Array<Object>} historyObjectsToInsert List of history objects to insert in the DB
 * @param {Array<Object>} historyObjectsToUpdate List of history objects to update within the DB. Should respect the format historyUpdateSchema defined in models
 */
async function bulkWriteHistoryCollection(historyObjectsToInsert, historyObjectsToUpdate, session=null) {
    if (typeof historyObjectsToInsert == 'undefined') throw Error(`You should provide a 'historyObjectsToInsert' parameter. Given: '${historyObjectsToInsert}'`);
    if (typeof historyObjectsToUpdate == 'undefined') throw Error(`You should provide a 'historyObjectsToUpdate' parameter. Given: '${historyObjectsToUpdate}'`);
    let bulkOperations = [];
    let listNewHistoryIds = [];
    // insert operations:
    for (let i = 0; i < historyObjectsToInsert.length; i++) {
        await History.validate(historyObjectsToInsert[i]);  // validate object (custom validation is not performed by the 'bulkWrite' method)
        listNewHistoryIds.push(historyObjectsToInsert[i]._id);
        bulkOperations.push({
            insertOne: {
                document: historyObjectsToInsert[i]
            }
        });
    };
    // update operations:
    for (let i = 0; i < historyObjectsToUpdate.length; i++) {
        await History.validate(historyObjectsToUpdate[i]);  // validate object (custom validation is not performed by the 'bulkWrite' method)
        // push updateOne operation in the array:
        // TODO: it only uses the first element of 'history' array, but no check is performed to ensure that it has a single element
        bulkOperations.push({
            updateOne: {
                filter: {
                    'station._id': historyObjectsToUpdate[i].station._id,
                    'fuel._id': historyObjectsToUpdate[i].fuel._id,
                    // or just : _id: parseInt(`${historyObjectsToUpdate[i].station._id}${historyObjectsToUpdate[i].fuel._id}`) (which filter is faster ? -> analysis TODO)
                    lastUpdate: { $ne: historyObjectsToUpdate[i].lastUpdate }
                },
                update: {
                    $set: { 'station.name': historyObjectsToUpdate[i].station.name,
                            'fuel.shortName': historyObjectsToUpdate[i].fuel.shortName,
                            'lastUpdate': historyObjectsToUpdate[i].lastUpdate },
                    $push: { history: historyObjectsToUpdate[i].history[0] }
                }
            }
        });
    };
    // prepare the cache to be updated at end of transaction:
    executeAfterMongooseTransaction(() => {
        cache.pushInKnownHistoryIds(listNewHistoryIds);
    });
    // save the data within a transaction so that no data will be stored if an _id already exists:
    await runInMongooseTransaction(session, async (session) => {
        await History.bulkWrite(bulkOperations, { session });
    });
};

/**
 * Wrapper that recieves a list of station objects and process them to correctly update the history collection
 * @param {*} stationObjectList list of station objects
 * @param {*} session session object linked to a current mongoose transaction (optionnal)
 */
async function updateHistoryCollection(stationObjectList, session=null) {
    const historyObjectsList = generateHistoryObjectList(stationObjectList);
    const listKnownHistoryIds = await cache.getKnownHistoryIds();
    const historyObjectListFiltered = filterKnownObjects(historyObjectsList, listKnownHistoryIds);
    await bulkWriteHistoryCollection(historyObjectListFiltered.objectsNew, historyObjectListFiltered.objectsKnown, session);
};

module.exports.bulkWriteHistoryCollection = bulkWriteHistoryCollection;
module.exports.updateHistoryCollection = updateHistoryCollection;