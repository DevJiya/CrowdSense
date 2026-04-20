/**
 * @module SecurityMiddleware
 * @description Suite of security-focused middleware, including standard HTTP headers,
 * rate limiting, and request validation logic.
 * @requires helmet
 * @requires express-rate-limit
 * @requires express-validator
 */

import rateLimit from 'express-rate-limit';
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
    max: process.env.NODE_ENV === 'test' ? 1000 : 100,
    message: { error: 'Too many requests from this IP.' },
  }),

  /**
   * AI-Specific Rate Limiter to throttle tactical AI narrations.
   * Allows 1 request every 2 seconds per IP.
   */
  aiRateLimit: rateLimit({
    windowMs: 2000,
    max: process.env.NODE_ENV === 'test' ? 1000 : 1,
    message: { error: 'Tactical AI limit reached. Wait 2s.' },
  }),
};
