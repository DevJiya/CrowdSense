import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

/**
 * Global Security Middleware
 */
export const SecurityMiddleware = {
    // Standard Headers
    helmet: helmet(),

    // Global Rate Limiter
    globalRateLimit: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: { error: 'Too many requests from this IP.' }
    }),

    // AI-Specific Rate Limiter
    aiRateLimit: rateLimit({
        windowMs: 2000,
        max: 1,
        message: { error: 'Tactical AI limit reached. Wait 2s.' }
    }),

    // Validation Handler
    validate(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }
        next();
    }
};

/**
 * AI Chat Input Sanitization
 */
export const AiChatValidator = [
    body('message').isString().trim().isLength({ min: 1, max: 500 }).escape(),
    body('venue').isString().trim().isLength({ min: 1, max: 100 }).escape(),
    body('sectors').isArray({ min: 1 }),
    body('sectors.*.name').isString(),
    body('sectors.*.density').isFloat(),
    SecurityMiddleware.validate
];
