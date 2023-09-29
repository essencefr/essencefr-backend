/**
 * Testing the filter features
 */

const mongoose = require('mongoose');
const { convertStationsFormat } = require('../../utils/convert');
const { filterKnownObjects } = require('../../utils/filter');
const { stationRawObjectList } = require('../const');

let server = null;
let cache = null;

// main test suite:
describe('save/update history feature', () => {
    beforeEach(() => {
        server = require('../../index');
        cache = require('../../cache/cache');
    });
    afterEach(async () => {
        server.close();
        cache.flushAll();
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
            const { updateStationsCollection } = require('../../utils/update/stations');
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await updateStationsCollection(stationObjectList, []);
            const listKnownStationIds = await cache.getKnownStationIds();
            const stationObjectListFiltered = filterKnownObjects(stationObjectList, listKnownStationIds);
            expect(stationObjectListFiltered).toBeDefined();
            expect(stationObjectListFiltered.objectsNew.length).toBe(0);
            expect(stationObjectListFiltered.objectsKnown.length).toBe(1);
        });
    });
});