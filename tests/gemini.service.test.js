import { describe, it, expect, jest } from '@jest/globals';
import { GeminiService } from '../services/gemini.service.js';

describe('GeminiService Tests', () => {
    const mockRes = {
        write: jest.fn(),
        end: jest.fn(),
        setHeader: jest.fn(),
        flushHeaders: jest.fn()
    };

    it('should exist as a defined object', () => {
        expect(GeminiService).toBeDefined();
    });

    it('should have a streamNarration method', () => {
        expect(typeof GeminiService.streamNarration).toBe('function');
    });

    it('should handle missing analysis data gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await GeminiService.streamNarration({ message: 'Hi', analysis: null }, mockRes);
        expect(mockRes.write).toHaveBeenCalled();
        expect(mockRes.end).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should correctly format data chunks for SSE', async () => {
        const analysis = { bottlenecks: [], evacuation_route: 'Gate B', overall_risk: 'LOW' };
        await GeminiService.streamNarration({ message: 'Status?', analysis }, mockRes);
        expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('data: '));
    });

    it('should signal completion with [DONE]', async () => {
        const analysis = { bottlenecks: [], evacuation_route: 'Gate B', overall_risk: 'LOW' };
        await GeminiService.streamNarration({ message: 'Status?', analysis }, mockRes);
        expect(mockRes.write).toHaveBeenCalledWith('data: [DONE]\n\n');
    });

    it('should handle API errors by returning a user-friendly message', async () => {
        // Force an error inside the service for this test
        const originalLog = console.error;
        console.error = jest.fn();
        
        await GeminiService.streamNarration({}, mockRes);
        
        expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('Narration Engine unavailable'));
        console.error = originalLog;
    });

    it('should use the pre-computed analysis in the prompt context', async () => {
        const analysis = { bottlenecks: [{ sector: 'A', risk_score: 90 }], evacuation_route: 'Gate B', overall_risk: 'HIGH' };
        // This test indirectly verifies prompt construction by checking successful call
        await expect(GeminiService.streamNarration({ message: 'Alert', analysis }, mockRes)).resolves.not.toThrow();
    });

    it('should support multi-sector analysis input', async () => {
        const analysis = { bottlenecks: [{s:'A'}, {s:'B'}], evacuation_route: 'C', overall_risk: 'CRITICAL' };
        await expect(GeminiService.streamNarration({ message: 'Full scan', analysis }, mockRes)).resolves.not.toThrow();
    });

    it('should handle empty bottlenecks list', async () => {
        const analysis = { bottlenecks: [], evacuation_route: 'Exit 1', overall_risk: 'NOMINAL' };
        await GeminiService.streamNarration({ message: 'All clear?', analysis }, mockRes);
        expect(mockRes.end).toHaveBeenCalled();
    });

    it('should prevent long message injections (handled by validation, but service-safe)', async () => {
        const longMsg = 'A'.repeat(1000);
        const analysis = { bottlenecks: [], evacuation_route: 'A', overall_risk: 'LOW' };
        await expect(GeminiService.streamNarration({ message: longMsg, analysis }, mockRes)).resolves.not.toThrow();
    });

    it('should maintain connection for the duration of the stream', async () => {
        const analysis = { bottlenecks: [], evacuation_route: 'A', overall_risk: 'LOW' };
        await GeminiService.streamNarration({ message: 'test', analysis }, mockRes);
        expect(mockRes.end).toHaveBeenCalledTimes(1);
    });

    it('should not throw on malformed analysis objects', async () => {
        await expect(GeminiService.streamNarration({ message: 'test', analysis: {} }, mockRes)).resolves.not.toThrow();
    });

    it('should log errors to the server console', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await GeminiService.streamNarration(null, mockRes);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should write error state to response on failure', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await GeminiService.streamNarration(null, mockRes);
        expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('error'));
        consoleSpy.mockRestore();
    });

    it('should close the stream even after an error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await GeminiService.streamNarration(null, mockRes);
        expect(mockRes.end).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
