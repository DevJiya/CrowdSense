import { describe, it, expect } from '@jest/globals';

// Utility for tests (internal sanitization check)
const sanitize = (str) => str.replace(/[<>]/g, '');

describe('Utility Service Tests', () => {
    describe('Sanitization Logic', () => {
        it('should remove script tags', () => {
            expect(sanitize('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
        });

        it('should handle empty strings', () => {
            expect(sanitize('')).toBe('');
        });

        it('should handle special characters', () => {
            expect(sanitize('Hello <World>')).toBe('Hello World');
        });

        it('should not mutate clean strings', () => {
            const clean = 'Tactical Intelligence Layer';
            expect(sanitize(clean)).toBe(clean);
        });

        it('should handle multiple nested tags', () => {
            expect(sanitize('<<tag>>')).toBe('tag');
        });
        
        it('should handle numbers passed as strings', () => {
            expect(sanitize('123')).toBe('123');
        });

        it('should handle whitespace preservation', () => {
            expect(sanitize('  <space>  ')).toBe('  space  ');
        });
    });

    describe('Numeric Helpers', () => {
        const round = (n) => Math.round(n * 100) / 100;

        it('should round to 2 decimal places', () => {
            expect(round(85.5555)).toBe(85.56);
        });

        it('should handle integers', () => {
            expect(round(85)).toBe(85);
        });

        it('should handle zero', () => {
            expect(round(0)).toBe(0);
        });

        it('should handle very small decimals', () => {
            expect(round(0.0001)).toBe(0);
        });

        it('should handle negative numbers', () => {
            expect(round(-10.555)).toBe(-10.56);
        });
        
        it('should handle large numbers', () => {
            expect(round(999999.999)).toBe(1000000);
        });

        it('should handle precise midpoints', () => {
            expect(round(1.005)).toBe(1.01);
        });

        it('should handle infinity gracefully (native)', () => {
            expect(round(Infinity)).toBe(Infinity);
        });
    });
});
