/**
 * Testing the 'stations' endpoint
 */

const request = require('supertest');  // function used to send a request to an endpoint
const mongoose = require('mongoose');
const { Station } = require('../../models/station');
const { stationsDataRaw } = require('../const');

let server = null;

// main test suite:
describe('/api/stations', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach( async () => {
        server.close();
        await Station.deleteMany({});
    });
    afterAll(() => { mongoose.disconnect(); });

    describe('GET /:id', () => {
        test('should return the station when id is correct', async () => {
            const { saveStations } = require('../../utils/update/stations');
            // define the raw data object:
            const stationId = stationsDataRaw[0].id;
            const stationName = stationsDataRaw[0].name;
            await saveStations(stationsDataRaw);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationId}`);
            // compare results:
            expect(res.status).toBe(200);
            expect(res.body.name).toEqual(stationName);
        });
        
        test('should throw 404 when id is unknwon', async () => {
            const res = await request(server).get(`/api/stations/1`);
            expect(res.status).toBe(404);
        });

        test('should throw 400 when id is incorrect', async () => {
            const res = await request(server).get(`/api/stations/a`);
            expect(res.status).toBe(400);
        });
    });
});
