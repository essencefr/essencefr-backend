/**
 * Testing the generic update feature
 */

const mongoose = require('mongoose');
const { Station } = require('../../../models/station');
const { processRawData } = require('../../../utils/update/all');
const { filterstationObjectList } = require('../../../utils/update/all');
const { convertStationsFormat } = require('../../../utils/convert');


describe('generic update feature', () => {

    describe('main process', () => {
        test('processing raw data with missing fields should raise an error', () => {
            const stationRawObjectList = [
                { id: 1, name: 'a' },
            ];
            // ensure that a validation error is thrown:
            expect(() => {
                processRawData(stationRawObjectList);
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
            const { stationRawObjectList } = require('../../const');
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            const stationObjectListFiltered = await filterstationObjectList(stationObjectList);
            expect(stationObjectListFiltered).toBeDefined();
            expect(stationObjectListFiltered.stationObjectListNew.length).toBe(1);
            expect(stationObjectListFiltered.stationObjectListKnown.length).toBe(0);
        });

        test('an already known station data object should be correctly filtered as known', async () => {
            const { stationRawObjectList } = require('../../const');
            const { saveStations } = require('../../../utils/update/stations');
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await saveStations(stationObjectList);
            const stationObjectListFiltered = await filterstationObjectList(stationObjectList);
            expect(stationObjectListFiltered).toBeDefined();
            expect(stationObjectListFiltered.stationObjectListNew.length).toBe(0);
            expect(stationObjectListFiltered.stationObjectListKnown.length).toBe(1);
        });
    });
});