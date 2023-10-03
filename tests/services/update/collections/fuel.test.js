/**
 * Testing the save fuel feature
 */

const mongoose = require('mongoose');
const { Fuel } = require('../../../../models/fuel');
const { stationRawObjectList } = require('../../../const');
const { generateFuelObjectList } = require('../../../../utils/convert');
const { bulkWriteFuelsCollection } = require('../../../../services/update/collections/fuels');
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
            const fuelObjectList = await generateFuelObjectList(stationRawObjectList);
            await bulkWriteFuelsCollection(fuelObjectList);
            const doc = await Fuel.findById(fuelObjectList[0]._id);
            expect(doc).toBeDefined();
            expect(doc).not.toBe(null);
            expect(doc.name).toBe(fuelObjectList[0].name);
        });

        test('saving two documents with the same _id should raise an error and none of the documents should be saved into the DB', async () => {
            const fuelObjectList = await generateFuelObjectList(stationRawObjectList);
            const fuelObjectListDuplicate = [fuelObjectList[0], fuelObjectList[0]];  // array with two identical documents
            await expect(bulkWriteFuelsCollection(fuelObjectListDuplicate)).rejects.toThrow(/duplicate key error/i);
            // read DB:
            const doc = await Fuel.findById(fuelObjectListDuplicate[0]._id);
            // compare results:
            expect(doc).toBeNull();
            expect(cache.get(cache.keyKnownFuelIds)).toEqual([]);
        });

        test('saving no converted raw data should raise an error', async () => {
            // ensure that missing fields are detected:
            const fuelObjectList = await generateFuelObjectList(stationRawObjectList);
            const fuelObject = JSON.parse(JSON.stringify(fuelObjectList[0]));
            delete fuelObject.name;
            await expect(bulkWriteFuelsCollection([fuelObject])).rejects.toThrow(/Path .* is required/i);
        });
    });
});