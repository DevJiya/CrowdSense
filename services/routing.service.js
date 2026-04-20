/**
 * Tactical Routing Service
 * Implements Dijkstra's algorithm with crowd-aware weight penalties.
 */
export const RoutingService = {
    /**
     * Computes the optimal evacuation or navigation path.
     * @param {Object} graph - Map of zones and connections.
     * @param {string} start - Starting node.
     * @param {string} goal - Destination node.
     * @param {Object} densityMap - Live density data per zone.
     * @param {string} mode - 'FASTEST', 'SAFEST', 'ACCESSIBLE'.
     */
    computeOptimalPath(graph, start, goal, densityMap, mode = 'FASTEST') {
        const distances = {};
        const prev = {};
        const nodes = new PriorityQueue();

        Object.keys(graph).forEach(node => {
            distances[node] = Infinity;
            prev[node] = null;
        });

        distances[start] = 0;
        nodes.enqueue(start, 0);

        while (!nodes.isEmpty()) {
            const { element: closestNode } = nodes.dequeue();

            if (closestNode === goal) break;

            graph[closestNode].forEach(neighbor => {
                const density = densityMap[neighbor.id] || 0;
                
                // CROWD-AWARE WEIGHT CALCULATION
                let weight = neighbor.distance;
                
                if (mode === 'SAFEST') {
                    weight += (density * 10); // Heavy penalty for high density
                } else if (mode === 'ACCESSIBLE') {
                    if (neighbor.isStairs) weight += 1000; // Impassable for accessible mode
                } else {
                    weight += (density * 2); // Moderate penalty for speed
                }

                const alt = distances[closestNode] + weight;
                if (alt < distances[neighbor.id]) {
                    distances[neighbor.id] = alt;
                    prev[neighbor.id] = closestNode;
                    nodes.enqueue(neighbor.id, alt);
                }
            });
        }

        return this.reconstructPath(prev, goal);
    },

    reconstructPath(prev, goal) {
        const path = [];
        let curr = goal;
        while (curr) {
            path.unshift(curr);
            curr = prev[curr];
        }
        return path;
    }
};

/**
 * Simple Priority Queue for Dijkstra
 */
class PriorityQueue {
    constructor() { this.items = []; }
    enqueue(element, priority) {
        this.items.push({ element, priority });
        this.items.sort((a, b) => a.priority - b.priority);
    }
    dequeue() { return this.items.shift(); }
    isEmpty() { return this.items.length === 0; }
}
