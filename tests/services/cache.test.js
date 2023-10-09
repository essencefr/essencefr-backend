/**
 * Tests related to cache module
 */

const mongoose = require('mongoose');
const { Station } = require('../../models/station');;
const { processRawData } = require('../../services/update/collections/all');
const { clearCollections, connectToDB } = require('../common');
const { stationRawObjectList } = require('../const');

let cache = null;

describe('cache tests', () => {
    beforeAll(async () => {
        cache = require('../../services/cache');
        connectToDB();
        await clearCollections();
    });
    afterEach(async () => {
        jest.restoreAllMocks();
        await clearCollections();
        cache.flushAll();
    });
    afterAll(async () => {
        await mongoose.disconnect();
    });

    test('cache should be updated after adding a document into the DB', async () => {
        const stationRawObject = stationRawObjectList[0];  // only consider the first stationRawObject for this test
        // process raw data:
        await processRawData([stationRawObject]);
        // read cache for station ids:
        const listKnownStationIds = cache.get(cache.keyKnownStationIds);
        expect(listKnownStationIds).toContain(stationRawObject.id);
    });

    test('cache should be emptied directly after calling \'flushAll\'', async () => {
        const stationRawObject = stationRawObjectList[0];  // only consider the first stationRawObject for this test
        // process raw data in order to fill up the cache:
        await processRawData([stationRawObject]);
        // flush cache:
        cache.flushAll();
        const cacheKeys = cache.keys();
        expect(cacheKeys).toEqual([]);
    });

    test('cache should scan the DB when it is empty and we are inserting a document into the DB', async () => {
        // mock functions:
        const spyStationFind = jest.spyOn(Station, 'find');
        // process raw data in order to update the cache:
        const stationRawObject = stationRawObjectList[0];  // only consider the first stationRawObject for this test
        await processRawData([stationRawObject]);
        // ensure the DB have been analyzed in order to fill up the cache:
        expect(spyStationFind).toHaveBeenCalled();
    });

    test('cache should not scan the DB when it is the second time we are inserting a document into the DB', async () => {
        // mock functions:
        const spyStationFind = jest.spyOn(Station, 'find');
        // process raw data in order to update the cache:
        const stationRawObject = stationRawObjectList[0];  // only consider the first stationRawObject for this test
        await processRawData([stationRawObject]);
        await processRawData([stationRawObject]);  // repeat operation
        // ensure the DB have been analyzed only once in order to fill up the cache:
        expect(spyStationFind).toHaveBeenCalledTimes(1);
    });
});