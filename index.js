/**
 * Main project file
 */

const config = require('config');
const express = require('express');
const app = express();

require('./startup/logging')();     // init the logging features + listener for uncaught exceptions and unhandled rejections
require('./startup/routes')(app);   // init the routes
require('./startup/db')();          // init the database connection
require('./services/cache');           // init the cache
if (process.env.NODE_ENV == 'production') { require('./startup/prod')(app); }     // init the middlewares for production

// Listerner:
const server = app.listen(config.get('port'), () => { console.log(`Listening on port ${config.get('port')}...`) });

module.exports = server;