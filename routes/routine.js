/**
 * temp update endpoint for launching the update process
 */

const fs = require('fs');
const logger = require('../logger');
const express = require('express');
const router = express.Router();
const { updateRoutine } = require('../services/update/routine');

///// POST methods //////

router.post('/', async (req, res) => {
    try {
        // reset temp log file:
        fs.writeFile(logDirTemp + logFileTemp, '', err => {
            if (err) { console.error(err); }
        });
        await updateRoutine();
        res.send('Update routine success');
    } catch (err) {
        logger.error(err);
        res.status(500).send(err);
    }
});

module.exports = router;