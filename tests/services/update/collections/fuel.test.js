/**
 * Testing the save fuel feature
 */

const mongoose = require('mongoose');
const { Fuel } = require('../../../../models/fuel');
const { stationRawObjectList } = require('../../../const');
const { generateFuelObjectList } = require('../../../../utils/convert');
const { bulkWriteFuelsCollection } = require('../../../../services/update/collections/fuels');


let server = null;
let cache = null;

// main test suite:
describe('save/update history feature', () => {
    beforeAll(() => {
        cache = require('../../../../services/cache');
    });
    beforeEach(() => {
        server = require('../../../../index');
    });
    afterEach(async () => {
        cache.flushAll();
        server.close();
        await Fuel.deleteMany({});
    });
    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('insert document into the DB', () => {
        test('data should be avaiable after being saved into the DB', async () => {
            const fuelObjectList = generateFuelObjectList(stationRawObjectList);
            await bulkWriteFuelsCollection(fuelObjectList);
            const doc = await Fuel.findById(fuelObjectList[0]._id);
            expect(doc).toBeDefined();
            expect(doc).not.toBe(null);
            expect(doc.name).toBe(fuelObjectList[0].name);
        });

        test('saving two documents with the same _id should raise an error and none of the documents should be saved into the DB', async () => {
            const fuelObject = generateFuelObjectList(stationRawObjectList)[0];
            const fuelObjectList = [fuelObject, fuelObject];  // array with two identical documents
            await expect(bulkWriteFuelsCollection(fuelObjectList)).rejects.toThrow(/duplicate key error/i);
            // read DB:
            const doc = await Fuel.findById(fuelObjectList[0]._id);
            // compare results:
            expect(doc).toBeNull();
            expect([[], undefined]).toContain(cache.get(cache.keyKnownFuelIds));
        });

        test('saving no converted raw data should raise an error', async () => {
            // ensure that missing fields are detected:
            const fuelObject = generateFuelObjectList(stationRawObjectList)[0];
            delete fuelObject.name;
            await expect(bulkWriteFuelsCollection([fuelObject])).rejects.toThrow(/Path .* is required/i);
        });
    });
});