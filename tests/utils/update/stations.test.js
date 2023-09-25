/**
 * Testing the save/update stations feature
 */

const request = require('supertest');  // function used to send a request to an endpoint
const mongoose = require('mongoose');
const { Station } = require('../../../models/station');
const { stationRawObjectList } = require('../../const');
const { updateStationsCollection } = require('../../../utils/update/stations');
const { convertStationsFormat } = require('../../../utils/convert');

let server = null;

// main test suite:
describe('save/update station feature', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async () => {
        server.close();
        await Station.deleteMany({});
    });
    afterAll(() => {
        mongoose.disconnect();
    });

    describe('insert station data into database', () => {
        test('data should be avaiable after being saved into the DB', async () => {
            // get the raw data object elements:
            const stationId = stationRawObjectList[0].id;
            const stationName = stationRawObjectList[0].name;
            // save data:
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await updateStationsCollection(stationObjectList, []);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationId}`);
            // compare results:
            expect(res.status).toBe(200);
            expect(res.body._id).toEqual(stationId);
            expect(res.body.name).toEqual(stationName);
        });
        
        test('saving two stations with the same _id should raise an error and none of the stations should be saved into the DB', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            stationObjectList.push(stationObjectList[0]);  // duplicate doc in the array
            await expect(updateStationsCollection(stationObjectList, [])).rejects.toThrow(/duplicate key error/i);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationObjectList[0]._id}`);
            expect(res.status).toBe(404);
        });

        test('saving no converted raw data should raise an error', async () => {
            // ensure that missing fields are detected:
            await expect(updateStationsCollection(stationRawObjectList, [])).rejects.toThrow(/Path .* is required/i);
        });
        
        test('a field unkown by the model should not be saved in the DB', async () => {
            let stationObjectList = convertStationsFormat(stationRawObjectList);
            stationObjectList[0].newField = "a new field";
            await updateStationsCollection(stationObjectList, []);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationObjectList[0]._id}`);
            expect(res.status).toBe(200);
            expect(res.body.newField).toBeUndefined();
        });
    });

    describe('updating station data into database', () => {
        test('data updated should be avaiable after updating an existing document', async () => {
            let stationObjectList = convertStationsFormat(stationRawObjectList);
            const stationId = stationObjectList[0]._id;
            const newStationName = "New station name";
            await updateStationsCollection(stationObjectList, []);  // insert document into DB
            stationObjectList[0].name = newStationName;
            await updateStationsCollection([], stationObjectList);  // update documents
            const res = await request(server).get(`/api/stations/${stationId}`);
            // compare results:
            expect(res.status).toBe(200);
            expect(res.body._id).toEqual(stationId);
            expect(res.body.name).toEqual(newStationName);
        });
    });
});