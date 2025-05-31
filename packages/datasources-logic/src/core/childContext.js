// packages/datasources-logic/src/core/ChildContext.js
import { Logger } from "../utils/logger";

export default class ChildContext {
  constructor(parentContext, parameters = {}) {
    this.parent = parentContext;
    this.parameters = parameters;
    this.localVariables = new Map();
    this.localResults = new Map();
    Logger.log("info", {
      message: "ChildContext:constructor",
      params: { parameters, parentId: parentContext.instanceId },
    });
  }

  // Variable Management
  getVariable(name) {
    // 1. Check local variables
    if (this.localVariables?.has(name)) {
      Logger.log("info", {
        message: "ChildContext:getVariable:local",
        params: { name, instanceId: this.instanceId },
      });
      return this.localVariables.get(name);
    }

    // 2. Check parameters passed to this context
    if (this.parameters?.hasOwnProperty(name)) {
      Logger.log("info", {
        message: "ChildContext:getVariable:parameters",
        params: { name, instanceId: this.instanceId },
      });
      return this.parameters[name];
    }

    // 3. Check parent context
    Logger.log("info", {
      message: "ChildContext:getVariable:parent",
      params: { name, instanceId: this.instanceId },
    });
    return this.parent.getVariable(name);
  }

  setVariable(name, value) {
    // Set only in local context (doesn't affect parent)
    this.localVariables.set(name, value);
    Logger.log("info", {
      message: "ChildContext:setVariable",
      params: { name, value, instanceId: this.instanceId },
    });
  }

  // Result Management
  setResult(queryId, result, params = {}) {
    // Store only in local context
    const id = Number(queryId);
    const paramKey = this.getParameterKey(params);

    if (!this.localResults?.has(id)) {
      this.localResults.set(id, new Map());
    }

    this.localResults.get(id).set(paramKey, result);

    Logger.log("info", {
      message: "ChildContext:setResult",
      params: {
        queryId: id,
        params,
        result,
        instanceId: this.instanceId,
        allResults: this.getResultsSnapshot(),
      },
    });
  }

  getResult(queryId, params = {}) {
    const id = Number(queryId);
    const paramKey = this.getParameterKey(params);

    // Check local results first
    if (this.localResults?.has(id) && this.localResults?.get(id)?.has(paramKey)) {
      return this.localResults.get(id).get(paramKey);
    }

    // Fall back to parent context
    return this.parent.getResult(id, params);
  }

  hasResult(queryId, params = {}) {
    const id = Number(queryId);
    const paramKey = this.getParameterKey(params);

    // Check local results
    if (this.localResults?.has(id) && this.localResults?.get(id)?.has(paramKey)) {
      return true;
    }

    // Check parent context
    return this.parent.hasResult(id, params);
  }

  // Helper Methods
  getParameterKey(parameters) {
    return JSON.stringify(Object.entries(parameters).sort());
  }

  // Context Inspection
  getExecutionState() {
    return {
      localVariables: Object.fromEntries(this.localVariables),
      parameters: this.parameters,
      parentState: this.parent.getExecutionState(),
    };
  }

  // Access to parent's instance ID for debugging
  get instanceId() {
    return `child-of-${this.parent.instanceId}`;
  }
}
