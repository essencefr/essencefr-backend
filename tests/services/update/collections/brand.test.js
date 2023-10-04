/**
 * Testing the save brand document feature
 */

const mongoose = require('mongoose');
const { Brand } = require('../../../../models/brand');
const { stationRawObjectList } = require('../../../const');
const { generateBrandObjectList } = require('../../../../utils/convert');
const { bulkWriteBrandsCollection } = require('../../../../services/update/collections/brands');
const { clearCollections, connectToDB } = require('../../../common');

let cache = null;

// main test suite:
describe('save/update history feature', () => {
    beforeAll(async () => {
        cache = require('../../../../services/cache');
        connectToDB();
        await clearCollections();
    });
    afterEach(async () => {
        await clearCollections();
        cache.flushAll();
    });
    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('insert document into the DB', () => {
        test('data should be avaiable after being saved into the DB', async () => {
            const brandObjectList = await generateBrandObjectList(stationRawObjectList);
            await bulkWriteBrandsCollection(brandObjectList);
            const doc = await Brand.findById(brandObjectList[0]._id);
            expect(doc).toBeDefined();
            expect(doc).not.toBe(null);
            expect(doc.name).toBe(brandObjectList[0].name);
        });

        test('saving two documents with the same _id should raise an error and none of the documents should be saved into the DB', async () => {
            const brandObjectList = await generateBrandObjectList(stationRawObjectList);
            const brandObjectListDuplicate = [brandObjectList[0], brandObjectList[0]];  // array with two identical documents
            await expect(bulkWriteBrandsCollection(brandObjectListDuplicate)).rejects.toThrow(/duplicate key error/i);
            // read DB:
            const doc = await Brand.findById(brandObjectListDuplicate[0]._id);
            // compare results:
            expect(doc).toBeNull();
            expect(cache.get(cache.keyKnownBrandIds)).toEqual([]);
        });

        test('saving no converted raw data should raise an error', async () => {
            // ensure that missing fields are detected:
            const brandObjectList = await generateBrandObjectList(stationRawObjectList);
            const brandObject = JSON.parse(JSON.stringify(brandObjectList[0]));
            delete brandObject.name;
            await expect(bulkWriteBrandsCollection([brandObject])).rejects.toThrow(/Path .* is required/i);
        });
    });
});