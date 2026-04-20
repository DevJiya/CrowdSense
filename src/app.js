/**
 * @module App
 * @description Core Express application configuration. Sets up global middleware,
 * static asset serving, API routing, and SPA fallback logic.
 * @requires path
 * @requires url
 * @requires express
 * @requires SecurityMiddleware
 * @requires apiRoutes
 */

import path from 'path';
import { fileURLToPath } from 'url';

import 'dotenv/config';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { logger } from './config/logger.js';
import { errorHandler } from './errors/errorHandler.middleware.js';
import { SecurityMiddleware } from './middleware/index.js';
import { apiRoutes } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── PRODUCTION HARDENING ───────────────────────────────────────────
app.use(helmet()); // Basic security headers
app.use(compression()); // Gzip compression
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // HTTP logging

// ─── PROCESS HANDLERS ───────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error('[FATAL] Unhandled Rejection:', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('[FATAL] Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

// ─── GLOBAL MIDDLEWARE ──────────────────────────────────────────────
app.use(SecurityMiddleware.globalRateLimit);
app.use(express.json({ limit: '1mb' }));

// Serve frontend assets from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API ROUTES ──────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── SPA FALLBACK ────────────────────────────────────────────────────
/**
 * SPA Fallback route.
 * @param {Object} httpRequest - Express request object.
 * @param {Object} httpResponse - Express response object.
 */
app.get('*', (httpRequest, httpResponse) => {
  httpResponse.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── ERROR HANDLING ──────────────────────────────────────────────────
app.use(errorHandler);

export default app;
