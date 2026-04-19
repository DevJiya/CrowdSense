/**
 * CrowdSense AI — Secure Backend Server
 * =======================================
 * Production-grade Express server powering the Gemini 2.5 Flash AI intelligence layer.
 * Implements: Helmet CSP, Rate Limiting, Input Validation, CORS, SSE Streaming.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────
// 🛡️ SECURITY LAYER — Helmet CSP
// ─────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Required for Tailwind CDN
                "https://cdn.tailwindcss.com",
                "https://unpkg.com",
            ],
            scriptSrcAttr: ["'unsafe-inline'"], // Fixes blocked onclick events
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["*", "data:"], // Fixes blocked Pixabay background
            connectSrc: [
                "'self'",
                "https://api.rss2json.com",
                "https://*.googleapis.com",
                "https://*.firebaseio.com",
                "https://*.firebaseapp.com"
            ],
            frameSrc: ["https://www.google.com", "https://maps.google.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false, // Required for Google Maps embed
}));

// ─────────────────────────────────────────
// 🌐 CORS — Restricted to known origins
// ─────────────────────────────────────────
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
            callback(new Error(`CORS Policy: Origin '${origin}' is not permitted.`));
        }
    },
    methods: ['GET', 'POST'],
}));

// ─────────────────────────────────────────
// ⚡ RATE LIMITING — Prevent API abuse
// ─────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait before retrying.' },
});

const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 15, // Max 15 AI queries per minute
    message: { error: 'AI query rate limit reached. Please wait.' },
});

app.use(globalLimiter);
app.use(express.json({ limit: '512kb' })); // Reject oversized payloads

// ─────────────────────────────────────────
// 🤖 GEMINI 2.5 FLASH AI ENGINE
// ─────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-04-17',
    systemInstruction: `You are CrowdSense AI, an expert real-time tactical intelligence analyst for stadium crowd management and public safety.
Your role is to provide concise, actionable, and highly precise insights to security teams. You analyze crowd density data, news sentiment, and risk indicators.
You must:
- Always respond in structured, short paragraphs.
- Highlight critical risks in CAPITALS.
- Provide specific, actionable recommendations.
- Format evacuation advice clearly.
- Never speculate beyond the data provided.
You are deployed in a live command center. Lives depend on your accuracy. Be direct, professional, and decisive.`
});

/**
 * POST /api/ai-chat
 * Accepts a venue context and user message, streams Gemini 2.5 response via SSE.
 * 
 * Body: { message: string, venue: string, density: number, mood: string }
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
            return res.status(400).json({ error: 'Invalid input.', details: errors.array() });
        }

        const { message, venue, density, mood } = req.body;

        // Set SSE headers for real-time streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const contextualPrompt = `
VENUE CONTEXT (Real-Time Data Feed):
- Venue: ${venue}
- Current Crowd Density: ${density}%
- System Mood Alert: ${mood}

OPERATOR QUERY: ${message}

Provide a tactical assessment and direct response.`;

        try {
            const stream = await model.generateContentStream(contextualPrompt);
            for await (const chunk of stream.stream) {
                const text = chunk.text();
                if (text) {
                    res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
            }
            res.write(`data: [DONE]\n\n`);
            res.end();
        } catch (error) {
            console.error('[Gemini Error]', error.message);
            res.write(`data: ${JSON.stringify({ error: 'AI engine temporarily unavailable.' })}\n\n`);
            res.end();
        }
    }
);

/**
 * POST /api/predict-bottleneck
 * Pure server-side chaos prediction with validated inputs.
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
            return res.status(400).json({ error: 'Invalid sector data.' });
        }

        const { sectors } = req.body;
        const bottlenecks = sectors
            .filter(s => s.density > 65)
            .sort((a, b) => b.density - a.density)
            .map(s => ({
                sector: s.name,
                risk_score: Math.min(100, Math.round(s.density * 1.1)),
                eta_to_critical: Math.max(1, Math.round((100 - s.density) / 5)),
                recommendation: s.density > 85
                    ? 'IMMEDIATE EVACUATION REQUIRED'
                    : 'Monitor closely. Redirect foot traffic.',
            }));

        const safestSector = sectors.reduce((a, b) => a.density < b.density ? a : b);

        res.json({
            bottlenecks,
            evacuation_route: safestSector.name,
            overall_risk: bottlenecks.length > 0 ? 'HIGH' : 'NOMINAL',
        });
    }
);

// ─────────────────────────────────────────
// 🏠 Serve static frontend files
// ─────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ─────────────────────────────────────────
// 🚀 Launch Server
// ─────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🛡️  CrowdSense AI Backend Running`);
    console.log(`📡 Listening on: http://localhost:${PORT}`);
    console.log(`🤖 Gemini 2.5 Flash: ${process.env.GEMINI_API_KEY ? '✅ Connected' : '❌ KEY MISSING'}\n`);
});

export default app;
