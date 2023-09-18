/**
 * Code called to update values in the database
 */

/**
 * Function that retrieves the stations and gas prices 10km around a given location.
 * Calls API from https://swagger.2aaz.fr/
 * Data issues from https://www.prix-carburants.gouv.fr/rubrique/opendata/
 * @param {*} longitude 
 * @param {*} latitude 
 * @returns 
 */
async function fetchStations(longitude, latitude) {
    let response = await fetch(`https://api.prix-carburants.2aaz.fr/stations/around/${longitude},${latitude}?responseFields=Fuels`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Range": "m=0-9999"  // distance around the point (max 10000 (10km))
        }
    });
    let data = await response.json();
    return data;
};

