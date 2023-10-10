/**
 * Code called to update values in the database
 */

const cache = require('../../cache');
const { Station } = require('../../../models/station');
const { filterKnownObjects } = require('../../../utils/filter');
const { runInMongooseTransaction, executeAfterMongooseTransaction } = require('../../../utils/transactions');
const { executeAndLogPerformance } = require('../../../utils/timer');


/**
 * Insert and update documents in DB collection in a single 'bulkWrite' instruction, within a transaction
 * @param {Array<Object>} stationObjectsToInsert List of station objects to insert in the DB
 * @param {Array<Object>} stationObjectsToUpdate List of station objects to update within the DB
 */
async function bulkWriteStationsCollection(stationObjectsToInsert, stationObjectsToUpdate, session = null) {
    if (typeof stationObjectsToInsert == 'undefined') throw Error(`You should provide a 'stationObjectsToInsert' parameter. Given: '${stationObjectsToInsert}'`);
    if (typeof stationObjectsToUpdate == 'undefined') throw Error(`You should provide a 'stationObjectsToUpdate' parameter. Given: '${stationObjectsToUpdate}'`);
    let bulkOperations = [];
    let listNewStationIds = [];
    // insert operations:
    for (let i = 0; i < stationObjectsToInsert.length; i++) {
        // validate the javascript objects in order to log them if any issue occurs:
        try {
            await Station.validate(stationObjectsToInsert[i]);
        } catch (error) {
            // adding a field in the error object:
            error.objectValidated = stationObjectsToInsert[i];
            error.message = 'Error before station insert > ' + error.message;
            throw error;  // re-throw
        }
        // save operations:
        listNewStationIds.push(stationObjectsToInsert[i]._id);
        bulkOperations.push({
            insertOne:
            {
                document: stationObjectsToInsert[i]
            }
        });
    };
    // update operations:
    for (let i = 0; i < stationObjectsToUpdate.length; i++) {
        // validate the javascript objects in order to log them if any issue occurs:
        try {
            await Station.validate(stationObjectsToUpdate[i]);
        } catch (error) {
            // adding a field in the error object:
            error.objectValidated = stationObjectsToUpdate[i];
            error.message = 'Error before station update > ' + error.message;
            throw error;  // re-throw
        }
        // save operations:
        bulkOperations.push({
            updateOne:
            {
                filter: {
                    _id: stationObjectsToUpdate[i]._id
                },                
                update: {
                    $set: (() => {
                        // construct the 'set' field:
                        let setObject = {
                            'name': stationObjectsToUpdate[i].name,                    
                            'brand': stationObjectsToUpdate[i].brand,
                            'address': stationObjectsToUpdate[i].address,
                            'coordinates': stationObjectsToUpdate[i].coordinates
                        };                        
                        let filterName = null;
                        stationObjectsToUpdate[i].fuels.forEach((fuel) => {
                            filterName = `filter${fuel._id}`;  // use the fuel 'id' as filter name since this is the only immutable field in a fuel object

                            // change fuel shortName field only for matching fuels:
                            setObject[`fuels.$[${filterName}idonly].shortName`] = fuel.shortName;

                            // change fuel prices and dates only if the new date is more recent than the one already saved into the DB:
                            setObject[`fuels.$[${filterName}].price`] = fuel.price;
                            setObject[`fuels.$[${filterName}].date`] = fuel.date;
                            filterName = null;
                        });
                        return setObject;
                    })(),
                    $push: (() => {
                        // construct the 'push' field:
                        let pushObject = {};
                        stationObjectsToUpdate[i].fuels.forEach((fuel) => {
                            // push new object inhistory only if the new date is more recent than the one already saved into the DB:
                            pushObject[`fuels.$[filter${fuel._id}].history`] = { date: fuel.date, price: fuel.price };
                        });
                        return pushObject;
                    })()
                },
                arrayFilters: (() => {
                    // construct the array filters:
                    let arrayFilters = [];
                    let filterObject = {};
                    let filterName = null;
                    stationObjectsToUpdate[i].fuels.forEach((fuel) => {
                        filterName = `filter${fuel._id}`;  // use the fuel 'id' as filter name since this is the only immutable field in a fuel object

                        // create filter to change fuel shortName field only for matching fuels:
                        filterObject[`${filterName}idonly._id`] = fuel._id;
                        arrayFilters.push(filterObject);
                        filterObject = {};  // reset value

                        // create filter to change fuel prices and dates only if the new date is more recent than the one already saved into the DB:
                        filterObject[`${filterName}._id`] = fuel._id;
                        filterObject[`${filterName}.date`] = { $lt: fuel.date };
                        arrayFilters.push(filterObject);
                        filterObject = {};  // reset value

                        filterName = null;  // reset value
                    });
                    return arrayFilters;
                })()
            }
        });
    };
    // prepare the cache to be updated at end of transaction:
    executeAfterMongooseTransaction(() => {
        cache.pushInKnownStationIds(listNewStationIds);
    });
    // save the data within a transaction so that no data will be stored if an _id already exists:
    await runInMongooseTransaction(session, async (session) => {
        await executeAndLogPerformance('mongoose bulkwrite itself', 'silly', async () => {
            await Station.bulkWrite(bulkOperations, { session });
        });
    });
};

/**
 * Wrapper that recieves a list of station objects and process them to correctly update the station collection
 * @param {*} stationObjectList list of station objects
 * @param {*} session session object linked to a current mongoose transaction (optionnal)
 */
async function updateStationsCollection(stationObjectList, session = null) {
    let stationObjectListFiltered = null;
    await executeAndLogPerformance('filter station object list', 'silly', async () => {
        const listKnownStationIds = await cache.getKnownStationIds();
        stationObjectListFiltered = filterKnownObjects(stationObjectList, listKnownStationIds);
    });
    await executeAndLogPerformance('bulk write stations collection', 'silly', async () => {
        await bulkWriteStationsCollection(stationObjectListFiltered.objectsNew, stationObjectListFiltered.objectsKnown, session);
    });
};

module.exports.bulkWriteStationsCollection = bulkWriteStationsCollection;
module.exports.updateStationsCollection = async (stationRawObjectList, session = null) => { await executeAndLogPerformance('Update stations collection', 'verbose', async () => { await updateStationsCollection(stationRawObjectList, session) }) };
