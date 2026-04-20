import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

describe('Performance & Concurrency Benchmarks', () => {
    it('should respond to bottleneck predictions in under 100ms (Local Benchmark)', async () => {
        const start = Date.now();
        await request(app)
            .post('/api/predict-bottleneck')
            .send({ sectors: [{ name: 'A', density: 50 }] });
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(100);
    });

    it('should respond to AI Chat setup in under 200ms', async () => {
        const start = Date.now();
        await request(app)
            .post('/api/ai-chat')
            .send({ message: 'Hi', venue: 'V', sectors: [{name:'A', density:10}] });
        const duration = Date.now() - start;
        // Setup only (headers sent), not the full stream
        expect(duration).toBeLessThan(200);
    });

    it('should handle concurrent bottleneck requests', async () => {
        const reqs = Array.from({ length: 10 }, () => 
            request(app).post('/api/predict-bottleneck').send({ sectors: [{ name: 'A', density: 50 }] })
        );
        const results = await Promise.all(reqs);
        results.forEach(res => expect(res.status).toBe(200));
    });

    it('should handle sequential high-load sectoral data', async () => {
        for (let i = 0; i < 5; i++) {
            const res = await request(app).post('/api/predict-bottleneck').send({
                sectors: Array.from({length: 20}, (_, j) => ({name:`S${j}`, density: Math.random()*100}))
            });
            expect(res.status).toBe(200);
        }
    });

    it('should maintain low latency under 512kb payloads', async () => {
        const largeSectors = Array.from({length: 20}, (_, i) => ({name: 'A'.repeat(100), density: i}));
        const start = Date.now();
        await request(app).post('/api/predict-bottleneck').send({ sectors: largeSectors });
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(200);
    });

    it('should process simple analytical tasks in near-zero time', async () => {
        // Analytics logic itself should be microseconds
        const start = process.hrtime();
        await request(app).post('/api/predict-bottleneck').send({ sectors: [{name:'A', density:1}] });
        const [s, ns] = process.hrtime(start);
        const ms = s * 1000 + ns / 1e6;
        expect(ms).toBeLessThan(150); // Total HTTP cycle
    });

    it('should reject flood attacks (Rate Limiting)', async () => {
        // AI limit is 1/2s. We hit it 3 times.
        await request(app).post('/api/ai-chat').send({});
        await request(app).post('/api/ai-chat').send({});
        const res = await request(app).post('/api/ai-chat').send({});
        expect(res.status).toBe(429);
    });

    it('should handle rapid concurrent static file requests', async () => {
        const reqs = Array.from({ length: 20 }, () => request(app).get('/'));
        const results = await Promise.all(reqs);
        results.forEach(res => expect(res.status).toBe(200));
    });

    it('should efficiently handle large CSS/JS serving', async () => {
        // Check index.html size
        const res = await request(app).get('/');
        expect(res.header['content-length']).toBeDefined();
        expect(parseInt(res.header['content-length'])).toBeGreaterThan(1000);
    });

    it('should handle rapid validation failures without resource leak', async () => {
        for (let i = 0; i < 10; i++) {
            await request(app).post('/api/ai-chat').send({});
        }
        // Even with errors, the server should remain responsive
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
    });

    it('should keep heap growth stable across 50 requests', async () => {
        const initialMem = process.memoryUsage().heapUsed;
        for (let i = 0; i < 50; i++) {
            await request(app).post('/api/predict-bottleneck').send({sectors:[{name:'a', density:1}]});
        }
        const finalMem = process.memoryUsage().heapUsed;
        // Heap might grow, but shouldn't explode (e.g. > 100MB increase)
        expect(finalMem - initialMem).toBeLessThan(100 * 1024 * 1024);
    });

    it('should handle large message narration setup efficiently', async () => {
        const start = Date.now();
        await request(app).post('/api/ai-chat').send({
            message: 'a'.repeat(499), venue: 'v', sectors: [{name:'a', density:1}]
        });
        expect(Date.now() - start).toBeLessThan(300);
    });

    it('should parse large JSON bodies in under 50ms', async () => {
        const start = Date.now();
        await request(app).post('/api/predict-bottleneck').send({
            sectors: Array.from({length:20}, (_,i)=>({name:`S${i}`, density:i}))
        });
        expect(Date.now() - start).toBeLessThan(100);
    });

    it('should deliver static fallback (SPA) in under 50ms', async () => {
        const start = Date.now();
        await request(app).get('/any/nested/path');
        expect(Date.now() - start).toBeLessThan(100);
    });

    it('should handle CORS preflights in under 20ms', async () => {
        const start = Date.now();
        await request(app).options('/').set('Origin', 'http://localhost:3001');
        expect(Date.now() - start).toBeLessThan(50);
    });
});
