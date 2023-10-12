/**
 * Logger module
 */

const config = require('config');
const fs = require('fs');
const winston = require('winston');
require('winston-daily-rotate-file');
const { cleanFiles } = require('./utils/files');

const logDir = config.get('logDir');
const logDirArchive = config.get('logDirArchive');
const logDirCurrent = config.get('logDirCurrent');

// create folders if they do not exist yet
if (!fs.existsSync(logDir)) { fs.mkdirSync(logDir) }
if (!fs.existsSync(logDirCurrent)) { fs.mkdirSync(logDirCurrent) }
if (!fs.existsSync(logDirArchive)) { fs.mkdirSync(logDirArchive) }
// reset current log files:
cleanFiles(logDirCurrent);

const datePatternForRotate = 'YYYY-MM-DD';  // rotate every day

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Transports for current logs:
        new winston.transports.File({ filename: logDirCurrent + 'error.log', level: 'error' }),  // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({ filename: logDirCurrent + 'combined.log' }),  // Write all logs with importance level of `info` or less to `combined.log`
        // Transports for rotated logs:
        new winston.transports.DailyRotateFile({
            filename: logDirArchive + '%DATE%_error.log',
            level: 'error',
            datePattern: datePatternForRotate,
            maxSize: '20m',
            maxFiles: '14d'
        }),
        new winston.transports.DailyRotateFile({
            filename: logDirArchive + '%DATE%_combined.log',
            level: 'info',
            datePattern: datePatternForRotate,
            maxSize: '20m',
            maxFiles: '14d'
        }),
    ],
    exceptionHandlers: [
        // Transport for current logs:
        new winston.transports.File({ filename: logDirCurrent + 'exceptions.log' }),
        // Transport for rotated logs:
        new winston.transports.DailyRotateFile({
            filename: logDirArchive + '%DATE%_exceptions.log',
            datePattern: datePatternForRotate,
            maxSize: '20m',
            maxFiles: '14d'
        }),
    ],
    rejectionHandlers: [
        // Transport for current logs:
        new winston.transports.File({ filename: logDirCurrent + 'rejections.log' }),
        // Transport for rotated logs:
        new winston.transports.DailyRotateFile({
            filename: logDirArchive + '%DATE%_rejections.log',
            datePattern: datePatternForRotate,
            maxSize: '20m',
            maxFiles: '14d'
        }),
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