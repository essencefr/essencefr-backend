/**
 * Testing the update feature
 */

const mongoose = require('mongoose');
const { Station } = require('../../models/station');

// main test suite:
describe('update', () => {
    afterAll(() => { mongoose.disconnect(); });

    describe('saving station', () => {
        test('saving given data', async () => {
            const { saveStation } = require('../../update/update');
            
            const stationData = {  // real extract retrieved from the gov API
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
            };
            const newDoc = await saveStation(stationData);

            expect(newDoc.stationId).toBe(stationData.id);
        });
    });
});