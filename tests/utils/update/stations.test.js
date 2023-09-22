/**
 * Testing the save/update stations feature
 */

const request = require('supertest');  // function used to send a request to an endpoint
const mongoose = require('mongoose');
const { Station } = require('../../../models/station');
const { stationsDataRaw } = require('../../const');
const { saveStations } = require('../../../utils/update/stations');
const { convertStationsFormat } = require('../../../utils/convert');

let server = null;

// main test suite:
describe('save/update station feature', () => {
    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => {
        server.close();
        await Station.deleteMany({});
    });
    afterAll(() => { mongoose.disconnect(); });

    describe('saving station data into database', () => {
        test('data should be avaiable after being saved into the DB', async () => {
            // get the raw data object elements:
            const stationId = stationsDataRaw[0].id;
            const stationName = stationsDataRaw[0].name;
            // save data:
            const stationsData = convertStationsFormat(stationsDataRaw);
            await saveStations(stationsData);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationId}`);
            // compare results:
            expect(res.status).toBe(200);
            expect(res.body.name).toEqual(stationName);
        });
        
        test('saving two stations with the same _id should raise an error and none of the stations should be save into the DB', async () => {
            stationsDataRaw.push(stationsDataRaw[0]);  // duplicate doc in the array
            const stationsData = convertStationsFormat(stationsDataRaw);
            await expect(saveStations(stationsData)).rejects.toThrow(/duplicate key error/i);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationsDataRaw[0].id}`);
            expect(res.status).toBe(404);
        });

        test('saving no converted raw data should raise an error', async () => {
            // ensure that missing fields are detected:
            await expect(saveStations(stationsDataRaw)).rejects.toThrow(/Path .* is required/i);
        });
        
        test('a field unkown by the model should not be saved in the DB', async () => {
            let stationsData = convertStationsFormat(stationsDataRaw);
            stationsData[0].newField = "a new field";
            const docsAfterValidation = await saveStations(stationsData);
            // Ensure that the unkown field has been removed:
            expect(docsAfterValidation[0].newField).toBeUndefined();
        });
    });
});