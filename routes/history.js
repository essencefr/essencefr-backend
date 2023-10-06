/**
 * update endpoint for modifying the database
 */

const express = require('express');
const router = express.Router();
const { History, validateRequestParams } = require('../models/history');


///// GET methods //////

router.get('/:id', async (req, res) => {
    // validate `id` param:
    const {error} = validateRequestParams(req.params);
    if(error) return res.status(400).send(`Validation error: ${error.details[0].message}`);
    // look for history:
    const history = await History.findById(req.params.id).lean();
    if(!history) return res.status(404).send(`No history with id "${req.params.id}"`);
    // return found history:
    res.send(history);
});

module.exports = router;