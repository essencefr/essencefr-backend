/**
 * Testing the 'stations' endpoint
 */

const request = require('supertest');  // function used to send a request to an endpoint
const mongoose = require('mongoose');
const { stationRawObjectList } = require('../const');
const { convertStationsFormat } = require('../../utils/convert');
const { clearCollections } = require('../common');

let server = null;

// main test suite:
describe('/api/stations', () => {
    beforeAll(async () => {
        await clearCollections();
    });
    beforeEach(() => {
        server = require('../../index');
    });
    afterEach(async () => {
        await clearCollections();
        server.close();
    });
    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('GET /:id', () => {
        test('should return the station when id is correct', async () => {
            const { bulkWriteStationsCollection } = require('../../services/update/collections/stations');
            // define the raw data object:
            const stationId = stationRawObjectList[0].id;
            const stationName = stationRawObjectList[0].name;
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await bulkWriteStationsCollection(stationObjectList, []);
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
