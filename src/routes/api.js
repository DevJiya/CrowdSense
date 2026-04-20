/**
 * @module ApiRoutes
 * @description Centralized routing for all CrowdSense API endpoints.
 * Includes tactical AI chat, analytics logging, telemetry synchronization, and file uploads.
 * @requires express
 * @requires multer
 * @requires AiController
 * @requires SecurityMiddleware
 * @requires GoogleServices
 */

import express from 'express';
import multer from 'multer';

import { AiController } from '../controllers/index.js';
import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/ErrorCodes.js';
import { AuthMiddleware, SecurityMiddleware } from '../middleware/index.js';
import { GoogleServices } from '../services/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiSchemas } from '../validators/api.validator.js';
import { validate } from '../validators/validate.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api
 * Health check endpoint.
 */
router.get('/', (req, res) => res.json({ status: 'ok', version: '2.0.0' }));

// ─── TACTICAL AI ENDPOINTS ──────────────────────────────────────────
/**
 * POST /api/ai-chat
 * Handles tactical AI narrations with rate limiting and input validation.
 */
router.post(
  '/ai-chat',
  SecurityMiddleware.aiRateLimit,
  validate(ApiSchemas.aiChat),
  AiController.handleChat,
);

// ─── ANALYTICS ENDPOINTS ─────────────────────────────────────────────
/**
 * POST /api/analytics
 * Logs general analytics events to the cloud.
 */
router.post(
  '/analytics',
  SecurityMiddleware.globalRateLimit,
  AuthMiddleware.requireAuth,
  validate(ApiSchemas.analytics),
  asyncHandler(async (httpRequest, httpResponse) => {
    const { analyticsEventName, metadata } = httpRequest.body;
    await GoogleServices.logEvent(analyticsEventName, metadata);
    return httpResponse.json({ status: 'logged' });
  }),
);

// ─── TELEMETRY ENDPOINTS ─────────────────────────────────────────────
/**
 * POST /api/telemetry/sync
 * Synchronizes real-time sensor telemetry with the RTDB.
 */
router.post(
  '/telemetry/sync',
  SecurityMiddleware.globalRateLimit,
  AuthMiddleware.requireAuth,
  validate(ApiSchemas.telemetry),
  asyncHandler(async (httpRequest, httpResponse) => {
    const { stadiumId, telemetryPayload } = httpRequest.body;
    await GoogleServices.updateTelemetry(stadiumId, telemetryPayload);
    return httpResponse.json({ status: 'synced' });
  }),
);

// ─── STORAGE ENDPOINTS ───────────────────────────────────────────────
/**
 * POST /api/upload
 * Uploads media files (e.g., incident photos) to Google Cloud Storage.
 */
router.post(
  '/upload',
  SecurityMiddleware.globalRateLimit,
  AuthMiddleware.requireAuth,
  upload.single('file'),
  asyncHandler(async (httpRequest, httpResponse) => {
    if (!httpRequest.file) {
      throw new AppError('No file uploaded', 400, ErrorCodes.VALIDATION_ERROR);
    }

    const uploadedFileUrl = await GoogleServices.uploadFile(
      httpRequest.file.buffer,
      `uploads/${Date.now()}-${httpRequest.file.originalname}`,
    );
    return httpResponse.json({ url: uploadedFileUrl });
  }),
);

export default router;
