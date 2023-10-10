/**
 * Testing the save/update stations feature
 */

const mongoose = require('mongoose');
const { Station } = require('../../../../models/station');
const { stationRawObjectList, stationRawObjectListUpdated } = require('../../../const');
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
            const stationObjectList = convertStationsFormat(stationRawObjectList)[0];
            await bulkWriteStationsCollection(stationObjectList, []);
            // read DB:
            for (let i=0; i<stationObjectList.length; i++) {
                const doc = await Station.findById(stationObjectList[i]._id);
                // compare results:
                expect(doc).not.toBeNull();
                expect(doc._id).toEqual(stationObjectList[i]._id);
                expect(doc.name).toEqual(stationObjectList[i].name);
                expect(doc.name).toEqual(null);  // name should be null (default value)
                expect(doc.brand).toEqual(stationObjectList[i].brand);
                expect(doc.brand).toEqual(null);  // name should be null (default value)
                expect(doc.address.streetLine).toEqual(stationObjectList[i].address.streetLine);
                expect(doc.address.cityLine).toEqual(stationObjectList[i].address.cityLine);
                expect(doc.coordinates.latitude).toEqual(stationObjectList[i].coordinates.latitude);
                expect(doc.coordinates.longitude).toEqual(stationObjectList[i].coordinates.longitude);
                expect(doc.fuels.length).toEqual(stationObjectList[i].fuels.length);
                for (let i=0; i<doc.fuels.length; i++) {
                    expect(doc.fuels[i]._id).toEqual(stationObjectList[i].fuels[i]._id);
                    expect(doc.fuels[i].shortName).toEqual(stationObjectList[i].fuels[i].shortName);
                    expect(doc.fuels[i].date).toEqual(stationObjectList[i].fuels[i].date);
                    for (let j=0; j<doc.fuels[i].history.length; j++) {
                        expect(doc.fuels[i].history[j].date).toEqual(stationObjectList[i].fuels[i].history[j].date);
                        expect(doc.fuels[i].history[j].price).toEqual(stationObjectList[i].fuels[i].history[j].price);
                    }
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

    describe('update station data into database', () => {
        test('updated station data should be avaiable after updating an existing document', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await bulkWriteStationsCollection(stationObjectList, []);  // insert document into DB
            const stationObjectUpdatedList = convertStationsFormat(stationRawObjectListUpdated);
            await bulkWriteStationsCollection([], stationObjectUpdatedList);  // update documents
            // read DB:
            for (let i=0; i<stationObjectList.length; i++) {
                const doc = await Station.findById(stationObjectList[i]._id);
                // compare results:
                expect(doc).not.toBeNull();
                expect(doc._id).toEqual(stationObjectList[i]._id);
                expect(doc.address.streetLine).toEqual(stationObjectUpdatedList[i].address.streetLine);
                expect(doc.address.cityLine).toEqual(stationObjectUpdatedList[i].address.cityLine);
                expect(doc.coordinates.latitude).toEqual(stationObjectUpdatedList[i].coordinates.latitude);
                expect(doc.coordinates.longitude).toEqual(stationObjectUpdatedList[i].coordinates.longitude);
            };
        });

        test('fuels date and prices should be updated (both in current and history) if current date is more recent than the one known in the DB', async () => {
            const stationObject = convertStationsFormat(stationRawObjectList)[0];  // use first object
            await bulkWriteStationsCollection([stationObject], []);  // insert document into DB
            const stationObjectUpdated = convertStationsFormat(stationRawObjectListUpdated)[0];  // use the second object in which dates fields are modified
            await bulkWriteStationsCollection([], [stationObjectUpdated]);  // update documents
            // read DB:
            const doc = await Station.findById(stationObject._id);
            // compare results:
            expect(doc).not.toBeNull();
            // fuel.length should not have changed:
            expect(doc.fuels.length).toEqual(stationObject.fuels.length);
            expect(doc.fuels.length).toEqual(stationObjectUpdated.fuels.length);
            for (let i=0; i<doc.fuels.length; i++) {
                expect(doc.fuels[i]._id).toEqual(stationObjectUpdated.fuels[i]._id);
                expect(doc.fuels[i].shortName).toEqual(stationObjectUpdated.fuels[i].shortName);
                expect(doc.fuels[i].date).toEqual(stationObjectUpdated.fuels[i].date);
                expect(doc.fuels[i].price).toEqual(stationObjectUpdated.fuels[i].price);
                // inspect history:
                expect(doc.fuels[i].history.length).toEqual(2);
                // this first element in history should not have changed:
                expect(doc.fuels[i].history[0].date).toEqual(stationObject.fuels[i].history[0].date);
                expect(doc.fuels[i].history[0].price).toEqual(stationObject.fuels[i].history[0].price);
                // this second element in history should correspond to the new price:
                expect(doc.fuels[i].history[1].date).toEqual(stationObjectUpdated.fuels[i].date);
                expect(doc.fuels[i].history[1].price).toEqual(stationObjectUpdated.fuels[i].price);
            }
        });

        test('fuels date and prices should not be updated (neither in current or history) if current date is the one already known in the DB', async () => {
            const stationObject = convertStationsFormat(stationRawObjectList)[1];  // use the second object
            await bulkWriteStationsCollection([stationObject], []);  // insert document into DB
            const stationObjectUpdated = convertStationsFormat(stationRawObjectListUpdated)[1];  // use the second object in which all fields but dates are modified
            await bulkWriteStationsCollection([], [stationObjectUpdated]);  // update documents
            // read DB:
            const doc = await Station.findById(stationObject._id);
            // compare results:
            expect(doc).not.toBeNull();
            // fuel.length should not have changed:
            expect(doc.fuels.length).toEqual(stationObject.fuels.length);
            expect(doc.fuels.length).toEqual(stationObjectUpdated.fuels.length);
            for (let i=0; i<doc.fuels.length; i++) {
                expect(doc.fuels[i]._id).toEqual(stationObjectUpdated.fuels[i]._id);
                expect(doc.fuels[i].shortName).toEqual(stationObjectUpdated.fuels[i].shortName);
                expect(doc.fuels[i].date).toEqual(stationObjectUpdated.fuels[i].date);
                // price should not have changed:
                expect(doc.fuels[i].price).toEqual(stationObject.fuels[i].price);
                expect(doc.fuels[i].price).not.toEqual(stationObjectUpdated.fuels[i].price);
                // inspect history (it should not have changed):
                expect(doc.fuels[i].history.length).toEqual(1);
                // this first element in history should not have changed:
                expect(doc.fuels[i].history[0].date).toEqual(stationObject.fuels[i].history[0].date);
                expect(doc.fuels[i].history[0].price).toEqual(stationObject.fuels[i].history[0].price);
                expect(doc.fuels[i].history[0].price).not.toEqual(stationObjectUpdated.fuels[i].history[0].price);
            }
        });

        test('fuels short names can always be updated no matter the current date', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await bulkWriteStationsCollection(stationObjectList, []);  // insert document into DB
            const stationObjectUpdatedList = convertStationsFormat(stationRawObjectListUpdated);
            // update 'shortName' fields:
            for (stationObjectUpdated of stationObjectUpdatedList) {
                for (let i=0; i<stationObjectUpdated.fuels.length; i++) {
                    stationObjectUpdated.fuels[i].shortName = `new_short_name_${i}`;
                }
            }
            await bulkWriteStationsCollection([], stationObjectUpdatedList);  // update documents
            // read DB:
            for (let j=0; j<stationObjectList.length; j++) {
                const doc = await Station.findById(stationObjectList[j]._id);
                // compare results:
                expect(doc).not.toBeNull();
                for (let i=0; i<doc.fuels.length; i++) {
                    expect(doc.fuels[i].shortName).toEqual(stationObjectUpdatedList[j].fuels[i].shortName);
                }
            }
        });
    });
});