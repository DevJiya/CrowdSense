/**
 * @module RoutingService
 * @description Tactical Routing Service implementing Dijkstra's algorithm with crowd-aware weight penalties.
 * It computes optimal paths based on distance, safety (density), and accessibility.
 *
 * Algorithm Explanation:
 * Dijkstra's algorithm finds the shortest path between nodes in a graph.
 * This implementation enhances the standard algorithm by injecting real-time crowd density
 * into the edge weight calculation, effectively avoiding bottlenecks.
 *
 * Time Complexity: O((V + E) log V) where V is vertices (zones) and E is edges (connections).
 * Space Complexity: O(V) to store distances and priority queue nodes.
 *
 * Crowd-Aware Weight Formula:
 * Weight = BaseDistance + (CrowdDensity * ModeMultiplier)
 * - SAFEST Mode: Multiplier = 10 (Heavy penalty for high density)
 * - FASTEST Mode: Multiplier = 2 (Moderate penalty for speed)
 * - ACCESSIBLE Mode: Stairs are assigned a near-infinite weight (1000) to ensure pathfinding avoids them.
 */

export const RoutingService = {
  /**
   * Computes the optimal evacuation or navigation path between two points.
   * @param {Object<string, Array<{id: string, distance: number, isStairs: boolean}>>} graph -
   * Adjacency list format where keys are zone IDs and values are arrays of connection objects.
   * @param {string} startNodeId - The unique ID of the starting zone.
   * @param {string} goalNodeId - The unique ID of the destination zone.
   * @param {Object<string, number>} densityMap - Live density percentages (0-100) per zone ID.
   * @param {'FASTEST' | 'SAFEST' | 'ACCESSIBLE'} [mode='FASTEST'] - Routing priority mode.
   * @returns {string[]} An array of zone IDs representing the optimal path.
   * @example
   * const path = RoutingService.computeOptimalPath(stadiumGraph, 'gate-a', 'section-101', { 'gate-a': 20 }, 'SAFEST');
   */
  computeOptimalPath(graph, startNodeId, goalNodeId, densityMap, mode = 'FASTEST') {
    const distances = {};
    const previousNodes = {};
    const nodesQueue = new PriorityQueue();

    Object.keys(graph).forEach((nodeId) => {
      distances[nodeId] = Infinity;
      previousNodes[nodeId] = null;
    });

    distances[startNodeId] = 0;
    nodesQueue.enqueue(startNodeId, 0);

    while (!nodesQueue.isEmpty()) {
      const { element: closestNode } = nodesQueue.dequeue();

      if (closestNode === goalNodeId) {
        break;
      }

      if (!graph[closestNode]) {
        continue;
      }

      graph[closestNode].forEach((neighbor) => {
        const neighborDensity = densityMap[neighbor.id] || 0;

        // CROWD-AWARE WEIGHT CALCULATION
        let edgeWeight = neighbor.distance;

        if (mode === 'SAFEST') {
          edgeWeight += neighborDensity * 10; // Heavy penalty for high density
        } else if (mode === 'ACCESSIBLE') {
          if (neighbor.isStairs) {
            edgeWeight += 1000;
          } // Impassable for accessible mode
        } else {
          edgeWeight += neighborDensity * 2; // Moderate penalty for speed
        }

        const alternativePathDistance = distances[closestNode] + edgeWeight;
        if (alternativePathDistance < distances[neighbor.id]) {
          distances[neighbor.id] = alternativePathDistance;
          previousNodes[neighbor.id] = closestNode;
          nodesQueue.enqueue(neighbor.id, alternativePathDistance);
        }
      });
    }

    return this.reconstructPath(previousNodes, goalNodeId);
  },

  /**
   * Reconstructs the path from the goal back to the start using the previousNodes map.
   * @param {Object<string, string>} previousNodes - Map of node ID to its predecessor.
   * @param {string} goalNodeId - Destination node ID.
   * @returns {string[]} Array of node IDs in sequence.
   */
  reconstructPath(previousNodes, goalNodeId) {
    const path = [];
    let currentNode = goalNodeId;
    while (currentNode) {
      path.unshift(currentNode);
      currentNode = previousNodes[currentNode];
    }
    return path;
  },
};

/**
 * Simple Priority Queue for Dijkstra's algorithm.
 */
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  /**
   * Adds an element to the queue with a priority.
   * @param {any} element - The data to store.
   * @param {number} priority - Lower values represent higher priority.
   */
  enqueue(element, priority) {
    this.items.push({ element, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Removes and returns the highest priority element.
   * @returns {{element: any, priority: number}}
   */
  dequeue() {
    return this.items.shift();
  }

  /**
   * Checks if the queue is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.items.length === 0;
  }
}
