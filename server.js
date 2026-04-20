import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Services
import { GeminiService } from './services/gemini.service.js';
import { CrowdAnalyticsService } from './services/crowd.service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────
// 🛡️ CONFIGURATION & MIDDLEWARE
// ─────────────────────────────────────────

app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["*", "data:"],
            connectSrc: ["'self'", "https://api.rss2json.com", "https://*.googleapis.com"],
            frameSrc: ["https://www.google.com", "https://maps.google.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(cors());
app.use(express.json({ limit: '512kb' }));

// ─────────────────────────────────────────
// ⚡ RATE LIMITERS
// ─────────────────────────────────────────

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    validate: { xForwardedForHeader: false },
});

const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    validate: { xForwardedForHeader: false },
});

app.use(globalLimiter);

// ─────────────────────────────────────────
// 🛣️ ROUTE HANDLERS
// ─────────────────────────────────────────

/**
 * Tactical AI Chat Route
 * Handles SSE streaming for real-time security assessments.
 */
app.post('/api/ai-chat', aiLimiter,
    [
        body('message').isString().trim().isLength({ min: 1, max: 500 }).escape(),
        body('venue').isString().trim().isLength({ min: 1, max: 100 }).escape(),
        body('density').isFloat({ min: 0, max: 100 }),
        body('mood').isIn(['CALM', 'TENSE', 'CHAOS']),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        // Delegate all logic to GeminiService
        await GeminiService.streamTacticalAssessment(req.body, res);
    }
);

/**
 * Bottleneck Prediction Route
 * Analyzes sector data to identify high-risk areas.
 */
app.post('/api/predict-bottleneck',
    [
        body('sectors').isArray({ min: 1, max: 20 }),
        body('sectors.*.name').isString().trim().isLength({ min: 1, max: 50 }).escape(),
        body('sectors.*.density').isFloat({ min: 0, max: 100 }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid sector data' });
        }

        // Delegate algorithm to CrowdAnalyticsService
        const report = CrowdAnalyticsService.predictBottlenecks(req.body.sectors);
        res.json(report);
    }
);

// ─────────────────────────────────────────
// 🏠 STATIC ASSETS & FALLBACK
// ─────────────────────────────────────────

app.use(express.static(path.join(__dirname)));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ─────────────────────────────────────────
// 🚀 SERVER INITIATION
// ─────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🛡️  CrowdSense Tactical Intelligence Layer Online`);
    console.log(`📡 Deployment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Engine: Gemini 2.5 Flash\n`);
});

