# Generic ideas

- Archives from 2007 can be retrieved from : https://www.prix-carburants.gouv.fr/rubrique/opendata/
  - It provides xml files for a given `day`, `year` or even for the current moment (~10 minutes)
- API for the current prices is provided at: https://data.economie.gouv.fr/explore/dataset/prix-des-carburants-en-france-flux-instantane-v2/information/

Voici l'API à appeler pour avoir les prix en temps réel, dans un nombre limité (max 100):
```
https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?select=id%2C%20latitude%2C%20longitude%2C%20cp%2C%20adresse%2C%20ville%2C%20gazole_maj%2C%20gazole_prix%2C%20sp95_maj%2C%20sp95_prix%2C%20e85_maj%2C%20e85_prix%2C%20gplc_maj%2C%20gplc_prix%2C%20e10_maj%2C%20e10_prix%2C%20sp98_maj%2C%20sp98_prix&limit=100
```

Voici l'API à appeler pour exporter l'ensemble des prix en temps réel:
```
https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/exports/json?limit=-1&timezone=Europe%2FParis&select=id%2C%20latitude%2C%20longitude%2C%20cp%2C%20adresse%2C%20ville%2C%20gazole_maj%2C%20gazole_prix%2C%20sp95_maj%2C%20sp95_prix%2C%20e85_maj%2C%20e85_prix%2C%20gplc_maj%2C%20gplc_prix%2C%20e10_maj%2C%20e10_prix%2C%20sp98_maj%2C%20sp98_prix
```