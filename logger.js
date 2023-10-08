/**
 * Logger module
 */

const config = require('config');
const winston = require('winston');

const logDir = config.get('logDir');
const logDirTemp = config.get('logDirTemp');
const logFileTemp = config.get('logFileTemp');  // temp log file used for API responses

// reset temp log file:
const fs = require('fs');
fs.writeFileSync(logDirTemp + logFileTemp, '', err => {
    if (err) { console.error(err); }
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: logDirTemp + logFileTemp }),
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
            winston.format.errors({ stack: true }),
            winston.format.printf((info) => {
                let text = `[${info.timestamp}] ${info.level}: ${info.message}`;
                if (info.elapsedTimeInMs) { text = `${(text + ' ').padEnd(100, '.')} ${info.elapsedTimeInMs} ms`; }
                if (info.stack) { text += `\n${info.stack}`; }
                return text;
            })
        ),
        handleExceptions: true,
        handleRejections: true,
        level: 'silly'
    }));
}

module.exports = logger;