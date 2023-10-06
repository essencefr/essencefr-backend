/**
 * Main project file
 */

const logger = require('./logger');  // logging features + listener for uncaught exceptions and unhandled rejections
const config = require('config');
const express = require('express');
const app = express();

require('./startup/routes')(app);   // init the routes
require('./startup/db')();          // init the database connection
if (process.env.NODE_ENV == 'production') { require('./startup/prod')(app); }     // init the middlewares for production

// Listerner:
const server = app.listen(config.get('port'), () => { logger.info(`Listening on port ${config.get('port')}...`) });

module.exports = server;