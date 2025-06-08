const Logger = require("../../../utils/logger");

// childContext.js
class ChildContext {
  constructor(parentContext, parameters = {}) {
    this.parent = parentContext;
    this.parameters = parameters;
    this.localVariables = new Map();
    this.localResults = new Map();
    this.instanceId = `child-${Math.random().toString(36).substr(2, 6)}`;
    Logger.log("info", {
      message: "ChildContext:constructor",
      params: { parameters, parentId: parentContext.instanceId },
    });
  }

  getVariable(name) {
    if (this.localVariables?.has(name)) {
      Logger.log("info", {
        message: "ChildContext:getVariable:local",
        params: { name, instanceId: this.instanceId },
      });
      return this.localVariables.get(name);
    }

    if (this.parameters?.hasOwnProperty(name)) {
      Logger.log("info", {
        message: "ChildContext:getVariable:parameters",
        params: { name, instanceId: this.instanceId },
      });
      return this.parameters[name];
    }

    Logger.log("info", {
      message: "ChildContext:getVariable:parent",
      params: { name, instanceId: this.instanceId },
    });

    return this.parent.getVariable(name);
  }

  setVariable(name, value) {
    this.localVariables.set(name, value);
    Logger.log("info", {
      message: "ChildContext:setVariable",
      params: { name, value, instanceId: this.instanceId },
    });
  }

  setResult(queryId, result, params = {}) {
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

    if (
      this.localResults?.has(id) &&
      this.localResults.get(id)?.has(paramKey)
    ) {
      return this.localResults.get(id).get(paramKey);
    }

    return this.parent.getResult(id, params);
  }

  hasResult(queryId, params = {}) {
    const id = Number(queryId);
    const paramKey = this.getParameterKey(params);

    return (
      (this.localResults?.has(id) &&
        this.localResults.get(id)?.has(paramKey)) ||
      this.parent.hasResult(id, params)
    );
  }

  getParameterKey(parameters) {
    return JSON.stringify(Object.entries(parameters).sort());
  }

  getExecutionState() {
    return {
      localVariables: Object.fromEntries(this.localVariables),
      parameters: this.parameters,
      parentState: this.parent.getExecutionState(),
    };
  }

  get instanceId() {
    return `child-of-${this.parent.instanceId}`;
  }

  set instanceId(value) {
    this.parent.instanceId = value;
  }

  getResultsSnapshot() {
    return Array.from(this.localResults.entries()).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }

}

module.exports = { ChildContext };
