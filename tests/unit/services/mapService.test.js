/**
 * @jest-environment jsdom
 */

/**
 * @module MapServiceTest
 * @description Unit tests for the Map Visualizer, ensuring SVG generation and zone updates.
 */

import { jest } from '@jest/globals';
import { initMap } from '../../../src/services/mapService.js';

describe('MapService', () => {
  let mockContainer;

  beforeEach(() => {
    // Setup Mock DOM
    mockContainer = {
      innerHTML: '',
      style: { opacity: '1' },
    };
    const mockLayer = { innerHTML: '' };
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'stadium-map') return mockContainer;
      if (id === 'map-zones-layer') return mockLayer;
      return null;
    });

    window.GLOBAL_STATE = {
      zones: {
        'gate-a': { name: 'Gate A', status: 'SAFE', density: 20 },
      },
    };
  });

  test('initMap should initialize SVG structure', () => {
    initMap();
    expect(mockContainer.innerHTML).toContain('<svg');
    expect(mockContainer.innerHTML).toContain('CENTRE FIELD');
  });

  test('should not throw if map container is missing', () => {
    document.getElementById.mockReturnValue(null);
    expect(() => initMap()).not.toThrow();
  });
});
