/**
 * temp update endpoint for launching the update process
 */

const fs = require('fs');
const logger = require('../logger');
const express = require('express');
const router = express.Router();
const { updateRoutine } = require('../services/update/routine');
const { formatLogToValidJSON } = require('../utils/format');

///// POST methods //////

router.post('/', async (req, res) => {
    try {
        fs.unlink(logDirTemp + logFileTemp); // remove temp log file if it already exists
        await updateRoutine();
    } catch (err) {
        logger.error(err);
        res.status(500);
    } finally {
        res.send(formatLogToValidJSON("log/temp/logging.log"));
    }
});

module.exports = router;