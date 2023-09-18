/**
 * Temp file for test purposes
 */

const express = require('express');
const router = express.Router();

// Get at '/' endpoint
router.get('/', async (req, res) => {
    res.send("Everything works fine");
});

module.exports = router;