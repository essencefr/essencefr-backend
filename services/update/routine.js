/**
 * Module with update routine
 */

const logger = require("../../logger");
const config = require('config');
const { CronJob } = require("cron");
const { convertStationsFormat } = require("../../utils/convert");
const { fetchStations } = require("../../utils/fetch");
const { executeAndLogPerformance } = require("../../utils/timer");
const { runInNewMongooseTransaction } = require("../../utils/transactions");
const { updateStationsCollection } = require("./collections/stations");
const { sendMail } = require("../../utils/email");
const { cleanFiles } = require("../../utils/files");
const cache = require("../cache");

// Cron job to automatically run the update function
const updateJob = new CronJob(
    (() => {
        if(process.env.NODE_ENV == 'test') {
            return '*/30 * * * * *';  // execute the job twice per minute when server is started in test mode
        } else {
            return '0 0 */2 * * *';  // execute job every two hour
        }
    })(),
    async () => {
        await updateRoutine();
    },
    null,   // callback to execute when cron job is stopeed (defualt value)
    false,  // only start the job when `.start()` is called (default value)
    'Europe/Paris'  // timezone to use to define execution time
);

/**
 * Takes stations raw data and save/update documents in the DB
 * @param {Array<Object>} stationRawObjectList raw data provided by the gov API
 * @param {number} bunchSize number of station objects to process together at the same time to increase performance
 * with bunchSize = 50
 *      -> total raw process time is ~ 3 min and very few transaction errors
 *      -> each process of a bunch of objects takes ~ 1 sec
 * with bunchSize = 100
 *      -> total raw process time is ~ 2 min 10 sec and very few transaction errors
 *      -> each process of a bunch of objects takes ~ 1.3 sec
 * with bunchSize = 200
 *      -> total raw process time is ~ 2 min and very few transaction errors
 *      -> each process of a bunch of objects takes ~ 2.4 sec
 * with bunchSize = 300
 *      -> total raw process time is ~ 2 min and very few transaction errors
 *      -> each process of a bunch of objects takes ~ 3.5 sec
 * with bunchSize = 500
 *      -> total raw process time is ~ 2 min and very few transaction errors
 *      -> each process of a bunch of objects takes ~ 5.7 sec
 */
async function processRawData(stationRawObjectList, bunchSize = 200) {
    let stationObjectList = null;
    await executeAndLogPerformance('generate station object list', 'silly', async () => {
        stationObjectList = convertStationsFormat(stationRawObjectList);
    });
    // do operations station by station to avoid too many mongoose transaction errors:
    for (let i = 0; i < stationObjectList.length; i += bunchSize) {
        const indexMax = (i + bunchSize < stationObjectList.length) ? i + bunchSize : stationObjectList.length - 1;
        await executeAndLogPerformance(`Processing object(s) ${i + 1} to ${indexMax + 1} over ${stationObjectList.length}`, 'info', async () => {
            try {
                await runInNewMongooseTransaction(async (session) => {
                    await updateStationsCollection(stationObjectList.slice(i, indexMax + 1), session);
                });
            } catch (error) {
                error.message = 'Process raw data > ' + error.message;  // update error message
                logger.error(error);  // do not re-throw error, just log it and process the next bunch ob objects
                // throw error;  // re-throw
            };
        })
    }
};

/**
 * Main update routine function.
 * So far it only updates one zone (development version)
 */
async function updateRoutine() {
    await executeAndLogPerformance('Update routine', 'info', async () => {        
        let flagSuccess = true;
        try {
            cleanFiles(config.get('logDirCurrent'));  // reset current log files
            const rawData = await fetchStations();
            cache.clearKnownStationIds();  // clean cache to ensure correct filtering
            await executeAndLogPerformance('Process raw data', 'info', async () => {
                if(process.env.NODE_ENV == 'test') {
                    await processRawData(rawData.slice(0, 20));  // only consider a subset of fetched stations when testing
                } else {
                    await processRawData(rawData);
                }
            });
        } catch (err) {
            logger.error(err);
            flagSuccess = false;
        }
        // send email:
        const logDirCurrent = config.get('logDirCurrent');
        const mailOptions = {
            from: `essencefr-backend <${config.get('gitEmailAddr')}>`, // sender address
            to: config.get('essencefrEmailAddr'), // receiver email
            subject: `Update Routine ${flagSuccess ? 'Success' : 'Failure'}`, // Subject line
            text: "Update routine done. Consult logs for more details.",
            attachments: [  // only non-empty files will be really sent
                { filename: 'combined.log', path: `${logDirCurrent}combined.log` },
                { filename: 'error.log', path: `${logDirCurrent}error.log` },
                { filename: 'exceptions.log', path: `${logDirCurrent}exceptions.log` },
                { filename: 'rejections.log', path: `${logDirCurrent}rejections.log` }
            ]
        }
        sendMail(mailOptions, (info) => {
            console.log("Email sent successfully");
            console.log("MESSAGE ID: ", info.messageId);
        });
    });
}

module.exports.processRawData = async (stationRawObjectList, bunchSize = 200) => { await executeAndLogPerformance('Process raw data', 'info', async () => { await processRawData(stationRawObjectList, bunchSize) }) };
module.exports.updateRoutine = async () => { await executeAndLogPerformance('Update routine', 'info', async () => { await updateRoutine() }) };
module.exports.updateJob = updateJob;