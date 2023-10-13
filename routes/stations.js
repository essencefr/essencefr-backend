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
        station = await Station.findById(req.params.id).select('-fuels.history._id').lean();
    } else {
        station = await Station.findById(req.params.id).select('-fuels.history').lean();  // -> by default, do not return history path on query if not explicitly specified
    }
    if (!station) return res.status(404).send(`No station with id "${req.params.id}"`);

    // filter on fuelId:
    if (req.query.fuelId) {
        if (Array.isArray(req.query.fuelId)) {
            const supportedFuels = station.fuels.map(object => object._id);
            for (fuelId of req.query.fuelId) {
                if (!supportedFuels.includes(parseInt(fuelId))) {
                    return res.status(404).send(`No fuel with id "${fuelId}" for this station`);
                }
            };
            station.fuels = station.fuels.filter(fuel => req.query.fuelId.includes(String(fuel._id)));
        } else {
            station.fuels = station.fuels.filter(fuel => fuel._id == req.query.fuelId);
            if (station.fuels.length == 0) return res.status(404).send(`No fuel with id "${req.query.fuelId}" for this station`);
        }
    }
    // return found station:
    res.send(station);
});

module.exports = router;