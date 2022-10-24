import {format} from 'logform'
import winston from 'winston'
const { createLogger, transports } = winston

const LOG_LEVEL = process.env.LOG_LEVEL || 'DEBUG'
const LOG_DIR = process.env.LOG_DIR || 'log'
const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : null;

/**
 * Create a winston logger with console logging in dev, in prod everything is logged in an error file and combined file.
 * @type {winston.Logger}
 */
const logger = createLogger({
    level: LOG_LEVEL,
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({stack: true}),
        format.splat(),
        format.json()
    ),
    defaultMeta: {service: 'self-managed-discord'},
    transports: NODE_ENV !== 'production' ? [
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.simple()
                )
            })
        ]
        :
        [
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.simple()
                )
            }),
            new transports.File({ dirname: LOG_DIR, filename: 'self-managed-discord-error.log', level: 'ERROR'}),
            new transports.File({ dirname: LOG_DIR, filename: 'self-managed-discord-combined.log', level: LOG_LEVEL})
        ]
})
export default logger