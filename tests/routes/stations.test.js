/**
 * Testing the 'stations' endpoint
 */

const request = require('supertest');  // function used to send a request to an endpoint
const mongoose = require('mongoose');
const { stationRawObjectList } = require('../const');
const { convertStationsFormat } = require('../../utils/convert');
const { bulkWriteStationsCollection } = require('../../services/update/collections/stations');
const { clearCollections, connectToDB } = require('../common');

let server = null;

// main test suite:
describe('/api/stations', () => {
    beforeAll(async () => {
        connectToDB();
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
            // define the raw data object:
            const stationId = stationRawObjectList[0].id;
            const stationAddress = stationRawObjectList[0].adresse;
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await bulkWriteStationsCollection(stationObjectList, []);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationId}`);
            // compare results:
            expect(res.status).toBe(200);
            expect(res.body.address.streetLine).toEqual(stationAddress);
        });

        test('history fields should not be return in the response body by default', async () => {
            // define the raw data object:
            const stationId = stationRawObjectList[0].id;
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await bulkWriteStationsCollection(stationObjectList, []);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationId}`);
            // compare results:
            expect(res.status).toBe(200);
            for (let i=0; i<res.body.fuels.length; i++) {
                expect(res.body.fuels[i].history).toBeUndefined();
            }
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

    describe('GET /:id?query', () => {
        test('history fields should be return in the response body if explicitly required', async () => {
            // define the raw data object:
            const stationId = stationRawObjectList[0].id;
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await bulkWriteStationsCollection(stationObjectList, []);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationId}?history=true`);
            // compare results:
            expect(res.status).toBe(200);
            for (let i=0; i<res.body.fuels.length; i++) {
                expect(res.body.fuels[i].history).not.toBeUndefined();
            }
        });

        test('a non-boolean value for \'history\' in query should return 400', async () => {
            // fill the DB:
            const stationId = stationRawObjectList[0].id;
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await bulkWriteStationsCollection(stationObjectList, []);
            // perform requests:
            let res = await request(server).get(`/api/stations/${stationId}?history=1`);
            expect(res.status).toBe(400);
            res = await request(server).get(`/api/stations/${stationId}?history=a`);
            expect(res.status).toBe(400);
        });
    });
});
