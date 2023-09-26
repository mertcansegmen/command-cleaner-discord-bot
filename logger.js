const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;
require('dotenv').config();

const errorFilter = format((info, opts) => {
  return info.level === 'error' ? info : false;
});

const infoFilter = format((info, opts) => {
  return info.level === 'info' ? info : false;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), json()),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: process.env.ERROR_LOG_PATH || '.logs\\app-error.log',
      level: 'error',
      format: combine(errorFilter(), timestamp(), json()),
    }),
    new transports.File({
      filename: process.env.INFO_LOG_PATH || '.logs\\app-info.log',
      level: 'info',
      format: combine(infoFilter(), timestamp(), json()),
    }),
  ],
});

logger.info('Created the logger.');

module.exports = logger;
