/**
 * Main project file
 */

const config = require('config');
const express = require ('express');
const app = express();

require('./startup/routes')(app);   // init the routes
require('./startup/db')();          // init the database connection

// Listerner:
const server = app.listen(config.get('port'), () => { console.log(`Listening on port ${config.get('port')}...`) });

module.exports = server;