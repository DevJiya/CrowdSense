/**
 * Evaluates sector conditions and identifies critical bottlenecks.
 * Pure server-side algorithm avoiding reliance on LLM for mathematical ranking.
 * 
 * @param {Array<{name: string, density: number}>} sectors - Array of sector metrics
 * @returns {Array<{sector: string, risk_score: number, eta_to_critical: number, recommendation: string}>}
 */
export function calculateBottlenecks(sectors) {
    if (!Array.isArray(sectors) || sectors.length === 0) return [];
    
    return sectors
        .filter(s => s.density > 65)
        .sort((a, b) => b.density - a.density)
        .map(s => ({
            sector: s.name,
            risk_score: Math.min(100, Math.round(s.density * 1.1)),
            eta_to_critical: Math.max(1, Math.round((100 - s.density) / 5)),
            recommendation: s.density > 85
                ? 'IMMEDIATE EVACUATION REQUIRED'
                : 'Monitor closely. Redirect foot traffic.',
        }));
}

/**
 * Determines the safest sector out of an array of sectors based on density.
 * 
 * @param {Array<{name: string, density: number}>} sectors - Array of sector metrics
 * @returns {{name: string, density: number} | null} The safest sector object
 */
export function findSafestEvacuationRoute(sectors) {
    if (!Array.isArray(sectors) || sectors.length === 0) return null;
    return sectors.reduce((a, b) => a.density < b.density ? a : b);
}
