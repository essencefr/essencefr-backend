/**
 * Testing the generic update feature
 */

const mongoose = require('mongoose');
const { Station } = require('../../../../models/station');
const { History } = require('../../../../models/history');
const { processRawData } = require('../../../../services/update/collections/all');
const { stationRawObjectList } = require('../../../const');

const stationRawObjectListUpdated = [
    {
        "id": stationRawObjectList[0].id,
        "Brand": {
            "id": 30,  // .............................................................. updated value
            "name": "Casino [updated value]",  // ...................................... updated value
            "short_name": stationRawObjectList[0].Brand.short_name,
            "nbStations": stationRawObjectList[0].Brand.nbStations
        },
        "type": stationRawObjectList[0].type,
        "name": "CASINO SUPERMARCHE  [updated value]",  // ............................. updated value
        "Address": {
            "street_line": "Allée des Conviviales [updated value]",  // ................ updated value
            "city_line": "33700 Mérignac [updated value]"  // .......................... updated value
        },
        "Coordinates": {
            "latitude": "45.555",  // .................................................. updated value
            "longitude": "-0.777"  // .................................................. updated value
        },
        "Fuels": [
            {
                "id": stationRawObjectList[0].Fuels[0].id,
                "name": stationRawObjectList[0].Fuels[0].name,
                "short_name": "Gazole [updated value]",  // ............................ updated value
                "picto": stationRawObjectList[0].Fuels[0].picto,
                "Update": {
                    "value": "2023-09-10T10:00:00Z",  // ............................... updated value
                    "text": stationRawObjectList[0].Fuels[0].Update.text
                },
                "available": false,  // ................................................ updated value
                "Price": {
                    "value": 1.789,  // ................................................ updated value
                    "currency": stationRawObjectList[0].Fuels[0].Price.currency,
                    "text": stationRawObjectList[0].Fuels[0].Price.text
                }
            },
            {
                "id": stationRawObjectList[0].Fuels[1].id,
                "name": stationRawObjectList[0].Fuels[1].name,
                "short_name": "SP95-E10 [updated value]",  // .......................... updated value
                "picto": stationRawObjectList[0].Fuels[1].picto,
                "Update": {
                    "value": "2023-09-11T11:00:00Z",  // ............................... updated value
                    "text": stationRawObjectList[0].Fuels[1].Update.text
                },
                "available": false,  // ................................................ updated value
                "Price": {
                    "value": 1.456,  // ................................................ updated value
                    "currency": stationRawObjectList[0].Fuels[1].Price.currency,
                    "text": stationRawObjectList[0].Fuels[1].Price.text
                }
            },
            {
                "id": stationRawObjectList[0].Fuels[2].id,
                "name": stationRawObjectList[0].Fuels[2].name,
                "short_name": "SP98 [updated value]",  // .............................. updated value
                "picto": stationRawObjectList[0].Fuels[2].picto,
                "Update": {
                    "value": "2023-09-12T07:26:16Z",  // ............................... updated value
                    "text": stationRawObjectList[0].Fuels[2].Update.text
                },
                "available": false,  // ................................................ updated value
                "Price": {
                    "value": 2.000,  // ................................................ updated value
                    "currency": stationRawObjectList[0].Fuels[2].Price.currency,
                    "text": stationRawObjectList[0].Fuels[2].Price.text
                }
            }
        ],
        "LastUpdate": {
            "value": "2023-09-12T07:26:16Z",  // ....................................... updated value
            "text": stationRawObjectList[0].LastUpdate.text
        },
        "distance": stationRawObjectList[0].distance,
        "Distance": stationRawObjectList[0].Distance
    }
];

let server = null;
let cache = null;

describe('generic update feature', () => {
    beforeAll(() => {
        cache = require('../../../../services/cache');
    });
    beforeEach(() => {
        server = require('../../../../index');
    });
    afterEach(async () => {
        await Station.deleteMany({});
        await History.deleteMany({});
        server.close();
        cache.flushAll();
    });
    afterAll(async () => {
        await mongoose.disconnect();
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
            const stationRawObject = stationRawObjectList[0];  // only consider the first stationRawObject for this test
            // process raw data to fill up the DB:
            await processRawData([stationRawObject]);
            // update object:
            const stationRawObjectUpdated = stationRawObjectListUpdated[0];  // only consider the first stationRawObject for this test
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
        
        test('a fuel removed from a station should not impact the matching history document', async () => {
            const stationRawObject = stationRawObjectList[0];  // only consider the first stationRawObject for this test
            // process raw data to fill up the DB:
            await processRawData([stationRawObject]);
            // update object:
            let stationRawObjectUpdated = JSON.parse(JSON.stringify(stationRawObjectListUpdated[0]));  // only consider the first stationRawObject for this test
            stationRawObjectUpdated.Fuels.splice(0, 1);  // remove element at position 0
            // process new raw data:
            await processRawData([stationRawObjectUpdated]);
            // ensure station doc has been modified in the DB:
            let doc = await Station.findById(stationRawObject.id);
            expect(doc).toBeDefined();
            expect(doc).not.toBeNull();
            expect(doc.fuels.length).toEqual(stationRawObject.Fuels.length - 1);  // there should be 1 fuel object less
            // ensure that only related history docs have been modified in the DB:
            for(let i = 0; i < stationRawObject.Fuels.length; i ++){                
                doc = await History.findByStationAndFuelIds(stationRawObject.id, stationRawObject.Fuels[i].id);
                expect(doc).toBeDefined();
                expect(doc).not.toBeNull();
                // check all values:
                if(i == 0) {  // i.e. if doc matches the fuel element that has been removed in stationRawObjectUpdated
                    expect(doc.station.name).toEqual(stationRawObject.name);  // still equals to the initial value
                    expect(doc.fuel._id).toEqual(stationRawObject.Fuels[0].id);  // still equals to the initial value
                    expect(doc.fuel.shortName).toEqual(stationRawObject.Fuels[0].short_name);  // still equals to the initial value
                    expect(doc.history.length).toEqual(1);  // no new price should have been appended in the history
                } else {
                    expect(doc.station.name).toEqual(stationRawObjectUpdated.name);  // equals to the new value
                    expect(doc.fuel._id).toEqual(stationRawObjectUpdated.Fuels[i-1].id);  // equals to the new value (-1 because first element has been previously deleted)
                    expect(doc.fuel.shortName).toEqual(stationRawObjectUpdated.Fuels[i-1].short_name);  // equals to the new value (-1 because first element has been previously deleted)
                    expect(doc.history.length).toEqual(2);  // a new price should have been appended in the history
                };
            };
        });
        
        /*
        test('a fuel added to a station should cause the creation of a new history document', async () => {
            const stationRawObject = stationRawObjectList[0];  // only consider the first stationRawObject for this test
            // process raw data to fill up the DB:
            await processRawData([stationRawObject]);
            // update object:
            let stationRawObjectUpdated = JSON.parse(JSON.stringify(stationRawObjectListUpdated[0]));  // only consider the first stationRawObject for this test
            const newFuelObject = {
                "id": 9999,
                "name": "New fuel",
                "short_name": "New fuel short name",
                "picto": "New fuel picto",
                "Update": {
                    "value": "2023-10-01T10:00:00Z",
                    "text": "01/10/2023 10:00:00"
                },
                "available": true,
                "Price": {
                    "value": 1.111,
                    "currency": "USD",
                    "text": "1.111 $"
                }
            };
            stationRawObjectUpdated.Fuels.push(newFuelObject);

            console.log('stationRawObjectUpdated: ', stationRawObjectUpdated);

            // process new raw data:
            // ensure station doc has been modified in the DB:
            await processRawData([stationRawObjectUpdated]);
            let doc = await Station.findById(stationRawObject.id);
            expect(doc).toBeDefined();
            expect(doc).not.toBeNull();
            expect(doc.fuels.length).toEqual(stationRawObject.Fuels.length + 1);  // there should be 1 fuel object more
            // check result:
            doc = await History.findByStationAndFuelIds(stationRawObject.id, newFuelObject.id);
            expect(doc).toBeDefined();
            expect(doc).not.toBeNull();
            expect(doc.station.name).toEqual(stationRawObjectUpdated.name);
            expect(doc.fuel._id).toEqual(newFuelObject.id);
            expect(doc.fuel.shortName).toEqual(newFuelObject.short_name);
            expect(doc.history.length).toEqual(1);
            expect(doc.history[0].price).toEqual(newFuelObject.Price.value);
            expect(doc.history[0].date.toString()).toEqual(new Date(newFuelObject.Update.value).toString());
        });
        */

        test('no modification in a fuel date should not cause any modification in the matching history', () => {
            // TODO
            expect(1).toBe(1);
        });
    });
});