/**
 * Main project file
 */

const config = require('config');
const express = require ('express');
const app = express();

// Routes:
const test = require('./routes/test');
app.use(express.json());        // -> piece of middleware need to allow to pass data into request body (needed for POST and PUT requests)
app.use('/api/test', test);     // -> links api endpoint '/api/test' to module defined in 'test.js'

// Listerner:
const server = app.listen(config.get('port'), () => { console.log(`Listening on port ${config.get('port')}...`) });

module.exports = server;