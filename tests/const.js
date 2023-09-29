/**
 * Generic const values used for tests
 */

// real extract retrieved from the gov API
const stationRawObjectList = [
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

const stationRawObjectListUpdated = [
    {
        "id": 33700009,
        "Brand": {
            "id": 30,  //  [updated value]
            "name": "Casino [updated value]",
            "short_name": "casino",
            "nbStations": 172
        },
        "type": "R",
        "name": "CASINO SUPERMARCHE  [updated value]",
        "Address": {
            "street_line": "Allée des Conviviales [updated value]",
            "city_line": "33700 Mérignac [updated value]"
        },
        "Coordinates": {
            "latitude": "45.555",  // [updated value]
            "longitude": "-0.777"  // [updated value]
        },
        "Fuels": [
            {
                "id": 1,
                "name": "Gazole",
                "short_name": "Gazole [updated value]",
                "picto": "B7",
                "Update": {
                    "value": "2023-09-10T10:00:00Z",  // [updated value]
                    "text": "18/09/2023 07:26:15"
                },
                "available": false,  // [updated value]
                "Price": {
                    "value": 1.789, //  [updated value]
                    "currency": "EUR",
                    "text": "1.989 €"
                }
            },
            {
                "id": 5,
                "name": "Super Sans Plomb 95 E10",
                "short_name": "SP95-E10 [updated value]",
                "picto": "E10",
                "Update": {
                    "value": "2023-09-11T11:00:00Z",  // [updated value]
                    "text": "18/09/2023 07:26:16"
                },
                "available": false,  // [updated value]
                "Price": {
                    "value": 1.456,  // [updated value]
                    "currency": "EUR",
                    "text": "1.969 €"
                }
            },
            {
                "id": 6,
                "name": "Super Sans Plomb 98",
                "short_name": "SP98 [updated value]",
                "picto": "E5",
                "Update": {
                    "value": "2023-09-12T07:26:16Z",  // [updated value]
                    "text": "18/09/2023 07:26:16"
                },
                "available": false,  // [updated value]
                "Price": {
                    "value": 2.000,  // [updated value]
                    "currency": "EUR",
                    "text": "2.019 €"
                }
            }
        ],
        "LastUpdate": {
            "value": "2023-09-12T07:26:16Z",  // [updated value]
            "text": "18/09/2023 07:26:16"
        },
        "distance": 1845,
        "Distance": {
            "value": 1845,
            "text": "1.85 km"
        }
    }
];

module.exports.stationRawObjectList = stationRawObjectList;
module.exports.stationRawObjectListUpdated = stationRawObjectListUpdated;