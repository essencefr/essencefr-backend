/**
 * temp update endpoint for launching the update process
 */

const fs = require('fs');
const config = require('config');
const logger = require('../logger');
const express = require('express');
const router = express.Router();
const { updateRoutine } = require('../services/update/routine');
const { formatLogToValidJSON } = require('../utils/format');

// temp log file used for API responses:
const logDirTemp = config.get('logDirTemp');
const logFileTemp = config.get('logFileTemp');

///// POST methods //////

router.post('/', async (req, res) => {
    try {
        // reset temp log file:
        fs.writeFile(logDirTemp + logFileTemp, '', err => {
            if (err) { console.error(err); }
        });
        await updateRoutine();
    } catch (err) {
        logger.error(err);
        res.status(500);
    } finally {
        res.send(formatLogToValidJSON("log/temp/logging.log"));
    }
});

module.exports = router;