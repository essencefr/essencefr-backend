/**
 * Testing the save/update history feature
 */

const mongoose = require('mongoose');
const { History } = require('../../../models/history');
const { stationRawObjectList } = require('../../const');
const { convertStationsFormat, generateHistoryObjectList } = require('../../../utils/convert');
const { updateHistoryCollection } = require('../../../utils/update/history');


let server = null;

// main test suite:
describe('save/update history feature', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async () => {
        server.close();
        await History.deleteMany({});
    });
    afterAll(() => {
        mongoose.disconnect();
    });

    describe('insert history document into the DB', () => {
        test('data should be avaiable after being saved into the DB', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            const historyObjectList = generateHistoryObjectList(stationObjectList);
            await updateHistoryCollection(historyObjectList, []);
            const doc = await History.findByStationAndFuelIds(historyObjectList[0].station._id, historyObjectList[0].fuel._id);
            expect(doc).toBeDefined();
            expect(doc).not.toBe(null);
            expect(doc.station).toBeDefined();
            expect(doc.station.name).toBe(historyObjectList[0].station.name);
        });

        test('saving two documents with the same _id should raise an error and none of the documents should be saved into the DB', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            let historyObjectList = generateHistoryObjectList(stationObjectList);
            historyObjectList.push(historyObjectList[0]);  // duplicate doc in the array
            await expect(updateHistoryCollection(historyObjectList, [])).rejects.toThrow(/duplicate key error/i);
            // search the DB:
            const doc = await History.findByStationAndFuelIds(historyObjectList[0].station._id, historyObjectList[0].fuel._id);
            expect(doc).toBeNull();
        });

        test('saving document with incorrect format should raise an error', async () => {
            // ensure that missing fields are detected:
            const historyObjectList = [{}]
            await expect(updateHistoryCollection(historyObjectList, [])).rejects.toThrow(/Path .* is required/i);
        });
        
        test('a field unkown by the model should not be saved in the DB', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            let historyObjectList = generateHistoryObjectList(stationObjectList);
            historyObjectList[0].newField = "a new field";
            await updateHistoryCollection(historyObjectList, []);
            // read database through api endpoint:
            const doc = await History.findByStationAndFuelIds(historyObjectList[0].station._id, historyObjectList[0].fuel._id);
            expect(doc).toBeDefined();
            expect(doc.newField).toBeUndefined();
        });
    });
});