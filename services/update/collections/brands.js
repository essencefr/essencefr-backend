/**
 * Code called to update the documents in the database
 */

const cache = require('../../cache');
const { Brand } = require('../../../models/brand');
const { runInMongooseTransaction, executeAfterMongooseTransaction } = require('../../../utils/transactions');
const { generateBrandObjectList } = require('../../../utils/convert');


/**
 * Insert and update documents in DB collection in a single 'bulkWrite' instruction, within a transaction
 * 
 * No update operation is performed. We consider that the brand documents never change.
 * 
 * @param {Array<Object>} brandObjectsToInsert List of brand objects to insert in the DB
 */
async function bulkWriteBrandsCollection(brandObjectsToInsert, session = null) {
    if (typeof brandObjectsToInsert == 'undefined') throw Error(`You should provide a 'brandObjectsToInsert' parameter. Given: '${brandObjectsToInsert}'`);
    let bulkOperations = [];
    let listNewBrandIds = [];
    // insert operations:
    for (let i = 0; i < brandObjectsToInsert.length; i++) {
        listNewBrandIds.push(brandObjectsToInsert[i]._id);
        bulkOperations.push({
            insertOne:
            {
                document: brandObjectsToInsert[i]
            }
        });
    };
    // prepare the cache to be updated at end of transaction:
    executeAfterMongooseTransaction(() => {
        cache.pushInKnownBrandIds(listNewBrandIds);
    });
    // save the data within a transaction so that no data will be stored if an _id already exists:
    await runInMongooseTransaction(session, async (session) => {
        await Brand.bulkWrite(bulkOperations, { session });
    });
};

/**
 * Wrapper that recieves a list of raw station objects and process them to correctly update the brand collection
 * @param {Array<Object>} stationRawObjectList list of raw station objects
 * @param {Boolean} session session object linked to a current mongoose transaction (optionnal)
 * @param {Boolean} bypassValidation flag to bypass the input format validation for better performance (optionnal)
 */
async function updateBrandsCollection(stationRawObjectList, session = null, bypassValidation = false) {
    const brandObjectsList = await generateBrandObjectList(stationRawObjectList, bypassValidation);
    // validate the javascript objects in order to log them if any issue occurs:
    for(let i=0; i<brandObjectsList.length; i++) {
        try {
            await Brand.validate(brandObjectsList[i]);
        } catch (error) {
            // adding a field in the error object:
            error.objectValidated = brandObjectsList[i];
            error._message_details = 'Failed to validate brand object';
            throw error;  // re-throw
        }
    }
    await bulkWriteBrandsCollection(brandObjectsList, session);
};

module.exports.bulkWriteBrandsCollection = bulkWriteBrandsCollection;
module.exports.updateBrandsCollection = updateBrandsCollection;