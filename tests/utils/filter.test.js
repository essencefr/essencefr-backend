/**
 * Testing the filter features
 */

const mongoose = require('mongoose');
const { convertStationsFormat } = require('../../utils/convert');
const { filterKnownObjects } = require('../../utils/filter');
const { stationRawObjectList } = require('../const');
const { clearCollections } = require('../common');

let server = null;
let cache = null;

// main test suite:
describe('save/update history feature', () => {
    beforeAll(async () => {
        cache = require('../../services/cache');
        await clearCollections();
    });
    beforeEach(() => {
        server = require('../../index');
    });
    afterEach(async () => {
        await clearCollections();
        cache.flushAll();
        server.close();
    });
    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('filter feature', () => {
        test('an unknown station data object should be correctly filtered as new', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            const listKnownStationIds = await cache.getKnownStationIds();
            const stationObjectListFiltered = filterKnownObjects(stationObjectList, listKnownStationIds);
            expect(stationObjectListFiltered).toBeDefined();
            expect(stationObjectListFiltered.objectsNew.length).toBe(1);
            expect(stationObjectListFiltered.objectsKnown.length).toBe(0);
        });
    
        test('an already known station data object should be correctly filtered as known', async () => {
            const { bulkWriteStationsCollection } = require('../../services/update/collections/stations');
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await bulkWriteStationsCollection(stationObjectList, []);
            const listKnownStationIds = await cache.getKnownStationIds();
            const stationObjectListFiltered = filterKnownObjects(stationObjectList, listKnownStationIds);
            expect(stationObjectListFiltered).toBeDefined();
            expect(stationObjectListFiltered.objectsNew.length).toBe(0);
            expect(stationObjectListFiltered.objectsKnown.length).toBe(1);
        });
    });
});