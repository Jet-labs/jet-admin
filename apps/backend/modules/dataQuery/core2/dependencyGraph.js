// dependencyGraph.js
const Logger = require("../../../utils/logger.js");

class DependencyGraph {
  constructor() {
    this.graph = new Map(); // Stores query nodes with dependencies
    this.instanceId = `depgraph-${Math.random().toString(36).substr(2, 6)}`;
    Logger.log("info", {
      message: "DependencyGraph:constructor",
      params: { instanceId: this.instanceId },
    });
  }

  /**
   * Add a query node to the graph
   * @param {Object} query - Query object with dataQueryID
   */
  addNode(query) {
    const queryId = query.dataQueryID;
    if (!this.graph.has(queryId)) {
      this.graph.set(queryId, {
        id: queryId,
        dependencies: new Set(),
        query,
      });
      Logger.log("info", {
        message: "DependencyGraph:addNode",
        params: { queryId, instanceId: this.instanceId },
      });
    }
  }

  /**
   * Add a dependency relationship
   * @param {number} fromId - Dependent query ID
   * @param {number} toId - Required query ID
   */
  addDependency(fromId, toId) {
    const fromQuery = this.graph.get(fromId);
    const toQuery = this.graph.get(toId);

    if (!fromQuery) {
      Logger.log("error", {
        message: "DependencyGraph:addDependency:missingFromQuery",
        params: { fromId, toId, instanceId: this.instanceId },
      });
      throw new Error(`Query ${fromId} not found in graph`);
    }

    if (!toQuery) {
      Logger.log("error", {
        message: "DependencyGraph:addDependency:missingToQuery",
        params: { fromId, toId, instanceId: this.instanceId },
      });
      throw new Error(`Query ${toId} not found in graph`);
    }

    if (fromId === toId) {
      Logger.log("warn", {
        message: "DependencyGraph:addDependency:selfDependency",
        params: { queryId: fromId, instanceId: this.instanceId },
      });
      return; // Skip self-references
    }

    if (!fromQuery.dependencies.has(toId)) {
      fromQuery.dependencies.add(toId);
      Logger.log("info", {
        message: "DependencyGraph:addDependency",
        params: {
          fromId,
          toId,
          instanceId: this.instanceId,
          dependencies: Array.from(fromQuery.dependencies),
        },
      });
    }
  }

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies() {
    const visited = new Set();
    const recursionStack = new Set();

    const visit = (nodeId) => {
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = this.graph.get(nodeId);
      for (const depId of node.dependencies) {
        if (!visited.has(depId)) {
          if (visit(depId)) return true;
        } else if (recursionStack.has(depId)) {
          Logger.log("error", {
            message: "DependencyGraph:detectCircularDependencies:cycleFound",
            params: { nodeId, depId, instanceId: this.instanceId },
          });
          throw new Error(
            `Circular dependency detected: ${nodeId} -> ${depId}`
          );
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.graph.keys()) {
      if (visit(nodeId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get independent queries (no incoming edges)
   */
  getIndependentQueries() {
    const allDeps = new Set();
    this.graph.forEach((node) =>
      node.dependencies.forEach((dep) => allDeps.add(dep))
    );

    const independent = [];
    this.graph.forEach((_, nodeId) => {
      if (!allDeps.has(nodeId)) {
        independent.push(nodeId);
      }
    });

    Logger.log("info", {
      message: "DependencyGraph:getIndependentQueries",
      params: {
        independentQueries: independent,
        instanceId: this.instanceId,
      },
    });

    return independent;
  }

  /**
   * Topological sort to determine execution order
   */
  getExecutionOrder() {
    const visited = new Set();
    const order = [];

    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      const node = this.graph.get(nodeId);
      for (const depId of node.dependencies) {
        visit(depId);
      }
      order.push(nodeId);
    };

    try {
      for (const nodeId of this.graph.keys()) {
        visit(nodeId);
      }

      const executionOrder = order.reverse();

      Logger.log("info", {
        message: "DependencyGraph:getExecutionOrder",
        params: {
          executionOrder,
          instanceId: this.instanceId,
        },
      });

      return executionOrder;
    } catch (error) {
      Logger.log("error", {
        message: "DependencyGraph:getExecutionOrder:error",
        params: {
          error: error.message,
          instanceId: this.instanceId,
        },
      });
      throw error;
    }
  }

  /**
   * Get all query IDs in the graph
   */
  getAllQueryIds() {
    return Array.from(this.graph.keys());
  }

  /**
   * Get direct dependencies for a query
   */
  getDirectDependencies(queryId) {
    const node = this.graph.get(queryId);
    return node ? Array.from(node.dependencies) : [];
  }

  /**
   * Get full dependency tree for a query
   */
  getDependencyTree(queryId) {
    const tree = {};
    const buildTree = (id) => {
      const node = this.graph.get(id);
      if (!node) return {};
      tree[id] = {};
      node.dependencies.forEach((depId) => {
        tree[id][depId] = buildTree(depId);
      });
      return tree;
    };

    return buildTree(queryId);
  }
}

module.exports = { DependencyGraph };
