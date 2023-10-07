/**
 * Testing the 'history' endpoint
 */

const request = require('supertest');  // function used to send a request to an endpoint
const mongoose = require('mongoose');
const { clearCollections, connectToDB } = require('../common');
const { stationRawObjectList } = require('../const');
const { convertStationsFormat, generateHistoryObjectList } = require('../../utils/convert');
const { bulkWriteHistoryCollection } = require('../../services/update/collections/history');

let server = null;

// main test suite:
describe('/api/history', () => {
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

    describe('GET /:stationId&:fuelId', () => {
        test('should return the station when id is correct', async () => {
            // define the raw data object:
            const stationId = stationRawObjectList[0].id;
            const fuelId = stationRawObjectList[0].Fuels[0].id;
            const stationName = stationRawObjectList[0].name;
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            const historyObjectList = generateHistoryObjectList(stationObjectList);
            await bulkWriteHistoryCollection(historyObjectList, []);
            // read database through api endpoint:
            const res = await request(server).get(`/api/history/${stationId}&${fuelId}`);
            // compare results:
            expect(res.status).toBe(200);
            expect(res.body.station.name).toEqual(stationName);
        });
        
        test('should throw 404 when id is unknwon', async () => {
            const res = await request(server).get(`/api/history/1&1`);
            expect(res.status).toBe(404);
        });

        test('should throw 400 when id is incorrect', async () => {
            const res = await request(server).get(`/api/history/a&a`);
            expect(res.status).toBe(400);
        });
    });
});
