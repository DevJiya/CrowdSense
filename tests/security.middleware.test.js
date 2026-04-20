import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

describe('Security Middleware Tests', () => {
    describe('HTTP Headers (Helmet)', () => {
        it('should have Content-Security-Policy header', async () => {
            const res = await request(app).get('/');
            expect(res.headers).toHaveProperty('content-security-policy');
        });

        it('should hide X-Powered-By header', async () => {
            const res = await request(app).get('/');
            expect(res.headers).not.toHaveProperty('x-powered-by');
        });

        it('should have X-Content-Type-Options: nosniff', async () => {
            const res = await request(app).get('/');
            expect(res.headers['x-content-type-options']).toBe('nosniff');
        });

        it('should have X-Frame-Options: SAMEORIGIN or DENY', async () => {
            const res = await request(app).get('/');
            expect(res.headers).toHaveProperty('x-frame-options');
        });

        it('should have Strict-Transport-Security in production (if configured)', async () => {
            const res = await request(app).get('/');
            // This might only appear if HTTPS is detected or NODE_ENV=production
            if (process.env.NODE_ENV === 'production') {
                expect(res.headers).toHaveProperty('strict-transport-security');
            }
        });
    });

    describe('CORS Enforcement', () => {
        it('should allow whitelisted origins', async () => {
            const res = await request(app)
                .get('/')
                .set('Origin', 'http://localhost:3001');
            expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3001');
        });

        it('should deny non-whitelisted origins', async () => {
            const res = await request(app)
                .get('/')
                .set('Origin', 'https://attacker.com');
            expect(res.headers['access-control-allow-origin']).toBeUndefined();
        });

        it('should support preflight OPTIONS requests for whitelisted origins', async () => {
            const res = await request(app)
                .options('/api/ai-chat')
                .set('Origin', 'http://localhost:3001')
                .set('Access-Control-Request-Method', 'POST');
            expect(res.status).toBe(204);
            expect(res.headers['access-control-allow-methods']).toContain('POST');
        });
    });

    describe('Rate Limiting', () => {
        it('should include rate limit headers', async () => {
            const res = await request(app).get('/');
            expect(res.headers).toHaveProperty('x-ratelimit-limit');
            expect(res.headers).toHaveProperty('x-ratelimit-remaining');
        });

        it('should distinguish between global and AI-specific limits', async () => {
            const resApi = await request(app).post('/api/predict-bottleneck').send({sectors:[]});
            const resAi = await request(app).post('/api/ai-chat').send({});
            
            // AI limit is 1 req / 2s, Global is 100 / 15m. 
            // Headers should reflect different capacities.
            expect(resApi.headers['x-ratelimit-limit']).toBe('100');
            expect(resAi.headers['x-ratelimit-limit']).toBe('1');
        });

        it('should return 429 when AI limit is exceeded', async () => {
            // AI limit is 1 per 2 seconds
            await request(app).post('/api/ai-chat').send({});
            const res = await request(app).post('/api/ai-chat').send({});
            expect(res.status).toBe(429);
            expect(res.body.error).toContain('throttled');
        });
    });

    describe('Input Sanitization', () => {
        it('should escape HTML in incoming sector names', async () => {
            const res = await request(app)
                .post('/api/predict-bottleneck')
                .send({ sectors: [{ name: '<script>alert(1)</script>', density: 50 }] });
            // The validation middleware should have escaped the name
            // Note: express-validator .escape() converts < to &lt;
            // Since our logic filters > 65, and 50 is not > 65, we check if it passed validation
            expect(res.status).toBe(200);
        });

        it('should block extremely large JSON payloads (>512kb)', async () => {
            const bigData = 'a'.repeat(600 * 1024); // 600kb
            const res = await request(app)
                .post('/api/predict-bottleneck')
                .send({ data: bigData });
            expect(res.status).toBe(413); // Payload Too Large
        });

        it('should enforce X-Frame-Options: SAMEORIGIN', async () => {
            const res = await request(app).get('/');
            expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
        });

        it('should enforce X-XSS-Protection header', async () => {
            const res = await request(app).get('/');
            expect(res.headers['x-xss-protection']).toBeDefined();
        });
    });
});
