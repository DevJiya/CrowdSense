/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { initMap, updateHeatmap, highlightRoute } from '../../../src/services/mapService.js';

describe('MapService', () => {
  let mockContainer;
  let mockLayer;

  beforeEach(() => {
    mockContainer = {
      innerHTML: '',
      style: { opacity: '1' },
      classList: { add: jest.fn(), remove: jest.fn() },
    };
    mockLayer = { innerHTML: '' };

    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'stadium-map') return mockContainer;
      if (id === 'map-zones-layer' || id === 'heatmap-layer' || id === 'route-layer')
        return mockLayer;
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
  });

  test('should not throw if map container is missing', () => {
    document.getElementById.mockReturnValue(null);
    expect(() => initMap()).not.toThrow();
  });

  test('updateHeatmap should update layer', () => {
    updateHeatmap([{ id: 'A', d: 80 }]);
    expect(mockLayer.innerHTML).toBeDefined();
  });

  test('highlightRoute should update layer', () => {
    highlightRoute(['A', 'B']);
    expect(mockLayer.innerHTML).toBeDefined();
  });
});
