/**
 * Code called to update the documents in the database
 */

const logger = require('../../../logger');
const cache = require('../../cache');
const { Fuel } = require('../../../models/fuel');
const { runInMongooseTransaction, executeAfterMongooseTransaction } = require("../../../utils/transactions");
const { generateFuelObjectList } = require('../../../utils/convert');


/**
 * Insert and update documents in DB collection in a single 'bulkWrite' instruction, within a transaction
 * 
 * No update operation is performed. We consider that the fuel documents never change.
 * 
 * @param {Array<Object>} fuelObjectsToInsert List of fuel objects to insert in the DB
 */
async function bulkWriteFuelsCollection(fuelObjectsToInsert, session = null) {
    if (typeof fuelObjectsToInsert == 'undefined') throw Error(`You should provide a 'fuelObjectsToInsert' parameter. Given: '${fuelObjectsToInsert}'`);
    let bulkOperations = [];
    let listNewFuelIds = [];
    // insert operations:
    for (let i = 0; i < fuelObjectsToInsert.length; i++) {
        // validate the javascript objects in order to log them if any issue occurs:
        try {
            await Fuel.validate(fuelObjectsToInsert[i]);
        } catch (error) {
            // adding a field in the error object:
            error.objectValidated = fuelObjectsToInsert[i];
            error.message = 'Error before fuel insert - ' + error.message;
            throw error;  // re-throw
        }
        // save operation:
        listNewFuelIds.push(fuelObjectsToInsert[i]._id);
        bulkOperations.push({
            insertOne:
            {
                document: fuelObjectsToInsert[i]
            }
        });
    };

    // logger.info(`Fuel bulkOperations: ${bulkOperations}`, { bulkOperations });

    // prepare the cache to be updated at end of transaction:
    executeAfterMongooseTransaction(() => {
        cache.pushInKnownFuelIds(listNewFuelIds);
    });
    // save the data within a transaction so that no data will be stored if an _id already exists:
    await runInMongooseTransaction(session, async (session) => {
        await Fuel.bulkWrite(bulkOperations, { session });
    });
};

/**
 * Wrapper that recieves a list of raw station objects and process them to correctly update the fuel collection
 * @param {Array<Object>} stationRawObjectList list of raw station objects
 * @param {Boolean} session session object linked to a current mongoose transaction (optionnal)
 * @param {Boolean} bypassValidation flag to bypass the input format validation for better performance (optionnal)
 */
async function updateFuelsCollection(stationRawObjectList, session = null, bypassValidation = false) {
    const fuelObjectsList = await generateFuelObjectList(stationRawObjectList, bypassValidation);
    await bulkWriteFuelsCollection(fuelObjectsList, session);
};

module.exports.bulkWriteFuelsCollection = bulkWriteFuelsCollection;
module.exports.updateFuelsCollection = updateFuelsCollection;