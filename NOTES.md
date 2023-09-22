# What data format for my database ?

- [What data format for my database ?](#what-data-format-for-my-database-)
- [Raw data format](#raw-data-format)
- [My data format](#my-data-format)
  - [Station](#station)
  - [History](#history)
  - [Fuel](#fuel)
  - [Brand](#brand)
- [Naming convention](#naming-convention)
  - [Station](#station-1)

# Raw data format
Here's the data format when retrieving details from government endpoint:

```json
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
```

# My data format
My JSON case convention: camelCase.

## Station
Here's my data format for storing a station details:

```json
{
    "_id": 33700009,
    "brand": {
        "id": 29,
        "name": "Casino"
    },
    "name": "CASINO SUPERMARCHE",
    "address": {
        "streetLine": "Allée des Conviviales",
        "cityLine": "33700 Mérignac"
    },
    "coordinates": {  // idea for later: use coordinates to display stations on a map
        "latitude": "44.828",
        "longitude": "-0.621"
    },
    "fuels": [
        {
            "id": 1,
            "shortName": "Gazole",
            "date": "2023-09-18T07:26:15Z",     // timestamp of last known price/avaiability update
            "available": true,                  // 'false' if there is a rupture
            "price": 1.989,                     // last known price value
            "historyId": ObjectId('xxx')        // reference id to the history document
        },
        {
            "id": 5,
            "shortName": "SP95-E10",
            "date": "2023-09-18T07:26:16Z",
            "available": true,
            "price": 1.969,
            "historyId": ObjectId('xxx')
        },
        {
            "id": 6,
            "shortName": "SP98",
            "date": "2023-09-18T07:26:16Z",
            "available": true,
            "price": 2.019,
            "historyId": ObjectId('xxx')
        }
    ]
}
```

## History
Here's my data format for storing fuels prices history:

Histories are separated based on `stationId` and `fuelId` for faster data filtering (filter applied within db queries, at data level)

```json
{
    "_id": ObjectId('xxx'),  // automatically added by mongoose
    "station": {
        "id": 33700009,     // reference id to the station document
        "name": "CASINO SUPERMARCHE"
    },
    "fuel": {
        "id": 1,
        "shortName": "Gazole"
    },
    "history": [  // basically a 2D array that stores a price with its date everytime a price change has been detected
        {
            "date": "2023-08-18T07:26:15Z",  // should be DATE type in db
            "price": 1.978
        },
        {
            "date": "2023-09-18T07:26:15Z",
            "price": 1.989
        },
        ...
    ]
}
```

> Another possiblity is to separate histories values based on `stationId`, `fuelId` AND `date` in order to filter by date within the query too. The performance-storage ratio has to be evaluated to determine if this is a viable solution.

## Fuel
Here's my data format for storing generic fuel details:

```json
{
    "fuelId": 1,
    "name": "Gazole",
    "shortName": "Gazole",
    "picto": "B7"
}

{
    "fuelId": 2,
    "name": "Super Sans Plomb 95",
    "shortName": "SP95",
    "picto": "E5"
}

{
    "fuelId": 3,
    "name": "Super Ethanol E85",
    "shortName": "E85",
    "picto": "E85"
}

{
    "fuelId": 4,
    "name": "GPLc",
    "shortName": "GPLc",
    "picto": "LPG"
}

{
    "fuelId": 5,
    "name": "Super Sans Plomb 95 E10",
    "shortName": "SP95-E10",
    "picto": "E10"
}

{
    "fuelId": 6,
    "name": "Super Sans Plomb 98",
    "shortName": "SP98",
    "picto": "E5"
}
```

## Brand
Here's my data format for storing generic brands details:

```json
{
    "_id": 1,
    "name": "TotalEnergies",
    "shortName": "total",
    "nbStations": 1611
}

{
    "_id": 66,
    "name": "Intermarché",
    "shortName": "intermarche",
    "nbStations": 1455
}

{
    "_id": 136,
    "name": "Système U",
    "shortName": "systemeu",
    "nbStations": 867
}

{
    "_id": 28,
    "name": "Carrefour Market",
    "shortName": "carrefourmarket",
    "nbStations": 723
}

{
    "_id": 42,
    "name": "E.Leclerc",
    "shortName": "eleclerc",
    "nbStations": 709
}

{
    "_id": 2,
    "name": "TotalEnergies Access",
    "shortName": "totalaccess",
    "nbStations": 700
}

{
    "_id": 12,
    "name": "Avia",
    "shortName": "avia",
    "nbStations": 588
}

{
    "_id": 26,
    "name": "Carrefour Contact",
    "shortName": "carrefourcontact",
    "nbStations": 383
}

{
    "_id": 49,
    "name": "Esso Express",
    "shortName": "essoexpress",
    "nbStations": 322
}

{
    "_id": 17,
    "name": "BP",
    "shortName": "bp",
    "nbStations": 255
}

{
    "_id": 25,
    "name": "Carrefour",
    "shortName": "carrefour",
    "nbStations": 223
}

{
    "_id": 7,
    "name": "Auchan",
    "shortName": "auchan",
    "nbStations": 219
}

{
    "_id": 48,
    "name": "Esso",
    "shortName": "esso",
    "nbStations": 208
}

{
    "_id": 29,
    "name": "Casino",
    "shortName": "casino",
    "nbStations": 172
}

{
    "_id": 46,
    "name": "ENI",
    "shortName": "eni",
    "nbStations": 155
}

{
    "_id": 44,
    "name": "Elan",
    "shortName": "elan",
    "nbStations": 125
}

{
    "_id": 134,
    "name": "Intermarché Contact",
    "shortName": "intercontact",
    "nbStations": 125
}

{
    "_id": 41,
    "name": "Dyneff",
    "shortName": "dyneff",
    "nbStations": 88
}

{
    "_id": 98,
    "name": "Shell",
    "shortName": "shell",
    "nbStations": 84
}

{
    "_id": 81,
    "name": "Netto",
    "shortName": "netto",
    "nbStations": 79
}
```

# Naming convention

## Station
- `stationRawObjectList`: list of `stationRawObject` objects. This is the format returned by the government API called in function `fetchStations`.
- `stationRawObject`: object in the list returned by the government API called in function `fetchStations`.
- `stationObject`: object manipulated by the server, matching the structure defined in models (i.e. matching the document in the DB). A converter can turn a `stationRawObject` object into a `stationObject` object.
- `stationObjectList`: list of `stationObject` objects.
