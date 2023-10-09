/**
 * Generic const values used for tests
 */

// real extract retrieved from the wrapper using the gov API
const stationRawObjectListOld = [
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

// real extract retrieved from the gov API:
const stationRawObjectList = [{
    "id": 66700007,
    "latitude": "4257500",
    "longitude": 303500.0,
    "cp": "66700",
    "pop": "R",
    "adresse": "5 ROUTE DU LITTORAL",
    "ville": "Argel\u00e8s-sur-Mer",
    "services": "{\"service\": [\"Carburant additiv\u00e9\", \"Automate CB 24/24\"]}",
    "prix": "[{\"@nom\": \"Gazole\", \"@id\": \"1\", \"@maj\": \"2023-10-07 01:22:20\", \"@valeur\": \"1.908\"}, {\"@nom\": \"E85\", \"@id\": \"3\", \"@maj\": \"2023-09-14 07:33:59\", \"@valeur\": \"0.994\"}, {\"@nom\": \"E10\", \"@id\": \"5\", \"@maj\": \"2023-10-07 01:22:20\", \"@valeur\": \"1.920\"}]",
    "horaires": "{\"@automate-24-24\": \"1\", \"jour\": [{\"@id\": \"1\", \"@nom\": \"Lundi\", \"@ferme\": \"\"}, {\"@id\": \"2\", \"@nom\": \"Mardi\", \"@ferme\": \"\"}, {\"@id\": \"3\", \"@nom\": \"Mercredi\", \"@ferme\": \"\"}, {\"@id\": \"4\", \"@nom\": \"Jeudi\", \"@ferme\": \"\"}, {\"@id\": \"5\", \"@nom\": \"Vendredi\", \"@ferme\": \"\"}, {\"@id\": \"6\", \"@nom\": \"Samedi\", \"@ferme\": \"\"}, {\"@id\": \"7\", \"@nom\": \"Dimanche\", \"@ferme\": \"\"}]}",
    "geom": {
        "lon": 3.035,
        "lat": 42.575
    },
    "gazole_maj": "2023-10-07 01:22:20",
    "gazole_prix": "1.908",
    "sp95_maj": null,
    "sp95_prix": null,
    "e85_maj": "2023-09-14 07:33:59",
    "e85_prix": "0.994",
    "gplc_maj": null,
    "gplc_prix": null,
    "e10_maj": "2023-10-07 01:22:20",
    "e10_prix": "1.920",
    "sp98_maj": null,
    "sp98_prix": null,
    "carburants_disponibles": [
        "Gazole",
        "E85",
        "E10"
    ],
    "carburants_indisponibles": [
        "SP95",
        "GPLc",
        "SP98"
    ],
    "horaires_automate_24_24": "Oui",
    "services_service": [
        "Carburant additiv\u00e9",
        "Automate CB 24/24"
    ],
    "departement": "Pyr\u00e9n\u00e9es-Orientales",
    "code_departement": "66",
    "region": "Occitanie",
    "code_region": "76"
}];

module.exports.stationRawObjectList = stationRawObjectList;