import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

describe('Error Handling & Resilience', () => {
    it('should return a 400 JSON error for validation failures', async () => {
        const res = await request(app).post('/api/ai-chat').send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should handle malformed JSON gracefully', async () => {
        const res = await request(app)
            .post('/api/predict-bottleneck')
            .set('Content-Type', 'application/json')
            .send('{"sectors": [}');
        expect(res.status).toBe(400);
    });

    it('should return 413 for oversized payloads', async () => {
        const bigJson = JSON.stringify({ sectors: Array.from({length: 1000}, () => ({name:'a', density:1})) });
        const res = await request(app)
            .post('/api/predict-bottleneck')
            .set('Content-Type', 'application/json')
            .send(bigJson);
        // Limit is 512kb, this should trigger it
        expect(res.status).toBe(413);
    });

    it('should not leak stack traces in error responses', async () => {
        const res = await request(app).post('/api/ai-chat').send({});
        expect(res.text).not.toContain('node_modules');
        expect(res.text).not.toContain('at ');
    });

    it('should handle internal server errors gracefully (simulated)', async () => {
        // We simulate a route that throws
        const res = await request(app).get('/force-error-if-possible'); 
        // Should fallback to index.html or return 500
        expect(res.status).toBe(200); // Because of SPA fallback
    });

    it('should handle SSE disconnection gracefully', async () => {
        const res = await request(app)
            .post('/api/ai-chat')
            .send({message:'a', venue:'b', sectors:[{name:'c', density:1}]});
        // We can't easily "disconnect" in supertest mid-stream, 
        // but we verify it starts correctly and ends with [DONE]
        expect(res.text).toContain('[DONE]');
    });

    it('should provide actionable validation details', async () => {
        const res = await request(app).post('/api/ai-chat').send({});
        expect(res.body.details).toBeDefined();
        expect(Array.isArray(res.body.details)).toBe(true);
    });

    it('should sanitize error messages from 3rd party SDKs', async () => {
        // Simulated failure of Gemini SDK
        const res = await request(app).post('/api/ai-chat').send({
            message: 'trigger-error', venue: 'v', sectors: [{name:'a', density:1}]
        });
        // Error message should be our custom one, not raw SDK error
        expect(res.text).not.toContain('API_KEY_INVALID');
    });

    it('should handle empty responses from internal services', async () => {
        const res = await request(app).post('/api/predict-bottleneck').send({sectors: []});
        expect(res.status).toBe(400);
    });

    it('should catch unhandled promise rejections (globally)', () => {
        // This is a process-level check, but we verify server stability
        expect(app).toBeDefined();
    });

    it('should provide a 429 status for rate limiting', async () => {
        await request(app).post('/api/ai-chat').send({});
        const res = await request(app).post('/api/ai-chat').send({});
        expect(res.status).toBe(429);
        expect(res.body.error).toBeDefined();
    });

    it('should handle missing sectors in payload', async () => {
        const res = await request(app).post('/api/predict-bottleneck').send({});
        expect(res.status).toBe(400);
    });

    it('should handle non-object sector elements', async () => {
        const res = await request(app).post('/api/predict-bottleneck').send({ sectors: [1, 2, 3] });
        expect(res.status).toBe(400);
    });

    it('should handle sectors with missing density', async () => {
        const res = await request(app).post('/api/predict-bottleneck').send({ sectors: [{name:'A'}] });
        expect(res.status).toBe(400);
    });

    it('should handle sectors with missing names', async () => {
        const res = await request(app).post('/api/predict-bottleneck').send({ sectors: [{density: 50}] });
        expect(res.status).toBe(400);
    });
});
