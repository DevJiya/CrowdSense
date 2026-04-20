/**
 * @module SecurityMiddleware
 * @description Suite of security-focused middleware, including standard HTTP headers,
 * rate limiting, and request validation logic.
 * @requires helmet
 * @requires express-rate-limit
 * @requires express-validator
 */

import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';

/**
 * Global Security Middleware configuration object.
 */
export const SecurityMiddleware = {
  /** Standard security headers provided by Helmet. */
  helmet: helmet(),

  /**
   * Global Rate Limiter to prevent brute-force and DDoS attacks.
   * Allows 100 requests every 15 minutes per IP.
   */
  globalRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP.' },
  }),

  /**
   * AI-Specific Rate Limiter to throttle tactical AI narrations.
   * Allows 1 request every 2 seconds per IP.
   */
  aiRateLimit: rateLimit({
    windowMs: 2000,
    max: 1,
    message: { error: 'Tactical AI limit reached. Wait 2s.' },
  }),

  /**
   * Generic Validation Handler that processes express-validator results.
   * @param {Object} httpRequest - Express request object.
   * @param {Object} httpResponse - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Object|void}
   */
  validate(httpRequest, httpResponse, next) {
    const validationErrors = validationResult(httpRequest);
    if (!validationErrors.isEmpty()) {
      return httpResponse.status(400).json({
        error: 'Validation failed',
        details: validationErrors.array(),
      });
    }
    return next();
  },
};

/**
 * AI Chat Input Sanitization and Validation Schema.
 * Ensures the 'message', 'venue', and 'sectors' are present and correctly formatted.
 */
export const AiChatValidator = [
  body('message').isString().trim().isLength({ min: 1, max: 500 }).escape(),
  body('venue').isString().trim().isLength({ min: 1, max: 100 }).escape(),
  body('sectors').isArray({ min: 1 }),
  body('sectors.*.name').isString(),
  body('sectors.*.density').isFloat(),
  SecurityMiddleware.validate,
];
