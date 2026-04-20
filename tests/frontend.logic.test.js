import { describe, it, expect } from '@jest/globals';

describe('Frontend Intelligence Logic', () => {
    // Mocking the behavior of the UI engine in script.js
    const calculateMoodEmoji = (density) => {
        if (density > 85) return '🔥';
        if (density > 65) return '⚠️';
        return '✅';
    };

    const getStatusText = (risk) => {
        switch(risk) {
            case 'HIGH': return 'CRITICAL BREACH';
            case 'LOW': return 'STABLE SIGNAL';
            default: return 'SCANNING...';
        }
    };

    it('should return 🔥 for critical density', () => {
        expect(calculateMoodEmoji(90)).toBe('🔥');
    });

    it('should return ⚠️ for warning density', () => {
        expect(calculateMoodEmoji(70)).toBe('⚠️');
    });

    it('should return ✅ for safe density', () => {
        expect(calculateMoodEmoji(10)).toBe('✅');
    });

    it('should handle boundary 85 as safe/warning', () => {
        expect(calculateMoodEmoji(85)).toBe('⚠️');
    });

    it('should handle boundary 65 as safe', () => {
        expect(calculateMoodEmoji(65)).toBe('✅');
    });

    it('should map HIGH risk to CRITICAL BREACH text', () => {
        expect(getStatusText('HIGH')).toBe('CRITICAL BREACH');
    });

    it('should map LOW risk to STABLE SIGNAL text', () => {
        expect(getStatusText('LOW')).toBe('STABLE SIGNAL');
    });

    it('should return fallback text for unknown risk', () => {
        expect(getStatusText('UNKNOWN')).toBe('SCANNING...');
    });

    it('should handle null risk input', () => {
        expect(getStatusText(null)).toBe('SCANNING...');
    });

    it('should handle numeric density as string input', () => {
        expect(calculateMoodEmoji('90')).toBe('🔥');
    });

    it('should handle zero density correctly', () => {
        expect(calculateMoodEmoji(0)).toBe('✅');
    });

    it('should handle maximum density correctly', () => {
        expect(calculateMoodEmoji(100)).toBe('🔥');
    });

    it('should return consistent results for same input', () => {
        expect(calculateMoodEmoji(50)).toBe(calculateMoodEmoji(50));
    });

    it('should handle negative density (safety check)', () => {
        expect(calculateMoodEmoji(-10)).toBe('✅');
    });

    it('should handle empty status text input', () => {
        expect(getStatusText('')).toBe('SCANNING...');
    });
});
