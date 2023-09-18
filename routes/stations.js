/**
 * update endpoint for modifying the database
 */

const express = require('express');
const router = express.Router();
const { Station, validateRequestParams } = require('../models/station');


///// GET methods //////

router.get('/:id', async (req, res) => {
    // validate `id` param:
    const {error} = validateRequestParams(req.params);
    if(error) return res.status(400).send(`Validation error: ${error.details[0].message}`);
    // look for station:
    const station = await Station.findById(req.params.id);
    if(!station) return res.status(404).send(`No station with id "${req.params.id}"`);
    // return found station:
    res.send(station);
});

module.exports = router;