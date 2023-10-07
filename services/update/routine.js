/**
 * Module with update routine
 */

const { fetchStations } = require("../../utils/fetch");
const { executeAndLogPerformance } = require("../../utils/timer");
const { processRawData } = require("./collections/all");

/**
 * Update the DB with data fetched from the government API for a given zone.
 * A zone is a 10 km circle defined by its center coordinates (latitude and longitude)
 * @param {Number} latitude 
 * @param {Number} longitude 
 */
async function updateRoutineZone(latitude, longitude) {
    const rawData = await fetchStations(latitude, longitude);
    await processRawData(rawData);
}

/**
 * Main update routine function.
 * So far it only updates one zone (development version)
 */
async function updateRoutine() {
    // Pessac coordinates:
    const latitude = 44.806;
    const longitude = -0.631;
    await executeAndLogPerformance('Update routine zone', 'info', async () => { await updateRoutineZone(latitude, longitude) });
}

module.exports.updateRoutineZone = async (latitude, longitude) => { await executeAndLogPerformance('Update routine zone', 'info', async () => { await updateRoutineZone(latitude, longitude) }) };
module.exports.updateRoutine = async () => { await executeAndLogPerformance('Update routine', 'info', async () => { await updateRoutine() }) };