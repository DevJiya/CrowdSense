/**
 * @module CrowdAnalyticsServiceTest
 * @description Unit tests for the backend analytics engine, verifying bottleneck
 * prediction and risk scoring logic.
 */

import { CrowdAnalyticsService } from '../../../src/services/crowd.analytics.service.js';
import { AppError } from '../../../src/errors/AppError.js';

describe('CrowdAnalyticsService', () => {
  const mockSectors = [
    { name: 'Gate A', density: 30 },
    { name: 'Gate B', density: 85 }, // High
    { name: 'Gate C', density: 95 }, // Critical
  ];

  test('should correctly identify bottlenecks and mitigation strategies', () => {
    const results = CrowdAnalyticsService.predictBottlenecks(mockSectors);

    expect(results.bottlenecks).toHaveLength(2);
    expect(results.bottlenecks[0]).toEqual({
      location: 'Gate B',
      risk_level: 'HIGH',
      mitigation: 'Deploy Crowd Marshals',
    });
    expect(results.bottlenecks[1]).toEqual({
      location: 'Gate C',
      risk_level: 'CRITICAL',
      mitigation: 'Immediate Evacuation',
    });
  });

  test('should identify the safest evacuation route', () => {
    const results = CrowdAnalyticsService.predictBottlenecks(mockSectors);
    expect(results.evacuation_route).toBe('Gate A');
  });

  test('should calculate overall risk correctly', () => {
    // Avg density: (30+85+95)/3 = 70 -> ELEVATED
    const results = CrowdAnalyticsService.predictBottlenecks(mockSectors);
    expect(results.overall_risk).toBe('ELEVATED');

    const lowDensity = [{ name: 'A', density: 10 }];
    expect(CrowdAnalyticsService.predictBottlenecks(lowDensity).overall_risk).toBe('NOMINAL');

    const highDensity = [{ name: 'A', density: 90 }];
    expect(CrowdAnalyticsService.predictBottlenecks(highDensity).overall_risk).toBe('CRITICAL');
  });

  test('should throw AppError for invalid inputs', () => {
    expect(() => CrowdAnalyticsService.predictBottlenecks(null)).toThrow(AppError);
    expect(() => CrowdAnalyticsService.predictBottlenecks([])).toThrow(AppError);
  });
});
