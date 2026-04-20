/**
 * @module Logger
 * @description Centralized Winston logging configuration for the CrowdSense platform.
 * Supports environment-aware transports and structured JSON formatting.
 */

import winston from 'winston';

const { combine, timestamp, json, printf, colorize } = winston.format;

/**
 * Custom format for development (console) logging.
 */
const devFormat = printf(({ level, message, timestamp, requestId, service, ...metadata }) => {
  const rid = requestId ? ` [ReqID: ${requestId}]` : '';
  const svc = service ? ` [Svc: ${service}]` : '';
  const meta = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : '';
  return `${timestamp} [${level}]${rid}${svc}: ${message}${meta}`;
});

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Winston Logger Instance
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    isProduction ? json() : combine(colorize(), devFormat),
  ),
  defaultMeta: { service: 'crowdsense-api' },
  transports: [new winston.transports.Console()],
});

// Add file transports in production
if (isProduction) {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

/**
 * Middleware to inject requestId into logger context.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const loggerMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || 'N/A';
  req.logger = logger.child({ requestId });
  next();
};
