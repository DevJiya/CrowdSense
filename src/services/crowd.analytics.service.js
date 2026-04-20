import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/ErrorCodes.js';

export const CrowdAnalyticsService = {
  /**
   * Predicts potential bottlenecks and computes overall venue risk based on sector densities.
   * @param {Array<{name: string, density: number}>} sectors - List of sector objects.
   * @returns {Object} Analysis results including bottlenecks, evacuation routes, and risk levels.
   * @throws {AppError} If sectors data is missing or invalid.
   */
  predictBottlenecks(sectors) {
    if (!sectors) {
      throw new AppError(
        'Sectors data is required for analytics',
        400,
        ErrorCodes.VALIDATION_ERROR,
      );
    }

    if (!Array.isArray(sectors) || sectors.length === 0) {
      throw new AppError('Sectors must be a non-empty array', 400, ErrorCodes.VALIDATION_ERROR);
    }

    const bottlenecks = sectors
      .filter((sectorData) => {
        if (!sectorData || typeof sectorData.density === 'undefined') {
          return false;
        }
        return sectorData.density > 80;
      })
      .map((sectorData) => ({
        location: sectorData.name || 'Unknown Sector',
        risk_level: sectorData.density > 90 ? 'CRITICAL' : 'HIGH',
        mitigation: sectorData.density > 90 ? 'Immediate Evacuation' : 'Deploy Crowd Marshals',
      }));

    // Find the safest evacuation route (lowest density)
    let safestSector = sectors[0];
    for (let index = 1; index < sectors.length; index++) {
      if (sectors[index].density < safestSector.density) {
        safestSector = sectors[index];
      }
    }

    if (!safestSector) {
      throw new AppError('Could not determine safest sector', 500, ErrorCodes.INTERNAL_ERROR);
    }

    const averageVenueDensity =
      sectors.reduce((sum, sectorData) => sum + (sectorData.density || 0), 0) / sectors.length;
    const overall_risk =
      averageVenueDensity > 75 ? 'CRITICAL' : averageVenueDensity > 40 ? 'ELEVATED' : 'NOMINAL';

    return {
      bottlenecks,
      evacuation_route: safestSector.name || 'Not Determined',
      overall_risk,
      timestamp: new Date().toISOString(),
    };
  },
};
