/**
 * update endpoint for modifying the database
 */

const express = require('express');
const router = express.Router();
const { Station } = require('../models/station');
const { validateRequestParamsGetStation, validateRequestQueryGetStation } = require('../utils/validate');


///// GET methods //////

router.get('/:id', async (req, res) => {
    // validate params:
    const errorParams = validateRequestParamsGetStation(req.params).error;
    if (errorParams) return res.status(400).send(`Validation error: ${errorParams.details[0].message}`);
    // validate query:
    const errorQuery = validateRequestQueryGetStation(req.query).error;
    if (errorQuery) return res.status(400).send(`Validation error: ${errorQuery.details[0].message}`);
    // look for station:
    let station = null;
    if (req.query.history === 'true') {
        station = await Station.findById(req.params.id).select('+fuels.history').lean();
    } else {
        station = await Station.findById(req.params.id).lean();
    }
    if (!station) return res.status(404).send(`No station with id "${req.params.id}"`);
    // return found station:
    res.send(station);
});

module.exports = router;