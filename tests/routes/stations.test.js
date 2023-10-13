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

        test('history fields should not be returned in the response body by default', async () => {
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

        test('all fuels objects should be returned in the response by default', async () => {
            // define the raw data object:
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            const stationId = stationObjectList[0]._id;
            const nbOfFuels = stationObjectList[0].fuels.length;
            await bulkWriteStationsCollection(stationObjectList, []);
            // read database through api endpoint:
            let res = await request(server).get(`/api/stations/${stationId}`);
            // compare results:
            expect(res.status).toBe(200);
            expect(res.body.fuels.length).toEqual(nbOfFuels);
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
        test('an unexpected field in query should return 400', async () => {
            // perform requests:
            let res = await request(server).get(`/api/stations/${1}?unexpected=1`);
            expect(res.status).toBe(400);
            res = await request(server).get(`/api/stations/${1}?history=true&unexpected=1`);
            expect(res.status).toBe(400);
        });

        describe('query with \'history\'', () => {            
            test('history fields should be returned in the response body if explicitly required', async () => {
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

            test('history fields should not include their \'_id\' value in the response body', async () => {
                // define the raw data object:
                const stationId = stationRawObjectList[0].id;
                const stationObjectList = convertStationsFormat(stationRawObjectList);
                await bulkWriteStationsCollection(stationObjectList, []);
                // read database through api endpoint:
                const res = await request(server).get(`/api/stations/${stationId}?history=true`);
                // compare results:
                expect(res.status).toBe(200);
                for (let i=0; i<res.body.fuels.length; i++) {
                    expect(res.body.fuels[i].history._id).toBeUndefined();
                }
            });
    
            test('a non-boolean value for \'history\' in query should return 400', async () => {
                // perform requests:
                let res = await request(server).get(`/api/stations/${1}?history=1`);
                expect(res.status).toBe(400);
                res = await request(server).get(`/api/stations/${1}?history=a`);
                expect(res.status).toBe(400);
            });
        });

        describe('query with \'fuelId\'', () => {
            test('single required fuel should be returned in the response body if explicitly specified', async () => {
                // define the raw data object:
                const stationId = stationRawObjectList[0].id;                
                const stationObjectList = convertStationsFormat(stationRawObjectList);
                const fuelIdList = stationObjectList[0].fuels.map(object => object._id);
                await bulkWriteStationsCollection(stationObjectList, []);
                // read database through api endpoint:
                let res = await request(server).get(`/api/stations/${stationId}?fuelId=${fuelIdList[0]}`);
                // compare results:
                expect(res.status).toBe(200);
                expect(res.body.fuels.length).toBe(1);
            });

            test('multiple required fuels should be returned in the response body if explicitly specified', async () => {
                // define the raw data object:
                const stationId = stationRawObjectList[0].id;                
                const stationObjectList = convertStationsFormat(stationRawObjectList);
                const fuelIdList = stationObjectList[0].fuels.map(object => object._id);
                await bulkWriteStationsCollection(stationObjectList, []);
                // read database through api endpoint:
                const res = await request(server).get(`/api/stations/${stationId}?fuelId=${fuelIdList[0]}&fuelId=${fuelIdList[1]}`);
                // compare results:
                expect(res.status).toBe(200);
                expect(res.body.fuels.length).toBe(2);
            });

            test('unexpected value should return 400', async () => {
                // perform requests:
                let res = await request(server).get(`/api/stations/${1}?fuelId=a`);
                expect(res.status).toBe(400);
                res = await request(server).get(`/api/stations/${1}?fuelId=${1}&fuelId=a`);
                expect(res.status).toBe(400);
            });

            test('unkown fuel id for the given station should return 404', async () => {
                // define the raw data object:
                const stationId = stationRawObjectList[0].id;                
                const stationObjectList = convertStationsFormat(stationRawObjectList);
                await bulkWriteStationsCollection(stationObjectList, []);
                // perform requests:
                let res = await request(server).get(`/api/stations/${stationId}?fuelId=999`);
                expect(res.status).toBe(404);
                res = await request(server).get(`/api/stations/${stationId}?fuelId=1&fuelId=999`);
                expect(res.status).toBe(404);
            });
        });

        describe('query with \'history\' AND \'fuelId\'', () => {
            test('history should be returned for every required fuel', async () => {
                // define the raw data object:               
                const stationObjectList = convertStationsFormat(stationRawObjectList);
                const stationId = stationObjectList[0]._id;
                const fuelIdList = stationObjectList[0].fuels.map(object => object._id);
                await bulkWriteStationsCollection(stationObjectList, []);
                // read database through api endpoint:
                let res = await request(server).get(`/api/stations/${stationId}?history=true&fuelId=${fuelIdList[0]}&fuelId=${fuelIdList[1]}`);
                // compare results:
                expect(res.status).toBe(200);
                expect(res.body.fuels.length).toBe(2);  // only 2 fuels are required
                for (let i=0; i<res.body.fuels.length; i++) {
                    expect(res.body.fuels[i].history).not.toBeUndefined();
                }
            });
        });
    });
});
