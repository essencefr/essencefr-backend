/**
 * Testing the fetch module
 */

const { fetchStations } = require('../../utils/fetch');

describe('fetch functions', () => {
    describe('fetchStations', () => {
        test('fetching stations with correct coordinates should return a known station data format', async () => {
            const { validateStationRaw } = require('../../models/station');
            const longitude = 44.806;  // Pessac coordinates
            const latitude = -0.631;
            // fetch data:
            const stationsDataRaw = await fetchStations(longitude, latitude);
            // check format retrieved:
            expect(stationsDataRaw).toBeDefined();
            expect(stationsDataRaw.length).toBeGreaterThanOrEqual(1);
            const { error } = validateStationRaw(stationsDataRaw[0]);
            expect(error).toBeUndefined();
        });

        test('fetching stations with coordinates out of France should return an empty body', async () => {
            const longitude = 41.403;  // Barcelona coordinates
            const latitude = 2.174;
            // fetch data:
            const stationsDataRaw = await fetchStations(longitude, latitude);
            // check format retrieved:
            expect(stationsDataRaw).toBeDefined();
            expect(stationsDataRaw.length).toBe(0);
        });
    });
});