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
            await processRawData(stationRawObjectList, 1);
            for (let i=0; i<stationRawObjectList.length; i++) {
                // read DB:
                const doc = await Station.findById(stationRawObjectList[i].id);
                expect(doc).toBeDefined();
                expect(doc).not.toBeNull();
                expect(doc.address.streetLine).toEqual(stationRawObjectList[i].adresse);  // check a single field just to be sure
            }
        });
    });

    // describe('update routine', () => {
    //     test('data should be present in the DB after the update routine', async () => {
    //         await updateRoutine();
    //         // read DB:
    //         const doc = await Station.findById(stationRawObjectList[0].id);  // this works because the ids used in extracts come from the real data retrieved from the api
    //         expect(doc).toBeDefined();
    //         expect(doc).not.toBeNull();
    //         expect(doc.address.streetLine).toEqual(stationRawObjectList[0].adresse);  // check a single field just to be sure
    //     }, 300000);  // set timeout to 5 min
    // });
});