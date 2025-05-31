const Logger = require("../../../utils/logger.js");

class ContextManager {
  constructor() {
    this.results = new Map(); // Stores query results
    this.parameterizedResults = new Map(); // Stores parameterized query results
    this.variables = new Map(); // Stores context variables
    this.instanceId = Math.random().toString(36).substr(2, 6);
    Logger.log("info", {
      message: "ContextManager:constructor",
      params: { instanceId: this.instanceId },
    });
  }

  setResult(queryId, result, parameters = {}) {
    const id = Number(queryId);
    const paramKey = this.getParameterKey(parameters);

    // Store parameterized results separately
    if (Object.keys(parameters).length > 0) {
      if (!this.parameterizedResults?.has(id)) {
        this.parameterizedResults.set(id, new Map());
      }
      this.parameterizedResults.get(id).set(paramKey, result);
    } else {
      // Store non-parameterized results
      this.results.set(id, result);
    }

    Logger.log("info", {
      message: "ContextManager:setResult",
      params: {
        queryId: id,
        parameters,
        result,
        instanceId: this.instanceId,
        allResults: this.getResultsSnapshot(),
      },
    });
  }

  getResult(queryId, parameters = {}) {
    const id = Number(queryId);
    const paramKey = this.getParameterKey(parameters);

    // First check parameterized results
    if (
      Object.keys(parameters).length > 0 &&
      this.parameterizedResults?.has(id) &&
      this.parameterizedResults.get(id)?.has(paramKey)
    ) {
      return this.parameterizedResults.get(id).get(paramKey);
    }

    // Then check non-parameterized results
    if (this.results?.has(id)) {
      return this.results.get(id);
    }

    Logger.log("error", {
      message: "ContextManager:getResult:notFound",
      params: {
        queryId: id,
        parameters,
        availableResults: this.getResultsSnapshot(),
        instanceId: this.instanceId,
      },
    });

    throw new Error(
      `Result not found for query ${id} with parameters ${JSON.stringify(
        parameters
      )}`
    );
  }

  hasResult(queryId, parameters = {}) {
    const id = Number(queryId);
    const paramKey = this.getParameterKey(parameters);

    // Check parameterized results
    if (Object.keys(parameters).length > 0) {
      return (
        this.parameterizedResults?.has(id) &&
        this.parameterizedResults?.get(id)?.has(paramKey)
      );
    }

    // Check non-parameterized results
    return this.results?.has(id);
  }

  getResultsSnapshot() {
    return Array.from(this.results.entries()).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }

  getParameterKey(parameters) {
    // Create a stable key for parameters
    return JSON.stringify(Object.entries(parameters).sort());
  }

  setVariable(name, value) {
    this.variables.set(name, value);
  }

  getVariable(name) {
    Logger.log("info", {
      message: "ContextManager:getVariable",
      params: {
        name,
        instanceId: this.instanceId,
        value: this.variables.get(name),
      },
    });
    if (
      this.variables.has(name) === null ||
      this.variables.has(name) === undefined
    ) {
      throw new Error(`Context variable not found: ${name}`);
    }
    return this.variables.get(name);
  }

  getExecutionState() {
    return {
      results: this.results?.size > 0 ? Object.fromEntries(this.results) : {},
      parameterizedResults:
        this.parameterizedResults?.size > 0 && this.context
          ? Object.fromEntries(this.context)
          : {},
      variables:
        this.variables?.size > 0 ? Object.fromEntries(this.variables) : {},
    };
  }
}

module.exports = { ContextManager };
