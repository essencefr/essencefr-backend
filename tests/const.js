/**
 * Generic const values used for tests
 */

// real extract retrieved from the gov API:
const stationRawObjectList = [
    {
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
    },
    {
        "id": 95350002,
        "latitude": "4900763",
        "longitude": 235163.0,
        "cp": "95350",
        "pop": "R",
        "adresse": "20 avenue robert schumann",
        "ville": "Saint-Brice-sous-For\u00eat",
        "services": "{\"service\": [\"Vente de gaz domestique (Butane, Propane)\", \"DAB (Distributeur automatique de billets)\"]}",
        "prix": "[{\"@nom\": \"Gazole\", \"@id\": \"1\", \"@maj\": \"2023-10-09 07:51:00\", \"@valeur\": \"1.847\"}, {\"@nom\": \"SP95\", \"@id\": \"2\", \"@maj\": \"2023-10-09 07:51:00\", \"@valeur\": \"1.868\"}, {\"@nom\": \"E10\", \"@id\": \"5\", \"@maj\": \"2023-10-09 07:51:00\", \"@valeur\": \"1.817\"}, {\"@nom\": \"SP98\", \"@id\": \"6\", \"@maj\": \"2023-10-09 07:51:00\", \"@valeur\": \"1.880\"}]",
        "horaires": "{\"@automate-24-24\": \"\", \"jour\": [{\"@id\": \"1\", \"@nom\": \"Lundi\", \"@ferme\": \"\"}, {\"@id\": \"2\", \"@nom\": \"Mardi\", \"@ferme\": \"\"}, {\"@id\": \"3\", \"@nom\": \"Mercredi\", \"@ferme\": \"\"}, {\"@id\": \"4\", \"@nom\": \"Jeudi\", \"@ferme\": \"\"}, {\"@id\": \"5\", \"@nom\": \"Vendredi\", \"@ferme\": \"\"}, {\"@id\": \"6\", \"@nom\": \"Samedi\", \"@ferme\": \"\"}, {\"@id\": \"7\", \"@nom\": \"Dimanche\", \"@ferme\": \"\"}]}",
        "geom": {
            "lon": 2.35163,
            "lat": 49.00763
        },
        "gazole_maj": "2023-10-09 07:51:00",
        "gazole_prix": "1.847",
        "sp95_maj": "2023-10-09 07:51:00",
        "sp95_prix": "1.868",
        "e85_maj": null,
        "e85_prix": null,
        "gplc_maj": null,
        "gplc_prix": null,
        "e10_maj": "2023-10-09 07:51:00",
        "e10_prix": "1.817",
        "sp98_maj": "2023-10-09 07:51:00",
        "sp98_prix": "1.880",
        "carburants_disponibles": [
            "Gazole",
            "SP95",
            "E10",
            "SP98"
        ],
        "carburants_indisponibles": [
            "E85",
            "GPLc"
        ],
        "horaires_automate_24_24": "Non",
        "services_service": [
            "Vente de gaz domestique (Butane, Propane)",
            "DAB (Distributeur automatique de billets)"
        ],
        "departement": "Val-d'Oise",
        "code_departement": "95",
        "region": "\u00cele-de-France",
        "code_region": "11"
    }
];

// manually updated extract for test purposes. Only the fields used by the insternal scripts are modified:
const stationRawObjectListUpdated = [
    {
        "id": 66700007,
        "latitude": "4257500",
        "longitude": 303500.0,
        "cp": "66701",  // modified value
        "pop": "R",
        "adresse": "5 ROUTE DU LITTORAL [modified]",  // modified value
        "ville": "Argel\u00e8s-sur-Mer [modified]",  // modified value
        "services": "{\"service\": [\"Carburant additiv\u00e9\", \"Automate CB 24/24\"]}",
        "prix": "[{\"@nom\": \"Gazole\", \"@id\": \"1\", \"@maj\": \"2023-10-07 01:22:20\", \"@valeur\": \"1.908\"}, {\"@nom\": \"E85\", \"@id\": \"3\", \"@maj\": \"2023-09-14 07:33:59\", \"@valeur\": \"0.994\"}, {\"@nom\": \"E10\", \"@id\": \"5\", \"@maj\": \"2023-10-07 01:22:20\", \"@valeur\": \"1.920\"}]",
        "horaires": "{\"@automate-24-24\": \"1\", \"jour\": [{\"@id\": \"1\", \"@nom\": \"Lundi\", \"@ferme\": \"\"}, {\"@id\": \"2\", \"@nom\": \"Mardi\", \"@ferme\": \"\"}, {\"@id\": \"3\", \"@nom\": \"Mercredi\", \"@ferme\": \"\"}, {\"@id\": \"4\", \"@nom\": \"Jeudi\", \"@ferme\": \"\"}, {\"@id\": \"5\", \"@nom\": \"Vendredi\", \"@ferme\": \"\"}, {\"@id\": \"6\", \"@nom\": \"Samedi\", \"@ferme\": \"\"}, {\"@id\": \"7\", \"@nom\": \"Dimanche\", \"@ferme\": \"\"}]}",
        "geom": {
            "lon": 3.030,   // modified value
            "lat": 42.577   // modified value
        },
        "gazole_maj": "2023-10-08 01:22:20",  // modified value
        "gazole_prix": "1.910",  // modified value
        "sp95_maj": null,
        "sp95_prix": null,
        "e85_maj": "2023-10-08 07:33:59",  // modified value
        "e85_prix": "0.999",  // modified value
        "gplc_maj": null,
        "gplc_prix": null,
        "e10_maj": "2023-10-08 01:22:20",  // modified value
        "e10_prix": "1.930",  // modified value
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
    },
    {
        "id": 95350002,
        "latitude": "4900763",
        "longitude": 235163.0,
        "cp": "95351",  // modified value
        "pop": "R",
        "adresse": "20 avenue robert schumann [modified]",  // modified value
        "ville": "Saint-Brice-sous-For\u00eat [modified]",  // modified value
        "services": "{\"service\": [\"Vente de gaz domestique (Butane, Propane)\", \"DAB (Distributeur automatique de billets)\"]}",
        "prix": "[{\"@nom\": \"Gazole\", \"@id\": \"1\", \"@maj\": \"2023-10-09 07:51:00\", \"@valeur\": \"1.847\"}, {\"@nom\": \"SP95\", \"@id\": \"2\", \"@maj\": \"2023-10-09 07:51:00\", \"@valeur\": \"1.868\"}, {\"@nom\": \"E10\", \"@id\": \"5\", \"@maj\": \"2023-10-09 07:51:00\", \"@valeur\": \"1.817\"}, {\"@nom\": \"SP98\", \"@id\": \"6\", \"@maj\": \"2023-10-09 07:51:00\", \"@valeur\": \"1.880\"}]",
        "horaires": "{\"@automate-24-24\": \"\", \"jour\": [{\"@id\": \"1\", \"@nom\": \"Lundi\", \"@ferme\": \"\"}, {\"@id\": \"2\", \"@nom\": \"Mardi\", \"@ferme\": \"\"}, {\"@id\": \"3\", \"@nom\": \"Mercredi\", \"@ferme\": \"\"}, {\"@id\": \"4\", \"@nom\": \"Jeudi\", \"@ferme\": \"\"}, {\"@id\": \"5\", \"@nom\": \"Vendredi\", \"@ferme\": \"\"}, {\"@id\": \"6\", \"@nom\": \"Samedi\", \"@ferme\": \"\"}, {\"@id\": \"7\", \"@nom\": \"Dimanche\", \"@ferme\": \"\"}]}",
        "geom": {
            "lon": 2.35164,  // modified value
            "lat": 49.00764  // modified value
        },
        // here dates are intentionnally not modified:
        "gazole_maj": "2023-10-09 07:51:00",  // -> intentionnally not modified
        "gazole_prix": "1.848",  // modified value
        "sp95_maj": "2023-10-09 07:51:00",  // -> intentionnally not modified
        "sp95_prix": "1.870",  // modified value
        "e85_maj": null,
        "e85_prix": null,
        "gplc_maj": null,
        "gplc_prix": null,
        "e10_maj": "2023-10-09 07:51:00",  // -> intentionnally not modified
        "e10_prix": "1.819",  // modified value
        "sp98_maj": "2023-10-09 07:51:00",  // -> intentionnally not modified
        "sp98_prix": "1.888",  // modified value
        "carburants_disponibles": [
            "Gazole",
            "SP95",
            "E10",
            "SP98"
        ],
        "carburants_indisponibles": [
            "E85",
            "GPLc"
        ],
        "horaires_automate_24_24": "Non",
        "services_service": [
            "Vente de gaz domestique (Butane, Propane)",
            "DAB (Distributeur automatique de billets)"
        ],
        "departement": "Val-d'Oise",
        "code_departement": "95",
        "region": "\u00cele-de-France",
        "code_region": "11"
    }
];

module.exports.stationRawObjectList = stationRawObjectList;
module.exports.stationRawObjectListUpdated = stationRawObjectListUpdated;