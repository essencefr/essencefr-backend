/**
 * Module for setting up routes and other middlewares
 */

const express = require ('express');
const test = require('../routes/test');

module.exports = function(app) {
    app.use(express.json());        // -> piece of middleware need to allow to pass data into request body (needed for POST and PUT requests)
    app.use('/api/test', test);     // -> links api endpoint '/api/test' to module defined in 'test.js'
};