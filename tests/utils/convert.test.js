/**
 * Testing the convert features
 */

const { Station } = require('../../models/station');
const { stationRawObjectList } = require('../const');
const { convertStationsFormat } = require('../../utils/convert');


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
            await expect(doc.validate()).resolves.toBeUndefined();  // TODO: define correct expect statement
        });

        test('converting an incorrect stationRawObject should raise an error', async () => {
            let stationRawObjectListIncorrect = JSON.parse(JSON.stringify(stationRawObjectList));
            delete stationRawObjectListIncorrect[0].name;
            expect(() => {
                convertStationsFormat(stationRawObjectListIncorrect);
            }).toThrow(/Validation error: .* is required/i);
        });
    });
});