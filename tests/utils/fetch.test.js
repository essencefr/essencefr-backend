/**
 * Testing the fetch module
 */

const { fetchStations } = require('../../utils/fetch');

describe('fetch functions', () => {
    describe('fetchStations', () => {
        test('fetching stations with correct coordinates should return a known station data format', async () => {
            const { validateStationRaw } = require('../../models/station');
            const latitude = 44.806;  // Pessac coordinates
            const longitude = -0.631;
            // fetch data:
            const stationRawObjectList = await fetchStations(latitude, longitude);
            // check format retrieved:
            expect(stationRawObjectList).toBeDefined();
            expect(stationRawObjectList.length).toBeGreaterThanOrEqual(1);
            const { error } = validateStationRaw(stationRawObjectList[0]);
            expect(error).toBeUndefined();
        });

        test('fetching stations with coordinates out of France should return an empty body', async () => {
            const latitude = 41.403;  // Barcelona coordinates
            const longitude = 2.174;
            // fetch data:
            const stationRawObjectList = await fetchStations(latitude, longitude);
            // check format retrieved:
            expect(stationRawObjectList).toBeDefined();
            expect(stationRawObjectList.length).toBe(0);
        });
    });
});