# What data format for my database ?

- [What data format for my database ?](#what-data-format-for-my-database-)
- [Raw data format](#raw-data-format)
- [My data format](#my-data-format)
  - [Station](#station)
  - [History](#history)
  - [Fuel details](#fuel-details)
  - [Brands (maby for later)](#brands-maby-for-later)

# Raw data format
Here's the data format when retrieving details from government endpoint:

```json
{
    "id": 33700009,
    "Brand": {
        "id": 29,
        "name": "Casino",
        "short_name": "casino",
        "nb_stations": 172
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
## Station
Here's my data format for storing a station details:

```json
{
    "id": 33700009,
    "brand": {
        "id": 29,
        "name": "Casino",
        "shortName": "casino"
    },
    "name": "CASINO SUPERMARCHE",
    "address": {
        "streetLine": "Allée des Conviviales",
        "cityLine": "33700 Mérignac"
    },
    "coordinates": {
        "latitude": "44.828",
        "longitude": "-0.621"
    },
    "fuels": [
        {
            "id": 1,
            "shortName": "Gazole",
            "date": "2023-09-18T07:26:15Z",     // timestamp of last known price/avaiability update
            "available": true,                  // 'false' if there is a rupture
            "price": 1.989
        },
        {
            "id": 5,
            "shortName": "SP95-E10",
            "date": "2023-09-18T07:26:16Z",
            "available": true,
            "price": 1.969,
        },
        {
            "id": 6,
            "shortName": "SP98",
            "date": "2023-09-18T07:26:16Z",
            "available": true,
            "price": 2.019,
        }
    ]
}
```

## History
Here's my data format for storing fuels prices history:

```json
{
    "stationId": 33700009,
    "fuelId": 1,
    "fuelShortName": "Gazole",
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
// Separated histories based on 'stationId' and 'fuelId' for faster data filtering (filter applied within db queries, at data level)
{
    "stationId": 33700009,
    "fuelId": 5,
    "fuelShortName": "SP95-E10",
    "history": [
        {
            "date": "2023-08-18T14:46:15Z",
            "price": 1.984
        },
        {
            "date": "2023-09-18T07:26:15Z",
            "price": 1.969
        },
        ...
    ]
}
```

> Another possiblity is to separate histories values based on `stationId`, `fuelId` AND `date` in order to filter by date within the query too. The performance-storage ratio has to be evaluated to determine if this is a viable solution.

## Fuel details
Here's my data format for storing generic fuel details (identical to data retrived from gov API):

```json
[
    {
        "id": 1,
        "name": "Gazole",
        "short_name": "Gazole",
        "picto": "B7"
    },
    {
        "id": 3,
        "name": "Super Ethanol E85",
        "short_name": "E85",
        "picto": "E85"
    },
    {
        "id": 5,
        "name": "Super Sans Plomb 95 E10",
        "short_name": "SP95-E10",
        "picto": "E10"
    },
    {
        "id": 2,
        "name": "Super Sans Plomb 95",
        "short_name": "SP95",
        "picto": "E5"
    },
    {
        "id": 6,
        "name": "Super Sans Plomb 98",
        "short_name": "SP98",
        "picto": "E5"
    },
    {
        "id": 4,
        "name": "GPLc",
        "short_name": "GPLc",
        "picto": "LPG"
    }
]
```

## Brands (maby for later)
Here's my data format for storing generic brands details:

```json
[
    {
        "id": 1,
        "name": "TotalEnergies",
        "short_name": "total",
        "nb_stations": 1611
    },
    {
        "id": 66,
        "name": "Intermarché",
        "short_name": "intermarche",
        "nb_stations": 1455
    },
    {
        "id": 136,
        "name": "Système U",
        "short_name": "systemeu",
        "nb_stations": 867
    },
    {
        "id": 28,
        "name": "Carrefour Market",
        "short_name": "carrefourmarket",
        "nb_stations": 723
    },
    {
        "id": 42,
        "name": "E.Leclerc",
        "short_name": "eleclerc",
        "nb_stations": 709
    },
    {
        "id": 2,
        "name": "TotalEnergies Access",
        "short_name": "totalaccess",
        "nb_stations": 700
    },
    {
        "id": 12,
        "name": "Avia",
        "short_name": "avia",
        "nb_stations": 588
    },
    {
        "id": 26,
        "name": "Carrefour Contact",
        "short_name": "carrefourcontact",
        "nb_stations": 383
    },
    {
        "id": 49,
        "name": "Esso Express",
        "short_name": "essoexpress",
        "nb_stations": 322
    },
    {
        "id": 17,
        "name": "BP",
        "short_name": "bp",
        "nb_stations": 255
    },
    {
        "id": 25,
        "name": "Carrefour",
        "short_name": "carrefour",
        "nb_stations": 223
    },
    {
        "id": 7,
        "name": "Auchan",
        "short_name": "auchan",
        "nb_stations": 219
    },
    {
        "id": 48,
        "name": "Esso",
        "short_name": "esso",
        "nb_stations": 208
    },
    {
        "id": 29,
        "name": "Casino",
        "short_name": "casino",
        "nb_stations": 172
    },
    {
        "id": 46,
        "name": "ENI",
        "short_name": "eni",
        "nb_stations": 155
    },
    {
        "id": 44,
        "name": "Elan",
        "short_name": "elan",
        "nb_stations": 125
    },
    {
        "id": 134,
        "name": "Intermarché Contact",
        "short_name": "intercontact",
        "nb_stations": 125
    },
    {
        "id": 41,
        "name": "Dyneff",
        "short_name": "dyneff",
        "nb_stations": 88
    },
    {
        "id": 98,
        "name": "Shell",
        "short_name": "shell",
        "nb_stations": 84
    },
    {
        "id": 81,
        "name": "Netto",
        "short_name": "netto",
        "nb_stations": 79
    }
]
```
