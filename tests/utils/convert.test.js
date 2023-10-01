/**
 * Testing the convert features
 */

const { mongoose } = require('mongoose');
const { Station } = require('../../models/station');
const { History } = require('../../models/history');
const { stationRawObjectList } = require('../const');
const { convertStationsFormat, generateHistoryObjectList, generateFuelObjectList } = require('../../utils/convert');
const { Fuel } = require('../../models/fuel');


let server = null;

// main test suite:
describe('convert features', () => {
    beforeEach(() => {
        server = require('../../index');
    });
    afterEach(() => {
        server.close();
    });
    afterAll(async () => {
        await mongoose.disconnect();
    });
    
    describe('convert stations format', () => {
        test('a converted stationObject should have the mongoose Schema format defined in models', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            expect(stationObjectList.length).toBe(1);
            const doc = Station.hydrate(stationObjectList[0]);
            await expect(doc.validate()).resolves.toBeUndefined();
        });

        test('converting an incorrect stationRawObject should raise an error', async () => {
            let stationRawObjectListIncorrect = JSON.parse(JSON.stringify(stationRawObjectList));
            delete stationRawObjectListIncorrect[0].name;
            expect(() => {
                convertStationsFormat(stationRawObjectListIncorrect);
            }).toThrow(/Validation error: .* is required/i);
        });
    });

    describe('generate history objects', () => {
        test('generated history objects should have the mongoose Schema format defined in models', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            const historyObjectList = generateHistoryObjectList(stationObjectList);
            expect(historyObjectList.length).toBe(3);
            const doc = History.hydrate(historyObjectList[0]);
            await expect(doc.validate()).resolves.toBeUndefined();
        });

        test('generating history object from station object with wrong format should throw', () => {
            expect(() => {
                generateHistoryObjectList(stationRawObjectList);
            }).toThrow();
        });
    });

    describe('generate fuel objects', () => {
        test('generated fuel objects should have the mongoose Schema format defined in models', async () => {
            const fuelObjectList = await generateFuelObjectList(stationRawObjectList);
            expect(fuelObjectList.length).toBe(3);
            const doc = Fuel.hydrate(fuelObjectList[0]);
            await expect(doc.validate()).resolves.toBeUndefined();
        });

        test('generating fuel object from station object with wrong format should throw', async () => {
            const stationRawObjectListIncorrect = JSON.parse(JSON.stringify(stationRawObjectList));
            delete stationRawObjectListIncorrect[0].Fuels[0].name;
            await expect(generateFuelObjectList(stationRawObjectListIncorrect)).rejects.toThrow();
        });
    });
});