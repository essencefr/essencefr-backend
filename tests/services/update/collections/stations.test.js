/**
 * Testing the save/update stations feature
 */

const mongoose = require('mongoose');
const { Station } = require('../../../../models/station');
const { stationRawObjectList } = require('../../../const');
const { bulkWriteStationsCollection } = require('../../../../services/update/collections/stations');
const { convertStationsFormat } = require('../../../../utils/convert');
const { clearCollections, connectToDB } = require('../../../common');

let cache = null;

// main test suite:
describe('save/update station feature', () => {
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

    describe('insert station data into database', () => {
        test('data should be avaiable after being saved into the DB', async () => {
            // save data:
            const stationObject = convertStationsFormat(stationRawObjectList)[0];
            await bulkWriteStationsCollection([stationObject], []);
            // read DB:
            const doc = await Station.findById(stationObject._id);
            // compare results:
            expect(doc).not.toBeNull();
            expect(doc._id).toEqual(stationObject._id);
            expect(doc.name).toEqual(stationObject.name);
            expect(doc.name).toEqual(null);  // name should be null (default value)
            expect(doc.brand).toEqual(stationObject.brand);
            expect(doc.brand).toEqual(null);  // name should be null (default value)
            expect(doc.address.streetLine).toEqual(stationObject.address.streetLine);
            expect(doc.address.cityLine).toEqual(stationObject.address.cityLine);
            expect(doc.coordinates.latitude).toEqual(stationObject.coordinates.latitude);
            expect(doc.coordinates.longitude).toEqual(stationObject.coordinates.longitude);
            expect(doc.fuels.length).toEqual(stationObject.fuels.length);
            for (let i=0; i<doc.fuels.length; i++) {
                expect(doc.fuels[i]._id).toEqual(stationObject.fuels[i]._id);
                expect(doc.fuels[i].shortName).toEqual(stationObject.fuels[i].shortName);
                expect(doc.fuels[i].date).toEqual(stationObject.fuels[i].date);
                for (let j=0; j<doc.fuels[i].history.length; j++) {
                    expect(doc.fuels[i].history[j].date).toEqual(stationObject.fuels[i].history[j].date);
                    expect(doc.fuels[i].history[j].price).toEqual(stationObject.fuels[i].history[j].price);
                }
            }
        });
        
        test('saving two stations with the same _id should raise an error and none of the stations should be saved into the DB', async () => {
            const stationObject = convertStationsFormat(stationRawObjectList)[0];
            const stationObjectList = [stationObject, stationObject];  // array with two identical documents
            await expect(bulkWriteStationsCollection(stationObjectList, [])).rejects.toThrow(/duplicate key error/i);
            // read DB:
            const doc = await Station.findById(stationObject._id);
            // compare results:
            expect(doc).toBeNull();
            expect([[], undefined]).toContain(cache.get(cache.keyKnownStationIds));
        });

        test('saving no converted raw data should raise an error', async () => {
            // ensure that missing fields are detected:
            await expect(bulkWriteStationsCollection(stationRawObjectList, [])).rejects.toThrow(/Path .* is required/i);
        });
        
        test('a field unkown by the model should not be saved in the DB', async () => {
            let stationObject = convertStationsFormat(stationRawObjectList)[0];
            stationObject.newField = "a new field";
            await bulkWriteStationsCollection([stationObject], []);
            // read DB:
            const doc = await Station.findById(stationObject._id);
            // compare results:
            expect(doc).not.toBeNull();
            expect(doc.newField).toBeUndefined();
        });
    });

    describe('updating station data into database', () => {
        test('data updated should be avaiable after updating an existing document', async () => {
            let stationObject = convertStationsFormat(stationRawObjectList)[0];
            const stationId = stationObject._id;
            await bulkWriteStationsCollection([stationObject], []);  // insert document into DB
            const newStationName = "New station name";
            stationObject.name = newStationName;
            stationObject.fuels[0].price = 999;
            await bulkWriteStationsCollection([], [stationObject]);  // update documents
            // read DB:
            const doc = await Station.findById(stationObject._id);
            // compare results:
            expect(doc).not.toBeNull();
            expect(doc._id).toEqual(stationId);
            expect(doc.name).toEqual(newStationName);
        });
    });
});