/**
 * Testing the generic update feature
 */

const mongoose = require('mongoose');
const { Station } = require('../../../models/station');
const { processRawData } = require('../../../utils/update/all');
const { filterStationsData } = require('../../../utils/update/all');
const { convertStationsFormat } = require('../../../utils/convert');


describe('generic update feature', () => {

    describe('main process', () => {
        test('processing raw data with missing fields should raise an error', () => {
            const stationsDataRaw = [
                { id: 1, name: 'a' },
            ];
            // ensure that a validation error is thrown:
            expect(() => {
                processRawData(stationsDataRaw);
            }).toThrow(/validation error/i);
        });
    });
    
    describe('filter feature', () => {
        beforeEach(() => { server = require('../../../index'); });
        afterEach( async () => {
            server.close();
            await Station.deleteMany({});
        });
        afterAll(() => { mongoose.disconnect(); });

        test('an unknown station data object should be correctly filtered as new', async () => {
            const { stationsDataRaw } = require('../../const');
            const stationsData = convertStationsFormat(stationsDataRaw);
            const stationsDataFiltered = await filterStationsData(stationsData);
            expect(stationsDataFiltered).toBeDefined();
            expect(stationsDataFiltered.stationsDataNew.length).toBe(1);
            expect(stationsDataFiltered.stationsDataKnown.length).toBe(0);
        });

        test('an already known station data object should be correctly filtered as known', async () => {
            const { stationsDataRaw } = require('../../const');
            const { saveStations } = require('../../../utils/update/stations');
            const stationsData = convertStationsFormat(stationsDataRaw);
            await saveStations(stationsData);
            const stationsDataFiltered = await filterStationsData(stationsData);
            expect(stationsDataFiltered).toBeDefined();
            expect(stationsDataFiltered.stationsDataNew.length).toBe(0);
            expect(stationsDataFiltered.stationsDataKnown.length).toBe(1);
        });
    });
});