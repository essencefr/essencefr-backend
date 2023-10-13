/**
 * Testing the routine feature
 */

const mongoose = require('mongoose');
const { clearCollections, connectToDB } = require('../../common');
const { processRawData, updateRoutine } = require('../../../services/update/routine');
const { stationRawObjectList } = require('../../const');
const { Station } = require('../../../models/station');


let cache = null;

// main test suite:
describe('save/update history feature', () => {
    beforeAll(async () => {
        cache = require('../../../services/cache');
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

    describe('process raw data', () => {
        test('data should be present in the DB after processing raw data', async () => {
            await processRawData(stationRawObjectList);
            // read DB:
            for (let i=0; i<stationRawObjectList.length; i++) {
                // read DB:
                const doc = await Station.findById(stationRawObjectList[i].id);
                expect(doc).not.toBeNull();
                expect(doc.address.streetLine).toEqual(stationRawObjectList[i].adresse);  // check a single field just to be sure
            }
        });
    });

    describe('update routine', () => {
        test('data should be present in the DB after the update routine', async () => {
            await updateRoutine(false);  // do not send email after test (avoid email spam + syncro errors because of the 'afterEach'/'afterAll' operations)
            // read DB:
            const listKnownStationIds = await cache.getKnownStationIds();
            expect(listKnownStationIds).toBeDefined();
            expect(listKnownStationIds.length).toBeGreaterThanOrEqual(1);
            const doc = await Station.findById(listKnownStationIds[0]);
            expect(doc).toBeDefined();
            expect(doc).not.toBeNull();
        }, 60000);  // set timeout to 1 min
    });
});