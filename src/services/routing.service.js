import { PriorityQueue } from '../utils/PriorityQueue.js';

/**
 * @module RoutingService
 * @description Provides optimized pathfinding for crowd evacuation and navigation.
 * Uses an enhanced Dijkstra algorithm with a PriorityQueue for maximum efficiency.
 */
export const RoutingService = {
  /**
   * Computes the optimal tactical path between two points in a weighted graph.
   * @async
   * @param {Object} tacticalGraph - The adjacency list representing the stadium topology.
   * @param {string} startNode - The origin node ID.
   * @param {string} endNode - The destination node ID.
   * @returns {Promise<string[]>} An array of node IDs representing the optimal path.
   */
  async computeOptimalPath(tacticalGraph, startNode, endNode) {
    if (!tacticalGraph || !startNode || !endNode) {
      return [];
    }
    if (startNode === endNode) {
      return [startNode];
    }

    const distances = {};
    const pq = new PriorityQueue();
    const previous = {};
    const path = [];
    let smallest;

    // Initialize state
    for (const node in tacticalGraph) {
      if (node === startNode) {
        distances[node] = 0;
        pq.enqueue(node, 0);
      } else {
        distances[node] = Infinity;
        pq.enqueue(node, Infinity);
      }
      previous[node] = null;
    }

    while (!pq.isEmpty()) {
      smallest = pq.dequeue().val;

      if (smallest === endNode) {
        while (previous[smallest]) {
          path.push(smallest);
          smallest = previous[smallest];
        }
        break;
      }

      if (smallest || distances[smallest] !== Infinity) {
        for (const neighbor in tacticalGraph[smallest]) {
          const nextNode = tacticalGraph[smallest][neighbor];
          if (!nextNode) {
            continue;
          }

          // Calculate new distance (edge weight)
          const candidate = distances[smallest] + nextNode;
          const neighborId = neighbor;

          if (candidate < distances[neighborId]) {
            distances[neighborId] = candidate;
            previous[neighborId] = smallest;
            pq.enqueue(neighborId, candidate);
          }
        }
      }
    }

    return path.concat(startNode).reverse();
  },
};
