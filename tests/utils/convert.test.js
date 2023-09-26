/**
 * Testing the convert features
 */

const { Station } = require('../../models/station');
const { History, validateHistoryUpdate } = require('../../models/history');
const { stationRawObjectList } = require('../const');
const { convertStationsFormat, generateHistoryObjectList, generateHistoryUpdateObjectList } = require('../../utils/convert');


let server = null;

// main test suite:
describe('convert features', () => {
    beforeEach(() => {
        server = require('../../index');
    });
    afterEach(async () => {
        server.close();
        await Station.deleteMany({});
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

        test('generating object from station object with wrong format should fail', () => {
            // TODO
            expect(1).toBe(1);
        });
    });

    describe('generate history update objects', () => {
        test('generated history update objects should have the Joi schema format defined in models', () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            const historyUpdateObjectList = generateHistoryUpdateObjectList(stationObjectList);
            expect(historyUpdateObjectList.length).toBe(3);
            const { error } = validateHistoryUpdate(historyUpdateObjectList[0]);
            expect(error).toBeUndefined();
        });

        test('generating object from station object with wrong format should fail', () => {
            // TODO
            expect(1).toBe(1);
        });
    });
});