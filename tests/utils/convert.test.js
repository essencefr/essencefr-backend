/**
 * Testing the convert features
 */

const { mongoose } = require('mongoose');
const { Station } = require('../../models/station');
const { History } = require('../../models/history');
const { Fuel } = require('../../models/fuel');
const { Brand } = require('../../models/brand');
const { stationRawObjectList } = require('../const');
const { convertStationsFormat, generateHistoryObjectList, generateFuelObjectList, generateBrandObjectList } = require('../../utils/convert');
const { bulkWriteFuelsCollection } = require('../../services/update/collections/fuels');
const { bulkWriteBrandsCollection } = require('../../services/update/collections/brands');
const { clearCollections, connectToDB } = require('../common');


// main test suite:
describe('convert features', () => {
    beforeAll(async () => {
        connectToDB();
        await clearCollections();
    });
    afterEach(async () => {
        await clearCollections();
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
            delete stationRawObjectListIncorrect[0].id;
            expect(() => {
                convertStationsFormat(stationRawObjectListIncorrect);
            }).toThrow(/.* is required/i);
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
});