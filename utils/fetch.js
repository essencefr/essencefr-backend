/**
 * Functions fetching data on others servers APIs
 */

const https = require('https');
const { executeAndLogPerformance } = require('./timer');

/**
 * Function that retrieves the stations and gas prices 10km around a given location.
 * Calls API from https://swagger.2aaz.fr/
 * Data issues from https://www.prix-carburants.gouv.fr/rubrique/opendata/
 * @param {Number} latitude 
 * @param {Number} longitude 
 * @returns list of stations data in JSON format such as defined bu the government API
 */
async function fetchStations(latitude, longitude) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;  // /!\ Note this should NOT be kept, this is a temporary fix because 'api.prix-carburants.2aaz.fr' has not renewed its certificate
    let response = await fetch(`https://api.prix-carburants.2aaz.fr/stations/around/${latitude},${longitude}?responseFields=FuelsPrices`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Range": "m=0-9999"  // distance around the point (max 10000 (10km))
        },
        agent: new https.Agent({
            rejectUnauthorized: false,
        })
    });
    let data = await response.json();
    return data;
};

module.exports.fetchStations = async (latitude, longitude) => { return await executeAndLogPerformance('Fetch stations data', 'info', async () => { return await fetchStations(latitude, longitude) }) };