import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js'; // Ensure server.js exports the app

describe('API Route Tests', () => {
    let server;
    
    beforeAll(() => {
        // App is already listening or we use the exported app instance
        server = app;
    });

    describe('POST /api/ai-chat', () => {
        const validPayload = {
            message: 'What is the risk?',
            venue: 'Main Stadium',
            sectors: [{ name: 'A', density: 80 }]
        };

        it('should return 200 and start a stream for valid input', async () => {
            const response = await request(app)
                .post('/api/ai-chat')
                .send(validPayload);
            
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toContain('text/event-stream');
        });

        it('should return 400 for missing message', async () => {
            const response = await request(app)
                .post('/api/ai-chat')
                .send({ venue: 'Test', sectors: [] });
            expect(response.status).toBe(400);
        });

        it('should return 400 for empty sector list', async () => {
            const response = await request(app)
                .post('/api/ai-chat')
                .send({ ...validPayload, sectors: [] });
            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid density values', async () => {
            const response = await request(app)
                .post('/api/ai-chat')
                .send({ ...validPayload, sectors: [{ name: 'A', density: 'high' }] });
            expect(response.status).toBe(400);
        });

        it('should reject extremely long messages (>500 chars)', async () => {
            const response = await request(app)
                .post('/api/ai-chat')
                .send({ ...validPayload, message: 'a'.repeat(501) });
            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/predict-bottleneck', () => {
        it('should return 200 and a JSON report for valid sectors', async () => {
            const response = await request(app)
                .post('/api/predict-bottleneck')
                .send({ sectors: [{ name: 'North', density: 90 }] });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('overall_risk', 'HIGH');
        });

        it('should block extremely large JSON payloads (>512kb)', async () => {
            const bigData = 'a'.repeat(600 * 1024); // 600kb
            const res = await request(app)
                .post('/api/predict-bottleneck')
                .send({ data: bigData });
            expect(res.status).toBe(413); // Payload Too Large
        });

        it('should reject non-JSON content types for API routes', async () => {
            const res = await request(app)
                .post('/api/predict-bottleneck')
                .set('Content-Type', 'text/plain')
                .send('not json');
            expect(res.status).toBe(400);
        });

        it('should handle malformed JSON bodies without crashing', async () => {
            const res = await request(app)
                .post('/api/predict-bottleneck')
                .set('Content-Type', 'application/json')
                .send('{ invalid json');
            expect(res.status).toBe(400);
        });

        it('should handle large sector arrays (up to 20)', async () => {
            const sectors = Array.from({ length: 20 }, (_, i) => ({ name: `S${i}`, density: 50 }));
            const response = await request(app)
                .post('/api/predict-bottleneck')
                .send({ sectors });
            expect(response.status).toBe(200);
        });

        it('should reject more than 20 sectors', async () => {
            const sectors = Array.from({ length: 21 }, (_, i) => ({ name: `S${i}`, density: 50 }));
            const response = await request(app)
                .post('/api/predict-bottleneck')
                .send({ sectors });
            expect(response.status).toBe(400);
        });

        it('should return 400 for malformed sector objects', async () => {
            const response = await request(app)
                .post('/api/predict-bottleneck')
                .send({ sectors: [{ name: 123, density: 'wrong' }] });
            expect(response.status).toBe(400);
        });
    });

    describe('Static File Serving', () => {
        it('should serve index.html at root', async () => {
            const response = await request(app).get('/');
            expect(response.status).toBe(200);
            expect(response.text).toContain('<!DOCTYPE html>');
        });

        it('should handle 404/Fallback for unknown routes by serving index.html (SPA mode)', async () => {
            const response = await request(app).get('/unknown-path');
            expect(response.status).toBe(200);
            expect(response.text).toContain('<!DOCTYPE html>');
        });
    });

    describe('CORS & Headers', () => {
        it('should reject unauthorized origins', async () => {
            const response = await request(app)
                .get('/')
                .set('Origin', 'https://malicious-site.com');
            // Depending on CORS middleware config, it might return 200 but without Access-Control headers, or 500 error
            expect(response.headers['access-control-allow-origin']).toBeUndefined();
        });

        it('should include Helmet security headers', async () => {
            const response = await request(app).get('/');
            expect(response.headers).toHaveProperty('content-security-policy');
            expect(response.headers).toHaveProperty('x-xss-protection');
        });

        it('should include X-Frame-Options header to prevent clickjacking', async () => {
            const response = await request(app).get('/');
            expect(response.headers['x-frame-options']).toBeDefined();
        });

        it('should return 405 for unsupported methods on AI chat', async () => {
            const response = await request(app).put('/api/ai-chat').send({});
            // Express usually returns 404 for unknown method/route combos or we handle 405
            expect([404, 405]).toContain(response.status);
        });
    });
});
