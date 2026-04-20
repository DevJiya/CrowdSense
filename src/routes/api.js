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
import { AiChatValidator, SecurityMiddleware } from '../middleware/index.js';
import { GoogleServices } from '../services/index.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Auth Middleware (Mocked for Demo).
 * @param {Object} httpRequest - Express request object.
 * @param {Object} httpResponse - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticate = (httpRequest, httpResponse, next) => {
  // In production, verify Firebase ID Token
  next();
};

// ─── TACTICAL AI ENDPOINTS ──────────────────────────────────────────
/**
 * POST /api/ai-chat
 * Handles tactical AI narrations with rate limiting and input validation.
 */
router.post('/ai-chat', SecurityMiddleware.aiRateLimit, AiChatValidator, AiController.handleChat);

// ─── ANALYTICS ENDPOINTS ─────────────────────────────────────────────
/**
 * POST /api/analytics
 * Logs general analytics events to the cloud.
 */
router.post(
  '/analytics',
  SecurityMiddleware.globalRateLimit,
  authenticate,
  async (httpRequest, httpResponse) => {
    const { analyticsEventName, metadata } = httpRequest.body;
    await GoogleServices.logEvent(analyticsEventName, metadata);
    return httpResponse.json({ status: 'logged' });
  },
);

// ─── TELEMETRY ENDPOINTS ─────────────────────────────────────────────
/**
 * POST /api/telemetry/sync
 * Synchronizes real-time sensor telemetry with the RTDB.
 */
router.post(
  '/telemetry/sync',
  SecurityMiddleware.globalRateLimit,
  authenticate,
  async (httpRequest, httpResponse) => {
    const { stadiumId, telemetryPayload } = httpRequest.body;
    await GoogleServices.updateTelemetry(stadiumId, telemetryPayload);
    return httpResponse.json({ status: 'synced' });
  },
);

// ─── STORAGE ENDPOINTS ───────────────────────────────────────────────
/**
 * POST /api/upload
 * Uploads media files (e.g., incident photos) to Google Cloud Storage.
 */
router.post(
  '/upload',
  SecurityMiddleware.globalRateLimit,
  authenticate,
  upload.single('file'),
  async (httpRequest, httpResponse) => {
    if (!httpRequest.file) {
      return httpResponse.status(400).json({ error: 'No file' });
    }
    try {
      const uploadedFileUrl = await GoogleServices.uploadFile(
        httpRequest.file.buffer,
        `uploads/${Date.now()}-${httpRequest.file.originalname}`,
      );
      return httpResponse.json({ url: uploadedFileUrl });
    } catch {
      return httpResponse.status(500).json({ error: 'Upload failed' });
    }
  },
);

export default router;
