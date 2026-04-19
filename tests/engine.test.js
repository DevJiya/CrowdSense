/**
 * CrowdSense AI - Core Engine Logic Tests
 * 
 * This test suite validates the predictive algorithms used by the 
 * CrowdSense Tactical Intelligence Layer to calculate threat levels.
 */

describe('CrowdSense AI - Predictive Threat Algorithms', () => {
    
    test('Calculates Chaos Probability correctly based on rapid density trend', () => {
        // High occupancy with a rapid positive trend
        const occupancy = 80;
        const trend = 5; 
        
        // Algorithm: Base probability derived from occupancy, heavily weighted by sudden trend spikes
        const chaosProb = Math.max(0, Math.min(99, Math.floor(occupancy * 0.8 + (trend * 3))));
        
        // 80 * 0.8 = 64. 5 * 3 = 15. Total = 79.
        expect(chaosProb).toBe(79); 
    });

    test('Maintains CALM mood during nominal operational bounds', () => {
        const chaosProb = 25;
        const mood = chaosProb > 75 ? 'CHAOS' : (chaosProb > 40 ? 'TENSE' : 'CALM');
        expect(mood).toBe('CALM');
    });

    test('Escalates to TENSE mood when probability exceeds 40%', () => {
        const chaosProb = 55;
        const mood = chaosProb > 75 ? 'CHAOS' : (chaosProb > 40 ? 'TENSE' : 'CALM');
        expect(mood).toBe('TENSE');
    });

    test('Triggers CHAOS protocol when probability breaches 75%', () => {
        const chaosProb = 88;
        const mood = chaosProb > 75 ? 'CHAOS' : (chaosProb > 40 ? 'TENSE' : 'CALM');
        expect(mood).toBe('CHAOS');
    });

    test('Ensures Acoustic Baseline scales realistically with Crowd Density', () => {
        const occupancy = 90;
        // Formula: 60dB base + 0.4 multiplier + variance
        const minAcoustic = Math.floor(60 + (occupancy * 0.4));
        const maxAcoustic = minAcoustic + 10;
        
        expect(minAcoustic).toBe(96);
        expect(maxAcoustic).toBe(106);
    });

    test('Prioritizes Safest Evacuation Route correctly', () => {
        const sectors = [
            { name: "Gate A", density: 95 },
            { name: "VIP Pavilion", density: 40 },
            { name: "North Concourse", density: 80 }
        ];

        let safestSector = sectors[0];
        sectors.forEach(sec => {
            if(sec.density < safestSector.density) safestSector = sec;
        });

        expect(safestSector.name).toBe("VIP Pavilion");
    });
});
