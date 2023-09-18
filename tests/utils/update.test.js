/**
 * Testing the update feature
 */
const request = require('supertest');  // function used to send a request to an endpoint
const mongoose = require('mongoose');
const { Station } = require('../../models/station');

let server = null;

let stationsDataRaw = [    // real extract retrieved from the gov API
    {
        "id": 33700009,
        "Brand": {
            "id": 29,
            "name": "Casino",
            "short_name": "casino",
            "nbStations": 172
        },
        "type": "R",
        "name": "CASINO SUPERMARCHE",
        "Address": {
            "street_line": "Allée des Conviviales",
            "city_line": "33700 Mérignac"
        },
        "Coordinates": {
            "latitude": "44.828",
            "longitude": "-0.621"
        },
        "Fuels": [
            {
                "id": 1,
                "name": "Gazole",
                "short_name": "Gazole",
                "picto": "B7",
                "Update": {
                    "value": "2023-09-18T07:26:15Z",
                    "text": "18/09/2023 07:26:15"
                },
                "available": true,
                "Price": {
                    "value": 1.989,
                    "currency": "EUR",
                    "text": "1.989 €"
                }
            },
            {
                "id": 5,
                "name": "Super Sans Plomb 95 E10",
                "short_name": "SP95-E10",
                "picto": "E10",
                "Update": {
                    "value": "2023-09-18T07:26:16Z",
                    "text": "18/09/2023 07:26:16"
                },
                "available": true,
                "Price": {
                    "value": 1.969,
                    "currency": "EUR",
                    "text": "1.969 €"
                }
            },
            {
                "id": 6,
                "name": "Super Sans Plomb 98",
                "short_name": "SP98",
                "picto": "E5",
                "Update": {
                    "value": "2023-09-18T07:26:16Z",
                    "text": "18/09/2023 07:26:16"
                },
                "available": true,
                "Price": {
                    "value": 2.019,
                    "currency": "EUR",
                    "text": "2.019 €"
                }
            }
        ],
        "LastUpdate": {
            "value": "2023-09-18T07:26:16Z",
            "text": "18/09/2023 07:26:16"
        },
        "distance": 1845,
        "Distance": {
            "value": 1845,
            "text": "1.85 km"
        }
    }
];

// main test suite:
describe('update feature', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach( async () => {
        server.close();
        await Station.deleteMany({});
    });
    afterAll(() => { mongoose.disconnect(); });

    describe('adding data into database', () => {
        test('data should be avaiable after being added', async () => {
            const { saveStations } = require('../../utils/update');
            // get the raw data object elements:
            const stationId = stationsDataRaw[0].id;
            const stationName = stationsDataRaw[0].name;
            // save data:
            await saveStations(stationsDataRaw);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationId}`);
            // compare results:
            expect(res.status).toBe(200);
            expect(res.body.name).toEqual(stationName);
        });

        test('adding stations with partial data should raise an error', async () => {
            const { saveStations } = require('../../utils/update');
            const stationsDataRaw = [
                { id: 1, name: 'a' },
            ];
            // ensure that a validation error is thrown:
            await expect(saveStations(stationsDataRaw)).rejects.toThrow(/validation error/i);
        });

        test('adding two stations with the same _id should raise an error and none of the stations should be added', async () => {
            const { saveStations } = require('../../utils/update');
            stationsDataRaw.push(stationsDataRaw[0]);
            await expect(saveStations(stationsDataRaw)).rejects.toThrow(/duplicate key error/i);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationsDataRaw[0].id}`);
            expect(res.status).toBe(404);  // TODO to make this test passed: add stations within a transaction (so far status is 200)
        });
    });
});