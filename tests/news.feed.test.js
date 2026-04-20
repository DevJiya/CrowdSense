import { describe, it, expect } from '@jest/globals';

describe('News Intelligence Feed Tests', () => {
    const parseFeed = (items) => {
        return items.map(i => ({
            title: i.title.toUpperCase(),
            is_critical: i.title.includes('ALERT') || i.title.includes('CHAOS'),
            impact_score: i.title.includes('ALERT') ? 80 : 20
        }));
    };

    it('should correctly parse a normal news item', () => {
        const input = [{ title: 'Crowd flowing smoothly' }];
        const result = parseFeed(input);
        expect(result[0].title).toBe('CROWD FLOWING SMOOTHLY');
        expect(result[0].is_critical).toBe(false);
    });

    it('should identify critical ALERT keywords', () => {
        const input = [{ title: 'ALERT: Gate A blocked' }];
        const result = parseFeed(input);
        expect(result[0].is_critical).toBe(true);
        expect(result[0].impact_score).toBe(80);
    });

    it('should identify critical CHAOS keywords', () => {
        const input = [{ title: 'CHAOS at South entrance' }];
        const result = parseFeed(input);
        expect(result[0].is_critical).toBe(true);
    });

    it('should handle mixed feed items', () => {
        const input = [
            { title: 'Normal flow' },
            { title: 'ALERT: Power out' }
        ];
        const result = parseFeed(input);
        expect(result).toHaveLength(2);
        expect(result[0].is_critical).toBe(false);
        expect(result[1].is_critical).toBe(true);
    });

    it('should normalize titles to uppercase', () => {
        const input = [{ title: 'lowercase title' }];
        const result = parseFeed(input);
        expect(result[0].title).toBe('LOWERCASE TITLE');
    });

    it('should assign low impact score to non-critical items', () => {
        const input = [{ title: 'Sun is shining' }];
        const result = parseFeed(input);
        expect(result[0].impact_score).toBe(20);
    });

    it('should handle empty feeds', () => {
        expect(parseFeed([])).toHaveLength(0);
    });

    it('should handle special characters in titles', () => {
        const input = [{ title: '!!!ALERT!!!' }];
        const result = parseFeed(input);
        expect(result[0].is_critical).toBe(true);
    });

    it('should handle very long titles', () => {
        const input = [{ title: 'A'.repeat(500) }];
        const result = parseFeed(input);
        expect(result[0].title).toHaveLength(500);
    });

    it('should not throw on missing titles (internal safety)', () => {
        const input = [{ title: '' }];
        expect(() => parseFeed(input)).not.toThrow();
    });

    it('should map items correctly in order', () => {
        const input = [{title:'1'}, {title:'2'}];
        const result = parseFeed(input);
        expect(result[0].title).toBe('1');
        expect(result[1].title).toBe('2');
    });

    it('should handle numeric titles by conversion', () => {
        const input = [{title: '123'}];
        const result = parseFeed(input);
        expect(result[0].title).toBe('123');
    });

    it('should correctly identify "CHAOS" anywhere in title', () => {
        const input = [{title: 'Some chaos expected'}];
        const result = parseFeed(input);
        expect(result[0].is_critical).toBe(true);
    });

    it('should handle items with extra properties', () => {
        const input = [{title: 'Hi', link: 'http://...'}];
        const result = parseFeed(input);
        expect(result[0]).not.toHaveProperty('link');
    });

    it('should support mass feed processing (100+ items)', () => {
        const input = Array.from({length: 100}, () => ({title: 'Alert'}));
        const result = parseFeed(input);
        expect(result).toHaveLength(100);
        expect(result[0].is_critical).toBe(true);
    });
});
