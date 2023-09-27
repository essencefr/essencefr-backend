/**
 * Testing the generic update feature
 */

const mongoose = require('mongoose');
const { Station } = require('../../../models/station');
const { History } = require('../../../models/history');
const { processRawData } = require('../../../utils/update/all');
const { filterStationObjects } = require('../../../utils/update/all');
const { convertStationsFormat } = require('../../../utils/convert');


describe('generic update feature', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async () => {
        await Station.deleteMany({});
        await History.deleteMany({});
        server.close();
    });
    afterAll(async () => {
        mongoose.disconnect();
    });

    describe('main process', () => {
        test('processing raw data with missing fields should raise an error', async () => {
            const stationRawObjectIncompleteList = [
                { id: 1, name: 'a' },
            ];
            // ensure that a validation error is thrown:
            await expect(processRawData(stationRawObjectIncompleteList)).rejects.toThrow(/validation error/i);
        });

        test('station and history documents should be created after processing raw data related to a new/unknown station _id', async () => {
            const { stationRawObjectList } = require('../../const');
            const stationRawObject = stationRawObjectList[0];  // only consider the first stationRawObject for this test
            // process raw data:
            await processRawData([stationRawObject]);
            // ensure station doc has been inserted in the DB:
            let doc = await Station.findById(stationRawObject.id);
            expect(doc).toBeDefined();
            expect(doc).not.toBeNull();
            // check all values:
            expect(doc._id).toBe(stationRawObject.id);
            expect(doc.name).toEqual(stationRawObject.name);
            expect(doc.brand._id).toEqual(stationRawObject.Brand.id);
            expect(doc.brand.name).toEqual(stationRawObject.Brand.name);
            expect(doc.address.streetLine).toEqual(stationRawObject.Address.street_line);
            expect(doc.address.cityLine).toEqual(stationRawObject.Address.city_line);
            expect(doc.coordinates.longitude).toEqual(parseFloat(stationRawObject.Coordinates.longitude));
            expect(doc.coordinates.latitude).toEqual(parseFloat(stationRawObject.Coordinates.latitude));
            expect(doc.fuels.length).toEqual(stationRawObject.Fuels.length);
            for(let i = 0; i < doc.fuels.length; i ++) {
                expect(doc.fuels[i]._id).toEqual(stationRawObject.Fuels[i].id);
                expect(doc.fuels[i].shortName).toEqual(stationRawObject.Fuels[i].short_name);
                expect(new Date(doc.fuels[i].date).toString()).toEqual(new Date(stationRawObject.Fuels[i].Update.value).toString());
                expect(doc.fuels[i].available).toEqual(stationRawObject.Fuels[i].available);
                expect(doc.fuels[i].price).toEqual(stationRawObject.Fuels[i].Price.value);
            };
            // ensure history docs have been inserted in the DB:
            for(let i = 0; i < stationRawObject.Fuels.length; i ++){                
                doc = await History.findByStationAndFuelIds(stationRawObject.id, stationRawObject.Fuels[i].id);
                expect(doc).toBeDefined();
                expect(doc).not.toBeNull();
                // check all values:
                expect(doc.station._id).toEqual(stationRawObject.id);
                expect(doc.station.name).toEqual(stationRawObject.name);
                expect(doc.fuel._id).toEqual(stationRawObject.Fuels[i].id);
                expect(doc.fuel.shortName).toEqual(stationRawObject.Fuels[i].short_name);
                expect(doc.history.length).toEqual(1);
                expect(doc.history[0].price).toEqual(stationRawObject.Fuels[i].Price.value);
                expect(doc.history[0].date.toString()).toEqual(new Date(stationRawObject.Fuels[i].Update.value).toString());
            };
        });

        test('station and history documents should be updated after processing raw data related to a known station _id', async () => {
            const { stationRawObjectList, stationRawObjectListUpdated } = require('../../const');
            const stationRawObject = stationRawObjectList[0];  // only consider the first stationRawObject for this test
            // process raw data to fill up the DB:
            await processRawData([stationRawObject]);
            // update object:
            const stationRawObjectUpdated = stationRawObjectListUpdated[0];
            stationRawObjectUpdated.LastUpdate.value = new Date(stationRawObjectUpdated.LastUpdate.value);
            stationRawObjectUpdated.LastUpdate.value.setDate(stationRawObjectUpdated.LastUpdate.value.getDate() + 1);  // update the field 'lastUpdate' so that modifications will be taken into consideration by the DB
            // process new raw data:
            await processRawData([stationRawObjectUpdated]);
            // ensure station doc has been modified in the DB:
            let doc = await Station.findById(stationRawObject.id);
            expect(doc).toBeDefined();
            expect(doc).not.toBeNull();
            // check all values:
            expect(doc._id).toBe(stationRawObjectUpdated.id);  // cannot update station '_id' field
            expect(doc.name).toEqual(stationRawObjectUpdated.name);
            expect(doc.brand._id).toEqual(stationRawObjectUpdated.Brand.id);
            expect(doc.brand.name).toEqual(stationRawObjectUpdated.Brand.name);
            expect(doc.address.streetLine).toEqual(stationRawObjectUpdated.Address.street_line);
            expect(doc.address.cityLine).toEqual(stationRawObjectUpdated.Address.city_line);
            expect(doc.coordinates.longitude).toEqual(parseFloat(stationRawObjectUpdated.Coordinates.longitude));
            expect(doc.coordinates.latitude).toEqual(parseFloat(stationRawObjectUpdated.Coordinates.latitude));
            expect(doc.fuels.length).toEqual(stationRawObjectUpdated.Fuels.length);
            for(let i = 0; i < doc.fuels.length; i ++) {
                expect(doc.fuels[i]._id).toEqual(stationRawObjectUpdated.Fuels[i].id);  // cannot update fuel '_id' field
                expect(doc.fuels[i].shortName).toEqual(stationRawObjectUpdated.Fuels[i].short_name);
                expect(new Date(doc.fuels[i].date).toString()).toEqual(new Date(stationRawObjectUpdated.Fuels[i].Update.value).toString());
                expect(doc.fuels[i].available).toEqual(stationRawObjectUpdated.Fuels[i].available);
                expect(doc.fuels[i].price).toEqual(stationRawObjectUpdated.Fuels[i].Price.value);
            };
            // ensure history docs have been modified in the DB:
            for(let i = 0; i < stationRawObject.Fuels.length; i ++){                
                doc = await History.findByStationAndFuelIds(stationRawObjectUpdated.id, stationRawObjectUpdated.Fuels[i].id);
                expect(doc).toBeDefined();
                expect(doc).not.toBeNull();
                // check all values:
                expect(doc.station._id).toEqual(stationRawObjectUpdated.id);
                expect(doc.station.name).toEqual(stationRawObjectUpdated.name);
                expect(doc.fuel._id).toEqual(stationRawObjectUpdated.Fuels[i].id);
                expect(doc.fuel.shortName).toEqual(stationRawObjectUpdated.Fuels[i].short_name);
                expect(doc.history.length).toEqual(2);  // a new price should have been appended in the history
                expect(doc.history[0].price).toEqual(stationRawObject.Fuels[i].Price.value);
                expect(doc.history[0].date.toString()).toEqual(new Date(stationRawObject.Fuels[i].Update.value).toString());
                expect(doc.history[1].price).toEqual(stationRawObjectUpdated.Fuels[i].Price.value);
                expect(doc.history[1].date.toString()).toEqual(new Date(stationRawObjectUpdated.Fuels[i].Update.value).toString());
            };
        });

        test('a fuel removed from a station should not impact the matching history document', () => {
            // TODO
            expect(1).toBe(1);
        });

        test('a fuel added to a station should cause the creation of a new history document', () => {
            // TODO
            expect(1).toBe(1);
        });

        test('no modification in a fuel date should not cause any modification in the matching history', () => {
            // TODO
            expect(1).toBe(1);
        });
    });
    
    describe('filter feature', () => {
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