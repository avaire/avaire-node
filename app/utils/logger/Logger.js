/** @ignore */
const path = require('path');
/** @ignore */
const Winston = require('winston');

/** @ignore */
var storage = path.resolve('storage', 'logs');

Winston.emitErrs = true;

/**
 * The Winston logger instance.
 *
 * @type {Winston}
 */
const Logger = new Winston.Logger({
    colors: {
        info: 'green',
        warn: 'yellow',
        error: 'red',
        debug: 'blue',
        silly: 'blue'
    },
    transports: [
        new (require('winston-daily-rotate-file'))({
            humanReadableUnhandledException: true,
            name: 'file:exceptions',
            filename: path.resolve(storage, 'exceptions'),
            datePattern: '-yyyy-MM-dd.log',
            level: 'exception',
            json: false
        }),
        new (require('winston-daily-rotate-file'))({
            name: 'file:error',
            filename: path.resolve(storage, 'error'),
            datePattern: '-yyyy-MM-dd.log',
            level: 'error',
            json: false
        }),
        new (require('winston-daily-rotate-file'))({
            name: 'file:console',
            filename: path.resolve(storage, 'console'),
            datePattern: '-yyyy-MM-dd.log',
            level: 'debug',
            json: false
        }),
        new (Winston.transports.Console)({
            humanReadableUnhandledException: true,
            level: 'verbose',
            colorize: true,
            json: false
        })
    ],
    exitOnError: true
});

module.exports = Logger;
