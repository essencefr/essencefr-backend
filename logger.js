/**
 * Logger module
 */

const config = require('config');
const winston = require('winston');

const logDir = config.get('logDir');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: logDir + 'error.log', level: 'error' }),  // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({ filename: logDir + 'combined.log' }),  // Write all logs with importance level of `info` or less to `combined.log`
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: logDir + 'exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: logDir + 'rejections.log' })
    ]
});

//
// If we're not in production then log to the `console` with custom format:
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.timestamp({
                format: 'DD-MM-YYYY HH:mm:ss.SSS',
            }),
            winston.format.align(),
            winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
        ),
        handleExceptions: true,
        handleRejections: true
    }));
}

module.exports = logger;