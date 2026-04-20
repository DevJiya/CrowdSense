/**
 * @module RoutingServiceTest
 * @description Unit tests for the Dijkstra routing engine, verifying pathfinding accuracy,
 * crowd-aware weighting, and accessibility constraints.
 */

import { RoutingService } from '../../../src/services/routing.service.js';

describe('RoutingService (Dijkstra Engine)', () => {
  const simpleGraph = {
    A: [
      { id: 'B', distance: 10, isStairs: false },
      { id: 'C', distance: 20, isStairs: false },
    ],
    B: [
      { id: 'D', distance: 10, isStairs: false },
      { id: 'E', distance: 50, isStairs: false },
    ],
    C: [{ id: 'D', distance: 10, isStairs: false }],
    D: [{ id: 'E', distance: 10, isStairs: false }],
    E: [],
  };

  const emptyDensity = { A: 0, B: 0, C: 0, D: 0, E: 0 };

  test('should find the shortest path on a simple 5-node graph', () => {
    const path = RoutingService.computeOptimalPath(simpleGraph, 'A', 'E', emptyDensity, 'FASTEST');
    expect(path).toEqual(['A', 'B', 'D', 'E']);
  });

  test('should avoid high-density zones in SAFEST mode', () => {
    // Path A -> B -> D -> E is 10+10+10 = 30
    // Path A -> C -> D -> E is 20+10+10 = 40
    // If B is high density (90%), SAFEST mode adds (90 * 10) = 900 to A -> B
    const highDensityB = { ...emptyDensity, B: 90 };
    const path = RoutingService.computeOptimalPath(simpleGraph, 'A', 'E', highDensityB, 'SAFEST');
    expect(path).toEqual(['A', 'C', 'D', 'E']);
  });

  test('should avoid stairs in ACCESSIBLE mode', () => {
    const stairGraph = {
      A: [
        { id: 'B', distance: 5, isStairs: true }, // Short but stairs
        { id: 'C', distance: 20, isStairs: false }, // Long but flat
      ],
      B: [{ id: 'D', distance: 5, isStairs: false }],
      C: [{ id: 'D', distance: 5, isStairs: false }],
      D: [],
    };
    const path = RoutingService.computeOptimalPath(
      stairGraph,
      'A',
      'D',
      emptyDensity,
      'ACCESSIBLE',
    );
    expect(path).toEqual(['A', 'C', 'D']);
  });

  test('should handle disconnected graphs gracefully', () => {
    const disconnectedGraph = {
      A: [{ id: 'B', distance: 10, isStairs: false }],
      C: [{ id: 'D', distance: 10, isStairs: false }],
    };
    const path = RoutingService.computeOptimalPath(disconnectedGraph, 'A', 'D', emptyDensity);
    expect(path).toEqual(['D']); // Only the goal is returned if unreachable
  });

  test('should handle single-node graph', () => {
    const singleNodeGraph = { A: [] };
    const path = RoutingService.computeOptimalPath(singleNodeGraph, 'A', 'A', emptyDensity);
    expect(path).toEqual(['A']);
  });

  test('should handle destination same as source', () => {
    const path = RoutingService.computeOptimalPath(simpleGraph, 'A', 'A', emptyDensity);
    expect(path).toEqual(['A']);
  });

  test('performance: should resolve a 50-node path in < 50ms', () => {
    const largeGraph = {};
    for (let i = 0; i < 50; i++) {
      largeGraph[`node-${i}`] = [{ id: `node-${i + 1}`, distance: 1, isStairs: false }];
    }

    const start = performance.now();
    RoutingService.computeOptimalPath(largeGraph, 'node-0', 'node-49', {});
    const end = performance.now();

    expect(end - start).toBeLessThan(50);
  });
});
