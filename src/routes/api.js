import express from 'express';
import multer from 'multer';

import { AiController } from '../controllers/index.js';
import { AiChatValidator, SecurityMiddleware } from '../middleware/index.js';
import { GoogleServices } from '../services/index.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Auth Middleware (Mocked for Demo)
 */
const authenticate = (req, res, next) => {
  // In production, verify Firebase ID Token
  next();
};

// ─── TACTICAL AI ENDPOINTS ──────────────────────────────────────────
router.post('/ai-chat', SecurityMiddleware.aiRateLimit, AiChatValidator, AiController.handleChat);

// ─── ANALYTICS ENDPOINTS ─────────────────────────────────────────────
router.post('/analytics', SecurityMiddleware.globalRateLimit, authenticate, async (req, res) => {
  const { event, metadata } = req.body;
  await GoogleServices.logEvent(event, metadata);
  return res.json({ status: 'logged' });
});

// ─── TELEMETRY ENDPOINTS ─────────────────────────────────────────────
router.post(
  '/telemetry/sync',
  SecurityMiddleware.globalRateLimit,
  authenticate,
  async (req, res) => {
    const { stadiumId, data } = req.body;
    await GoogleServices.updateTelemetry(stadiumId, data);
    return res.json({ status: 'synced' });
  },
);

// ─── STORAGE ENDPOINTS ───────────────────────────────────────────────
router.post(
  '/upload',
  SecurityMiddleware.globalRateLimit,
  authenticate,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file' });
    }
    try {
      const url = await GoogleServices.uploadFile(
        req.file.buffer,
        `uploads/${Date.now()}-${req.file.originalname}`,
      );
      return res.json({ url });
    } catch {
      return res.status(500).json({ error: 'Upload failed' });
    }
  },
);

export default router;
