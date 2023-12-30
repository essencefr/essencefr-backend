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
            expect(stationObjectList.length).toBe(2);
            stationObjectList.forEach(async (stationObject) => {
                const doc = Station.hydrate(stationObject);
                await expect(doc.validate()).resolves.toBeUndefined();
            });
        });

        test('converting an incorrect stationRawObject should throw', async () => {
            let stationRawObjectListIncorrect = JSON.parse(JSON.stringify(stationRawObjectList));
            delete stationRawObjectListIncorrect[0].id;
            expect(() => {
                convertStationsFormat(stationRawObjectListIncorrect);
            }).toThrow(/.* is required/i);
        });

        test('data should be correctly stored in the converted object', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            expect(stationObjectList.length).toBe(2);
            // check part of the fields to be correct:
            for(let i=0; i<stationObjectList.length; i++) {
                expect(stationObjectList[i]._id).toEqual(stationRawObjectList[i].id);
                expect(stationObjectList[i].name).toEqual(null);  // null by default (cannot be determined from raw data)
                expect(stationObjectList[i].brand).toEqual(null);  // null by default (cannot be determined from raw data)
                expect(stationObjectList[i].address.streetLine).toEqual(stationRawObjectList[i].adresse);
                expect(stationObjectList[i].address.cityLine).toEqual(`${stationRawObjectList[i].cp} ${stationRawObjectList[i].ville}`);
                expect(stationObjectList[i].coordinates.latitude).toEqual(stationRawObjectList[i].geom.lat);
                expect(stationObjectList[i].coordinates.longitude).toEqual(stationRawObjectList[i].geom.lon);
            };
        });

        test('ensure that dates converted match the dates retrieved from the gov api considering the timezone', () => {
            const dateGazoleFromRaw = stationRawObjectList[0].gazole_maj;
            const dateSP95FromRaw = stationRawObjectList[0].sp95_maj;
            const dateSP98FromRaw = stationRawObjectList[0].sp98_maj;
            const dateE10FromRaw = stationRawObjectList[0].e10_maj;
            const dateE85FromRaw = stationRawObjectList[0].e85_maj;
            const dateGPLcFromRaw = stationRawObjectList[0].gplc_maj;
            const dictDatesFromId = {1: dateGazoleFromRaw, 2: dateSP95FromRaw, 3: dateE85FromRaw, 4: dateGPLcFromRaw, 5: dateE10FromRaw, 6: dateSP98FromRaw};
            const stationObjectList = convertStationsFormat([stationRawObjectList[0]]);  // only consider the first sation object
            for (fuel of stationObjectList[0].fuels) {
                // by default (and because of the param 'timezone=Europe/Paris' in the api call) date are retrieved interpreted at Paris timezone
                const dateStringUTC2 = new Date(fuel.date).toLocalDateString('fr-FR', { timeZone: 'Europe/Paris' });
                expect(dateStringUTC2).toEqual(dictDatesFromId[fuel._id]);
            }
        }, 60000);  // set timeout to 1 min
    });
});