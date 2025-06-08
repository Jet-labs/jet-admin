class DependencyGraph {
  constructor() {
    this.graph = new Map();
  }

  addNode(query) {
    this.graph.set(query.dataQueryID, {
      query,
      dependencies: new Set(),
    });
  }

  addDependency(fromId, toId) {
    if (!this.graph?.has(parseInt(fromId))) {
      throw new Error(`Query ${fromId} not found in graph`);
    }
    this.graph?.get(parseInt(fromId)).dependencies?.add(toId);
  }

  detectCircularDependencies() {
    const visited = new Set();
    const recursionStack = new Set();

    const visit = (nodeId) => {
      if (!visited?.has(nodeId)) {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        const node = this.graph.get(nodeId);
        for (const depId of node.dependencies) {
          if (!visited?.has(depId)) {
            if (visit(depId)) return true;
          } else if (recursionStack?.has(depId)) {
            return true;
          }
        }
      }
      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.graph.keys()) {
      if (visit(nodeId)) {
        throw new Error(
          `Circular dependency detected involving query ${nodeId}`
        );
      }
    }
    return false;
  }

  getExecutionOrder() {
    const visited = new Set();
    const order = [];
    const visit = (nodeId) => {
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        const node = this.graph.get(nodeId);
        for (const depId of node.dependencies) {
          visit(depId);
        }
        order.push(nodeId);
      }
    };
    for (const nodeId of this.graph.keys()) {
      visit(nodeId);
    }
    return order.reverse();
  }

  getIndependentQueries() {
    const allDependencies = new Set();
    this.graph.forEach((node) => {
      node.dependencies.forEach((depId) => allDependencies.add(depId));
    });

    const independent = [];
    this.graph.forEach((_, nodeId) => {
      if (!allDependencies.has(nodeId)) {
        independent.push(nodeId);
      }
    });
    return independent;
  }
}

module.exports = { DependencyGraph };