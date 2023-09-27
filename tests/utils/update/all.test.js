/**
 * Testing the generic update feature
 */

const mongoose = require('mongoose');
const { Station } = require('../../../models/station');
const { processRawData } = require('../../../utils/update/all');
const { filterStationObjects } = require('../../../utils/update/all');
const { convertStationsFormat } = require('../../../utils/convert');


describe('generic update feature', () => {

    describe('main process', () => {
        test('processing raw data with missing fields should raise an error', async () => {
            const stationRawObjectList = [
                { id: 1, name: 'a' },
            ];
            // ensure that a validation error is thrown:
            await expect(processRawData(stationRawObjectList)).rejects.toThrow(/validation error/i);
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
            const stationObjectListFiltered = await filterStationObjects(stationObjectList);
            expect(stationObjectListFiltered).toBeDefined();
            expect(stationObjectListFiltered.stationObjectsNew.length).toBe(1);
            expect(stationObjectListFiltered.stationObjectsKnown.length).toBe(0);
        });

        test('an already known station data object should be correctly filtered as known', async () => {
            const { stationRawObjectList } = require('../../const');
            const { updateStationsCollection } = require('../../../utils/update/stations');
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            await updateStationsCollection(stationObjectList, []);
            const stationObjectListFiltered = await filterStationObjects(stationObjectList);
            expect(stationObjectListFiltered).toBeDefined();
            expect(stationObjectListFiltered.stationObjectsNew.length).toBe(0);
            expect(stationObjectListFiltered.stationObjectsKnown.length).toBe(1);
        });
    });
});