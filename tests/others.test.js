/**
 * Other tests, not related to specific modules
 */

const mongoose = require('mongoose');
const { Station } = require('../models/station');
const { processRawData } = require('../services/update/routine');
const { clearCollections, connectToDB } = require('./common');
const { stationRawObjectList } = require('./const');

let cache = null;

describe('other tests', () => {
    beforeAll(async () => {
        cache = require('../services/cache');
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

    describe('stress tests', () => {
        test('multiple insert and delete operations should not lead to a missing/unfound document in the DB', async () => {
            const nbIterations = 10;
            for(let i=0; i<nbIterations; i++) {
                // console.log(`############################## ITERATION n°${i} ##############################`);

                // fill the DB:
                await processRawData(stationRawObjectList);

                // ensure station doc has been inserted in the DB:
                let doc = await Station.findById(stationRawObjectList[0].id);
                expect(doc).toBeDefined();
                expect(doc).not.toBeNull();

                // cleaning:
                await clearCollections();
                cache.flushAll();
            }
        },
        20000);  // timeout in miliseconds
    });

});