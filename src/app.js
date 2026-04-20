import path from 'path';
import { fileURLToPath } from 'url';

import 'dotenv/config';
import express from 'express';

import { SecurityMiddleware } from './middleware/index.js';
import { apiRoutes } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── GLOBAL MIDDLEWARE ──────────────────────────────────────────────
app.use(SecurityMiddleware.helmet);
app.use(SecurityMiddleware.globalRateLimit);
app.use(express.json({ limit: '1mb' }));

// Serve frontend assets from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API ROUTES ──────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── SPA FALLBACK ────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

export default app;
