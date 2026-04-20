/**
 * Service for crowd analytics and risk prediction.
 * Contains core algorithms for identifying bottlenecks and safety risks.
 */
export const CrowdAnalyticsService = {
    /**
     * Predicts potential bottlenecks based on sector density data.
     * 
     * @param {Array<Object>} sectors - List of sector data objects.
     * @param {string} sectors[].name - Name of the sector.
     * @param {number} sectors[].density - Current density percentage.
     * @returns {Object} Analytical report containing bottlenecks, evacuation routes, and overall risk.
     */
    predictBottlenecks(sectors) {
        const bottlenecks = sectors
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

        const safestSector = sectors.reduce((a, b) => a.density < b.density ? a : b);

        return {
            bottlenecks,
            evacuation_route: safestSector.name,
            overall_risk: bottlenecks.length > 0 ? 'HIGH' : 'NOMINAL',
        };
    }
};
