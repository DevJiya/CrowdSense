import { RoutingService } from '../../../src/services/routing.service.js';

describe('RoutingService', () => {
  const mockGraph = {
    A: { B: 5, C: 2 },
    B: { D: 4 },
    C: { B: 1, D: 10 },
    D: {},
  };

  it('should find the shortest path in a simple graph', async () => {
    const path = await RoutingService.computeOptimalPath(mockGraph, 'A', 'D');
    expect(path).toEqual(['A', 'C', 'B', 'D']);
  });

  it('should handle unreachable destinations', async () => {
    const path = await RoutingService.computeOptimalPath(mockGraph, 'A', 'E');
    expect(path).toEqual([]);
  });

  it('should handle invalid or broken graph nodes', async () => {
    const brokenGraph = { A: { B: 10 }, B: null };
    const path = await RoutingService.computeOptimalPath(brokenGraph, 'A', 'B');
    expect(path).toEqual(['A', 'B']);
  });

  it('should handle same start and end', async () => {
    const path = await RoutingService.computeOptimalPath(mockGraph, 'A', 'A');
    expect(path).toEqual(['A']);
  });

  it('should handle empty or null graph', async () => {
    expect(await RoutingService.computeOptimalPath(null, 'A', 'B')).toEqual([]);
    expect(await RoutingService.computeOptimalPath({}, 'A', 'B')).toEqual([]);
  });
});
