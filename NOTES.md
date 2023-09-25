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
- [Mongoose operators used](#mongoose-operators-used)
  - [For inserting stations into the DB](#for-inserting-stations-into-the-db)
    - [Model.insertMany()](#modelinsertmany)
    - [Model.bulkWrite()](#modelbulkwrite)
      - [Idem but with delay needed for 'hydrate':](#idem-but-with-delay-needed-for-hydrate)

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

# Mongoose operators used
## For inserting stations into the DB
### Model.insertMany()

First possibility:
```javaScript
await Station.insertMany(stationObjectList);
```

How long does it take, is it faster than the second posibility below ?

**Test**: inserting 100 documents, 100 times:
```
Elapsed time: 124.491 ms    -> the firsts attempts have a delay due to the connection init ?
Elapsed time: 74.1833 ms
Elapsed time: 40.7187 ms
Elapsed time: 37.931 ms
Elapsed time: 31.0544 ms
Elapsed time: 34.4382 ms
Elapsed time: 29.2069 ms
Elapsed time: 31.9093 ms
Elapsed time: 38.1188 ms
Elapsed time: 27.2704 ms
Elapsed time: 27.6041 ms
Elapsed time: 28.5629 ms
Elapsed time: 26.5136 ms
Elapsed time: 27.562 ms
Elapsed time: 27.5133 ms
Elapsed time: 27.8476 ms
Elapsed time: 26.9144 ms
Elapsed time: 26.306 ms
Elapsed time: 26.8036 ms
Elapsed time: 27.8817 ms
...
Elapsed time: 27.7975 ms
Elapsed time: 26.4122 ms
Elapsed time: 26.2484 ms
Elapsed time: 25.1616 ms
Elapsed time: 25.9745 ms
Elapsed time: 30.9043 ms
Elapsed time: 26.4422 ms
Elapsed time: 27.0135 ms
Elapsed time: 24.5838 ms
Elapsed time: 24.725 ms
-> Average time: 28.640007999999998 ms
```

### Model.bulkWrite()

First possibility:
```javaScript
await Station.bulkWrite([
    { insertOne:
        { document: stationDocument1 }
    },
    { insertOne:
        { document: stationDocument2 }
    },
    { insertOne:
        { document: stationDocument3 }
    },
    ...
]);
```

How long does it take, is it faster than the second posibility below ?

**Test**: inserting 100 documents, 100 times:
```
Elapsed time: 37.696 ms
Elapsed time: 8.7049 ms
Elapsed time: 7.6542 ms
Elapsed time: 9.2871 ms
Elapsed time: 10.7342 ms
Elapsed time: 7.2015 ms
Elapsed time: 10.6637 ms
Elapsed time: 6.3165 ms
Elapsed time: 5.1572 ms
Elapsed time: 8.3572 ms
Elapsed time: 5.0331 ms
Elapsed time: 5.3403 ms
Elapsed time: 4.027 ms
Elapsed time: 3.5225 ms
Elapsed time: 4.8072 ms
Elapsed time: 4.0876 ms
Elapsed time: 4.9955 ms
Elapsed time: 4.9986 ms
Elapsed time: 4.7928 ms
Elapsed time: 5.0342 ms
...
Elapsed time: 3.9837 ms
Elapsed time: 3.1895 ms
Elapsed time: 3.3444 ms
Elapsed time: 4.6813 ms
Elapsed time: 4.3637 ms
Elapsed time: 3.4764 ms
Elapsed time: 4.5968 ms
Elapsed time: 3.2453 ms
Elapsed time: 3.1293 ms
Elapsed time: 3.1997 ms
-> Average time: 4.579684000000001 ms
```

#### Idem but with delay needed for 'hydrate':

**Test**: inserting 100 documents, 100 times:
```
Elapsed time: 43.8554 ms
Elapsed time: 9.3227 ms
Elapsed time: 8.545 ms
Elapsed time: 10.1251 ms
Elapsed time: 9.8609 ms
Elapsed time: 9.4164 ms
Elapsed time: 8.9185 ms
Elapsed time: 7.2968 ms
Elapsed time: 5.8808 ms
Elapsed time: 6.636 ms
Elapsed time: 6.1569 ms
Elapsed time: 5.1697 ms
Elapsed time: 4.6358 ms
Elapsed time: 4.2156 ms
Elapsed time: 5.2485 ms
Elapsed time: 5.0956 ms
Elapsed time: 6.2162 ms
Elapsed time: 5.4772 ms
Elapsed time: 4.4558 ms
Elapsed time: 4.8361 ms
...
Elapsed time: 3.5713 ms
Elapsed time: 3.6596 ms
Elapsed time: 4.6219 ms
Elapsed time: 3.4062 ms
Elapsed time: 3.8118 ms
Elapsed time: 4.4709 ms
Elapsed time: 3.3923 ms
Elapsed time: 3.5847 ms
Elapsed time: 3.8712 ms
Elapsed time: 4.2017 ms
-> Average time: 5.087847 ms
```