import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { SecurityMiddleware } from './middleware/security.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── GLOBAL MIDDLEWARE ──────────────────────────────────────────────
app.use(SecurityMiddleware.helmet);
app.use(SecurityMiddleware.globalRateLimit);
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

// ─── API ROUTES ──────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── SPA FALLBACK ────────────────────────────────────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── STARTUP ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
    🚀 CrowdSense AI — Tactical Intel Grid Active
    🛡️  Security: Hardened (Helmet + Rate Limits)
    🛰️  Nodes: Online
    🌐  Endpoint: http://localhost:${PORT}
    `);
});

export default app;
