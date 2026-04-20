/**
 * @module PriorityQueue
 * @description A basic Min-Priority Queue implementation for efficient Dijkstra pathfinding.
 */
export class PriorityQueue {
  constructor() {
    this.values = [];
  }

  /**
   * Adds an element to the queue with a priority.
   * @param {*} val - The element to add.
   * @param {number} priority - The priority of the element.
   */
  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }

  /**
   * Removes and returns the element with the lowest priority.
   * @returns {*}
   */
  dequeue() {
    return this.values.shift();
  }

  /**
   * Sorts the queue. (Simple O(N log N) implementation for this tactical demo).
   * @private
   */
  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Checks if the queue is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.values.length === 0;
  }
}
