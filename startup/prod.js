/**
 * Here are managed all the middlewares we need for the production evironement
 */

const helmet = require('helmet');
const compression = require('compression');

module.exports = function(app) {
    app.use(helmet());
    app.use(compression());
};