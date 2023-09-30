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
            console.log('historyObjectList: ', historyObjectList);
            await expect(updateHistoryCollection(historyObjectList, [])).rejects.toThrow(/Path .* is required/i);
        });
        
        test('a field unkown by the model should not be saved in the DB', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            let historyObjectList = generateHistoryObjectList(stationObjectList);
            historyObjectList[0].newField = "a new field";
            await updateHistoryCollection(historyObjectList, []);
            // read DB:
            const doc = await History.findByStationAndFuelIds(historyObjectList[0].station._id, historyObjectList[0].fuel._id);
            expect(doc).toBeDefined();
            expect(doc.newField).toBeUndefined();
        });
    });

    describe('update history document into the DB', () => {
        test('updated data should be avaiable after update', async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            let historyObjectList = generateHistoryObjectList(stationObjectList);
            // save document:            
            await updateHistoryCollection(historyObjectList, []);
            // update document:
            const newStationName = "New station name";
            const newFuelName = "New fuel name";
            const newPriceValue = 1.111;
            historyObjectList[0].station.name = newStationName;
            historyObjectList[0].fuel.shortName = newFuelName;
            historyObjectList[0].history[0].price = newPriceValue;
            // update the date fields so that modifications will be taken into consideration by the DB:
            let newPriceDate = new Date(historyObjectList[0].history[0].date);
            newPriceDate.setDate(newPriceDate.getDate() +1);  // add a day
            historyObjectList[0].history[0].date = newPriceDate;
            historyObjectList[0].lastUpdate = newPriceDate;
            await updateHistoryCollection([], historyObjectList);
            // read DB:
            let doc = await History.findByStationAndFuelIds(historyObjectList[0].station._id, historyObjectList[0].fuel._id);
            expect(doc).toBeDefined();
            expect(doc.station.name).toBe(newStationName);
            expect(doc.fuel.shortName).toBe(newFuelName);
            expect(doc.history.length).toBe(2);
            expect(doc.history[1].price).toBe(newPriceValue);
            expect(new Date(doc.history[1].date)).toEqual(new Date(newPriceDate));
            expect(new Date(doc.lastUpdate)).toEqual(new Date(newPriceDate));
        });

        test("if date is the 'lastUpdate' known in the DB no modification should be made at all", async () => {
            const stationObjectList = convertStationsFormat(stationRawObjectList);
            let historyObjectList = generateHistoryObjectList(stationObjectList);
            // save document:            
            await updateHistoryCollection(historyObjectList, []);
            // update document:
            const newStationName = "New station name";
            const newFuelName = "New fuel name";
            historyObjectList[0].station.name = newStationName;
            historyObjectList[0].fuel.shortName = newFuelName;
            await updateHistoryCollection([], historyObjectList);
            // read DB:
            let doc = await History.findByStationAndFuelIds(historyObjectList[0].station._id, historyObjectList[0].fuel._id);
            expect(doc).toBeDefined();
            expect(doc.station.name).not.toBe(newStationName);  // name unchanged
            expect(doc.fuel.shortName).not.toBe(newFuelName);  // name unchanged
            expect(doc.history.length).toBe(historyObjectList[0].history.length);  // length unchanged
        });

        test('passing updating data with incorrect format should throw', async () => {
            let historyObjectList = generateHistoryObjectList(convertStationsFormat(stationRawObjectList));
            historyObjectList[0].history[0].price = "a string";
            await expect(updateHistoryCollection([], historyObjectList)).rejects.toThrow();
        });

        test("passing updating data with empty 'history' array should throw", async () => {
            let historyObjectList = generateHistoryObjectList(convertStationsFormat(stationRawObjectList));
            historyObjectList[0].history = [];
            await expect(updateHistoryCollection([], historyObjectList)).rejects.toThrow(/must have length >= 1/i);
        });

        test("passing updating data with 'lastUpdate' != 'history[-1].date' should throw", async () => {
            let historyObjectList = generateHistoryObjectList(convertStationsFormat(stationRawObjectList));
            // change lastUpdate value:
            let newDate = new Date(historyObjectList[0].lastUpdate);
            newDate.setDate(newDate.getDate() +1);  // add a day
            historyObjectList[0].lastUpdate = newDate;
            await expect(updateHistoryCollection([], historyObjectList)).rejects.toThrow(/must match 'lastUpdate'/i);
        });
    });
});