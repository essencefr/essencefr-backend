/**
 * Module for setting up routes and other middlewares
 */

const express = require ('express');
const temp = require('../routes/temp');
const stations = require('../routes/stations');

module.exports = function(app) {
    app.use(express.json());        // -> piece of middleware need to allow to pass data into request body (needed for POST and PUT requests)
    app.use('/api/temp', temp);     // -> links api endpoint '/api/temp' to module defined in 'temp.js'
    app.use('/api/stations', stations);
};