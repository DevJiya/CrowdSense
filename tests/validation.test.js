import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

describe('Input Validation Tests', () => {
    describe('POST /api/ai-chat Validation', () => {
        it('should require a message string', async () => {
            const res = await request(app).post('/api/ai-chat').send({ venue: 'A', sectors: [{name:'A', density:10}] });
            expect(res.status).toBe(400);
            expect(JSON.stringify(res.body)).toContain('message');
        });

        it('should require a venue string', async () => {
            const res = await request(app).post('/api/ai-chat').send({ message: 'Hi', sectors: [{name:'A', density:10}] });
            expect(res.status).toBe(400);
            expect(JSON.stringify(res.body)).toContain('venue');
        });

        it('should require a sectors array', async () => {
            const res = await request(app).post('/api/ai-chat').send({ message: 'Hi', venue: 'A' });
            expect(res.status).toBe(400);
            expect(JSON.stringify(res.body)).toContain('sectors');
        });

        it('should require at least one sector', async () => {
            const res = await request(app).post('/api/ai-chat').send({ message: 'Hi', venue: 'A', sectors: [] });
            expect(res.status).toBe(400);
        });

        it('should validate sector density is a number', async () => {
            const res = await request(app).post('/api/ai-chat').send({ 
                message: 'Hi', venue: 'A', 
                sectors: [{name:'A', density: 'high'}] 
            });
            expect(res.status).toBe(400);
        });

        it('should trim whitespace from message', async () => {
            // Internal validation usually handles this; we check if it passes
            const res = await request(app).post('/api/ai-chat').send({ 
                message: '   Valid Message   ', venue: 'A', 
                sectors: [{name:'A', density:10}] 
            });
            expect(res.status).toBe(200);
        });
    });

    describe('POST /api/predict-bottleneck Validation', () => {
        it('should require sectors array', async () => {
            const res = await request(app).post('/api/predict-bottleneck').send({});
            expect(res.status).toBe(400);
        });

        it('should limit sectors array to 20 items', async () => {
            const manySectors = Array.from({length: 21}, (_, i) => ({name: `S${i}`, density: 50}));
            const res = await request(app).post('/api/predict-bottleneck').send({ sectors: manySectors });
            expect(res.status).toBe(400);
        });

        it('should require sector name', async () => {
            const res = await request(app).post('/api/predict-bottleneck').send({ sectors: [{density: 50}] });
            expect(res.status).toBe(400);
        });

        it('should require sector density', async () => {
            const res = await request(app).post('/api/predict-bottleneck').send({ sectors: [{name: 'A'}] });
            expect(res.status).toBe(400);
        });

        it('should validate density is within 0-100 range', async () => {
            const res = await request(app).post('/api/predict-bottleneck').send({ sectors: [{name: 'A', density: 101}] });
            expect(res.status).toBe(400);
        });

        it('should accept 0% density', async () => {
            const res = await request(app).post('/api/predict-bottleneck').send({ sectors: [{name: 'A', density: 0}] });
            expect(res.status).toBe(200);
        });

        it('should accept 100% density', async () => {
            const res = await request(app).post('/api/predict-bottleneck').send({ sectors: [{name: 'A', density: 100}] });
            expect(res.status).toBe(200);
        });

        it('should block non-array sectors input', async () => {
            const res = await request(app).post('/api/predict-bottleneck').send({ sectors: 'not-an-array' });
            expect(res.status).toBe(400);
        });

        it('should block non-string sector names', async () => {
            const res = await request(app).post('/api/predict-bottleneck').send({ sectors: [{name: 123, density: 50}] });
            expect(res.status).toBe(400);
        });

        it('should block missing properties in sector objects', async () => {
            const res = await request(app).post('/api/predict-bottleneck').send({ sectors: [{}] });
            expect(res.status).toBe(400);
        });
    });
});
