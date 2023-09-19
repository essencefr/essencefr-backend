/**
 * Testing the update feature
 */
const request = require('supertest');  // function used to send a request to an endpoint
const mongoose = require('mongoose');
const { Station } = require('../../../models/station');
const { stationsDataRaw } = require('../../const');

let server = null;

// main test suite:
describe('update feature', () => {
    beforeEach(() => { server = require('../../../index'); });
    afterEach( async () => {
        server.close();
        await Station.deleteMany({});
    });
    afterAll(() => { mongoose.disconnect(); });

    describe('adding station data into database', () => {
        test('data should be avaiable after being added', async () => {
            const { saveStations } = require('../../../utils/update/stations');
            // get the raw data object elements:
            const stationId = stationsDataRaw[0].id;
            const stationName = stationsDataRaw[0].name;
            // save data:
            await saveStations(stationsDataRaw);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationId}`);
            // compare results:
            expect(res.status).toBe(200);
            expect(res.body.name).toEqual(stationName);
        });

        test('adding stations with partial data should raise an error', async () => {
            const { saveStations } = require('../../../utils/update/stations');
            const stationsDataRaw = [
                { id: 1, name: 'a' },
            ];
            // ensure that a validation error is thrown:
            await expect(saveStations(stationsDataRaw)).rejects.toThrow(/validation error/i);
        });

        test('adding two stations with the same _id should raise an error and none of the stations should be added', async () => {
            const { saveStations } = require('../../../utils/update/stations');
            stationsDataRaw.push(stationsDataRaw[0]);
            await expect(saveStations(stationsDataRaw)).rejects.toThrow(/duplicate key error/i);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationsDataRaw[0].id}`);
            expect(res.status).toBe(404);
        });
    });
});