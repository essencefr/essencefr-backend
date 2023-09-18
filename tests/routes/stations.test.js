/**
 * Testing the 'stations' endpoint
 */

const request = require('supertest');  // function used to send a request to an endpoint
const mongoose = require('mongoose');
const { Station } = require('../../models/station');

let server = null;

// main test suite:
describe('/api/stations', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach( async () => {
        server.close();
        await Station.deleteMany({});
    });
    afterAll(() => { mongoose.disconnect(); });

    describe('GET /:id', () => {

        test('should return the station when id is correct', async () => {
            const { saveStations } = require('../../utils/update');
            // define the raw data object:
            const stationId = 33700009;
            const stationName = "CASINO SUPERMARCHE";
            const stationsDataRaw = [    // real extract retrieved from the gov API
            {
                "id": stationId,
                "Brand": {
                    "id": 29,
                    "name": "Casino",
                    "short_name": "casino",
                    "nbStations": 172
                },
                "type": "R",
                "name": stationName,
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
            }];
            await saveStations(stationsDataRaw);
            // read database through api endpoint:
            const res = await request(server).get(`/api/stations/${stationId}`);
            // compare results:
            expect(res.status).toBe(200);
            expect(res.body.name).toEqual(stationName);
        });
        
        test('should throw 404 when id is unknwon', async () => {
            const res = await request(server).get(`/api/stations/1`);
            expect(res.status).toBe(404);
        });

        test('should throw 400 when id is incorrect', async () => {
            const res = await request(server).get(`/api/stations/a`);
            expect(res.status).toBe(400);
        });
    });
});
