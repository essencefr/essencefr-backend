/**
 * Testing the fetch module
 */

const { fetchStations } = require('../../utils/fetch');
const { validateStationRaw } = require('../../utils/validate');

describe('fetch functions', () => {
    describe('fetchStations', () => {
        test('fetching stations should return the expected format', async () => {
            const stationRawObjectList = await fetchStations();
            // check format retrieved:
            expect(stationRawObjectList).toBeDefined();
            expect(stationRawObjectList.length).toBeGreaterThanOrEqual(1);
            const { error } = validateStationRaw(stationRawObjectList[0]);
            expect(error).toBeUndefined();
        });
    });
});