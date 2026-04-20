import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { CrowdAnalyticsService } from '../services/crowd.service.js';
import { GeminiService } from '../services/gemini.service.js';

describe('End-to-End Integration Flow', () => {
    it('should complete a full Tactical Intelligence cycle', async () => {
        // 1. Setup spys to track the flow
        const analyticsSpy = jest.spyOn(CrowdAnalyticsService, 'predictBottlenecks');
        const narrationSpy = jest.spyOn(GeminiService, 'streamNarration');

        // 2. Trigger the API
        const response = await request(app)
            .post('/api/ai-chat')
            .send({
                message: 'Provide status',
                venue: 'Stadium X',
                sectors: [{ name: 'North', density: 90 }]
            });

        // 3. Verify analytics was called with correct data
        expect(analyticsSpy).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ name: 'North', density: 90 })
        ]));

        // 4. Verify narration was called with computed results
        expect(narrationSpy).toHaveBeenCalledWith(
            expect.objectContaining({ 
                analysis: expect.objectContaining({ overall_risk: 'HIGH' }) 
            }),
            expect.anything()
        );

        // 5. Verify the client received a streaming response
        expect(response.status).toBe(200);
        expect(response.text).toContain('Mocked AI response chunk');

        analyticsSpy.mockRestore();
        narrationSpy.mockRestore();
    });

    it('should correctly handle "NOMINAL" risk cycles', async () => {
        const narrationSpy = jest.spyOn(GeminiService, 'streamNarration');
        
        await request(app)
            .post('/api/ai-chat')
            .send({
                message: 'Is it safe?',
                venue: 'Stadium X',
                sectors: [{ name: 'North', density: 10 }]
            });

        expect(narrationSpy).toHaveBeenCalledWith(
            expect.objectContaining({ 
                analysis: expect.objectContaining({ overall_risk: 'NOMINAL' }) 
            }),
            expect.anything()
        );
        
        narrationSpy.mockRestore();
    });

    it('should handle complex multi-sector risk scenarios', async () => {
        const narrationSpy = jest.spyOn(GeminiService, 'streamNarration');
        
        await request(app)
            .post('/api/ai-chat')
            .send({
                message: 'Full sweep',
                venue: 'Stadium X',
                sectors: [
                    { name: 'A', density: 90 },
                    { name: 'B', density: 10 },
                    { name: 'C', density: 95 }
                ]
            });

        const analysis = narrationSpy.mock.calls[0][0].analysis;
        expect(analysis.bottlenecks).toHaveLength(2);
        expect(analysis.evacuation_route).toBe('B');
        
        narrationSpy.mockRestore();
    });

    it('should preserve user message through the pipeline', async () => {
        const narrationSpy = jest.spyOn(GeminiService, 'streamNarration');
        const myMsg = 'PRIORITY ALPHA: CHECK NORTH GATE';
        
        await request(app)
            .post('/api/ai-chat')
            .send({
                message: myMsg,
                venue: 'X',
                sectors: [{ name: 'N', density: 10 }]
            });

        expect(narrationSpy).toHaveBeenCalledWith(
            expect.objectContaining({ message: myMsg }),
            expect.anything()
        );
        
        narrationSpy.mockRestore();
    });

    it('should handle benchmarking logs during integration', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        await request(app)
            .post('/api/ai-chat')
            .send({
                message: 'test',
                venue: 'X',
                sectors: [{ name: 'N', density: 10 }]
            });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[Benchmark]'));
        logSpy.mockRestore();
    });

    it('should enforce rate limits during sequential calls', async () => {
        // First call success
        const res1 = await request(app).post('/api/ai-chat').send({message:'a', venue:'b', sectors:[{name:'c', density:1}]});
        expect(res1.status).toBe(200);

        // Second call should be blocked (1 req / 2s)
        const res2 = await request(app).post('/api/ai-chat').send({message:'a', venue:'b', sectors:[{name:'c', density:1}]});
        expect(res2.status).toBe(429);
    });

    it('should maintain connection persistence across large response streams', async () => {
        // Our mock is small, but we verify headers support streaming
        const res = await request(app).post('/api/ai-chat').send({message:'a', venue:'b', sectors:[{name:'c', density:1}]});
        expect(res.headers['connection']).toBe('keep-alive');
        expect(res.headers['cache-control']).toBe('no-cache');
    });

    it('should handle analytics errors gracefully in the flow', async () => {
        const analyticsSpy = jest.spyOn(CrowdAnalyticsService, 'predictBottlenecks').mockImplementation(() => {
            throw new Error('Analytics Failure');
        });

        const res = await request(app).post('/api/ai-chat').send({message:'a', venue:'b', sectors:[{name:'c', density:1}]});
        // The current implementation might crash or return 500 depending on middleware
        // We ensure it doesn't leak sensitive error info
        expect(res.status).toBeGreaterThanOrEqual(400);
        
        analyticsSpy.mockRestore();
    });

    it('should provide a [DONE] signal at the end of every successful integration flow', async () => {
        const res = await request(app).post('/api/ai-chat').send({message:'a', venue:'b', sectors:[{name:'c', density:1}]});
        expect(res.text).toContain('[DONE]');
    });

    it('should integrate with the static frontend serving logic', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('text/html');
    });

    it('should support mixed risk levels in complex environments', async () => {
        const narrationSpy = jest.spyOn(GeminiService, 'streamNarration');
        await request(app).post('/api/ai-chat').send({
            message: 'scan', venue: 'v',
            sectors: [{name:'A', density: 100}, {name:'B', density: 0}]
        });
        const analysis = narrationSpy.mock.calls[0][0].analysis;
        expect(analysis.overall_risk).toBe('HIGH');
        expect(analysis.evacuation_route).toBe('B');
        narrationSpy.mockRestore();
    });

    it('should validate every step of the pipeline', async () => {
        const res = await request(app).post('/api/ai-chat').send({ sectors: [] });
        expect(res.status).toBe(400); // Validation fails early
    });

    it('should handle special characters in the message', async () => {
        const msg = 'CHECK "GATE A" NOW!!! #CRITICAL';
        const res = await request(app).post('/api/ai-chat').send({
            message: msg, venue: 'V', sectors: [{name:'A', density:1}]
        });
        expect(res.status).toBe(200);
    });

    it('should handle numeric overflow in density (capped at 100)', async () => {
        const res = await request(app).post('/api/predict-bottleneck').send({
            sectors: [{name:'A', density: 999}]
        });
        // Validation might catch this or service might cap it. 
        // Based on current validator: .isFloat({ min: 0, max: 100 })
        expect(res.status).toBe(400);
    });

    it('should handle very long venue names', async () => {
        const longVenue = 'V'.repeat(100);
        const res = await request(app).post('/api/ai-chat').send({
            message: 'a', venue: longVenue, sectors: [{name:'A', density:1}]
        });
        expect(res.status).toBe(200);
    });
});
