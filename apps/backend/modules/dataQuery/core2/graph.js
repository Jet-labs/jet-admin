// src/graph.js
class DependencyGraph {
  constructor() {
    this.graph = new Map(); // { queryId -> Set<queryId> }
  }

  addDependency(parentId, childId) {
    if (!this.graph.has(parentId)) {
      this.graph.set(parentId, new Set());
    }
    this.graph.get(parentId).add(childId);
  }

  getDependencies(queryId) {
    return this.graph.get(queryId) || new Set();
  }

  getAllNodes() {
    return Array.from(this.graph.keys());
  }

  detectCycles() {
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (node) => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      for (const neighbor of this.getDependencies(node)) {
        if (hasCycle(neighbor)) return true;
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of this.getAllNodes()) {
      if (hasCycle(node)) return true;
    }
    return false;
  }
}

module.exports = { DependencyGraph };
