/**
 * Functions fetching data on others servers APIs
 */

const { executeAndLogPerformance } = require('./timer');

/**
 * Function that retrieves the fuel prices for all known stations in France (can take up to 5 sec).
 * More details at https://data.economie.gouv.fr/explore/dataset/prix-des-carburants-en-france-flux-instantane-v2/information/
 * @returns list of stations data in JSON format such as defined by the government API
 */
async function fetchStations() {
    let response = await fetch(`https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/exports/json?limit=-1&timezone=Europe%2FParis&select=id%2C%20latitude%2C%20longitude%2C%20cp%2C%20adresse%2C%20ville%2C%20gazole_maj%2C%20gazole_prix%2C%20sp95_maj%2C%20sp95_prix%2C%20e85_maj%2C%20e85_prix%2C%20gplc_maj%2C%20gplc_prix%2C%20e10_maj%2C%20e10_prix%2C%20sp98_maj%2C%20sp98_prix`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    let data = await response.json();
    return data;
};

module.exports.fetchStations = async () => { return await executeAndLogPerformance('Fetch stations data', 'info', async () => { return await fetchStations() }) };