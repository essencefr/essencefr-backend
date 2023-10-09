/**
 * Testing the convert features
 */

const { mongoose } = require('mongoose');
const { Station } = require('../../models/station');
const { stationRawObjectList } = require('../const');
const { convertStationsFormat } = require('../../utils/convert');
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

        test('converting an incorrect stationRawObject should throw', async () => {
            let stationRawObjectListIncorrect = JSON.parse(JSON.stringify(stationRawObjectList));
            delete stationRawObjectListIncorrect[0].id;
            expect(() => {
                convertStationsFormat(stationRawObjectListIncorrect);
            }).toThrow(/.* is required/i);
        });
    });
});