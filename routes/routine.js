/**
 * temp update endpoint for launching the update process
 */

const express = require('express');
const router = express.Router();
const { updateRoutine } = require('../services/update/routine');

///// POST methods //////

router.post('/', async (req, res) => {
    try {
        await updateRoutine();
        return res.send(`Update routine has been correctly performed.`);
    } catch (err) {
        res.status(500).send(`Something went wrong. Please consult log files.`);
        throw err;  // re-throw;
    }
});

module.exports = router;