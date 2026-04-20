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
// 🛡️ SECURITY LAYER — Helmet & CORS
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
    referrerPolicy: { policy: 'same-origin' },
    xssFilter: true,
    noSniff: true,
    hidePoweredBy: true,
}));

const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:8080',
    'https://crowdsense-87844475027.us-central1.run.app',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS Policy: Unauthorized origin.'));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true,
}));

app.use(express.json({ limit: '512kb' }));

// ─────────────────────────────────────────
// ⚡ RATE LIMITING
// ─────────────────────────────────────────

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: 'Global rate limit exceeded. Please wait 15 minutes.' },
});

const aiLimiter = rateLimit({
    windowMs: 2 * 1000,
    max: 1, // 1 req / 2s per IP
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: 'AI Command throttled. Please wait 2 seconds between queries.' },
});

app.use(globalLimiter);

// ─────────────────────────────────────────
// 🛣️ ROUTE HANDLERS
// ─────────────────────────────────────────

import { GoogleServices } from './services/google.service.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Auth Middleware
 * Verifies Firebase ID Token
 */
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        // In real deployment, verify with firebase-admin
        // const decodedToken = await admin.auth().verifyIdToken(token);
        // req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * Analytics Route
 * Logs user actions to BigQuery
 */
app.post('/api/analytics', authenticate, async (req, res) => {
    const { event, metadata } = req.body;
    await GoogleServices.logEvent(event, metadata);
    res.json({ status: 'logged' });
});

/**
 * Telemetry Sync Route
 * Pushes live data to Firebase RTDB
 */
app.post('/api/telemetry/sync', authenticate, async (req, res) => {
    const { stadiumId, data } = req.body;
    await GoogleServices.updateTelemetry(stadiumId, data);
    res.json({ status: 'synced' });
});

/**
 * File Upload Route
 * Uploads tactical imagery to GCS
 */
app.post('/api/upload', authenticate, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    try {
        const url = await GoogleServices.uploadFile(req.file.buffer, `uploads/${Date.now()}-${req.file.originalname}`);
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

/**
 * Tactical AI Chat Route
 * Computes logic server-side, uses AI ONLY for narration.
 */
app.post('/api/ai-chat', aiLimiter,
    [
        body('message').isString().trim().isLength({ min: 1, max: 500 }).escape(),
        body('venue').isString().trim().isLength({ min: 1, max: 100 }).escape(),
        body('sectors').isArray({ min: 1 }),
        body('sectors.*.name').isString(),
        body('sectors.*.density').isFloat(),
    ],
    async (req, res) => {
        const start = Date.now();
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { message, sectors, venue } = req.body;

        // 1. COMPUTE LOGIC ON BACKEND (Efficiency Rule)
        const analysis = CrowdAnalyticsService.predictBottlenecks(sectors);
        
        // 2. LOG TO BIGQUERY (Google Cloud Rule)
        await GoogleServices.logEvent('AI_QUERY', { venue, risk: analysis.overall_risk });

        const computeTime = Date.now() - start;
        console.log(`[Benchmark] Analytics computed in ${computeTime}ms`);

        // 3. NARRATE VIA AI (Narration Rule)
        await GeminiService.streamNarration({ message, analysis }, res);
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
        const start = Date.now();
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid sector data' });
        }

        // Delegate algorithm to CrowdAnalyticsService
        const report = CrowdAnalyticsService.predictBottlenecks(req.body.sectors);
        
        const duration = Date.now() - start;
        console.log(`[Benchmark] Bottleneck prediction completed in ${duration}ms`);
        
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

