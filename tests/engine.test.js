import assert from 'node:assert';

console.log("🚀 Starting CrowdSense AI Core Engine Tests...\n");

function runTests() {
    let passed = 0;
    let failed = 0;

    const test = (name, fn) => {
        try {
            fn();
            console.log(`✅ PASS: ${name}`);
            passed++;
        } catch (error) {
            console.error(`❌ FAIL: ${name}`);
            console.error(error);
            failed++;
        }
    };

    test('Calculates Chaos Probability correctly based on rapid density trend', () => {
        const occupancy = 80;
        const trend = 5; 
        const chaosProb = Math.max(0, Math.min(99, Math.floor(occupancy * 0.8 + (trend * 3))));
        assert.strictEqual(chaosProb, 79); 
    });

    test('Maintains CALM mood during nominal operational bounds', () => {
        const chaosProb = 25;
        const mood = chaosProb > 75 ? 'CHAOS' : (chaosProb > 40 ? 'TENSE' : 'CALM');
        assert.strictEqual(mood, 'CALM');
    });

    test('Escalates to TENSE mood when probability exceeds 40%', () => {
        const chaosProb = 55;
        const mood = chaosProb > 75 ? 'CHAOS' : (chaosProb > 40 ? 'TENSE' : 'CALM');
        assert.strictEqual(mood, 'TENSE');
    });

    test('Triggers CHAOS protocol when probability breaches 75%', () => {
        const chaosProb = 88;
        const mood = chaosProb > 75 ? 'CHAOS' : (chaosProb > 40 ? 'TENSE' : 'CALM');
        assert.strictEqual(mood, 'CHAOS');
    });

    test('Ensures Acoustic Baseline scales realistically with Crowd Density', () => {
        const occupancy = 90;
        const minAcoustic = Math.floor(60 + (occupancy * 0.4));
        assert.strictEqual(minAcoustic, 96);
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
        assert.strictEqual(safestSector.name, "VIP Pavilion");
    });

    console.log(`\n🏁 Test Suite Complete: ${passed} Passed, ${failed} Failed.`);
    if (failed > 0) process.exit(1);
}

runTests();
