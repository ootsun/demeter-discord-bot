import {format} from 'logform'
import winston from 'winston'

const {createLogger, transports} = winston

const LOG_LEVEL = process.env.LOG_LEVEL ? process.env.LOG_LEVEL.toLowerCase() : 'debug'
const LOG_DIR = process.env.LOG_DIR || 'log'
const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : null;

/**
 * Create a winston logger with console logging in dev and console and file logging in prod
 * @type {winston.Logger}
 */
const logger = createLogger({
    format: format.combine(
        format.timestamp({
            format: 'HH:mm:ss:SSS',
        }),
        format.errors({stack: true}),
        format.splat(),
        format.json(),
        format.colorize(),
        format.printf(
            (info) =>
                `${info.timestamp} [${info.level}] ${info.message}`
        )
    ),
    transports: NODE_ENV !== 'production' ?
        [new transports.Console({level: LOG_LEVEL})]
        :
        [
            new transports.Console(),
            new transports.File({dirname: LOG_DIR, filename: 'self-managed-discord-error.log', level: 'error'}),
            new transports.File({dirname: LOG_DIR, filename: 'self-managed-discord-combined.log', level: LOG_LEVEL})
        ]
})
export default logger