import { Logger } from "../utils/logger";

export default class ContextManager {
  constructor() {
    this.context = new Map();
    this.variables = new Map();
  }

  setResult(queryId, result) {
    this.context.set(queryId, result);
  }

  getResult(queryId) {
    return this.context.get(queryId);
  }

  hasResult(queryId) {
    return this.context.has(queryId);
  }

  setVariable(name, value) {
    this.variables.set(name, value);
  }

  getVariable(name) {
    if (!this.variables.has(name)) {
      throw new Error(`Context variable not found: ${name}`);
    }
    return this.variables.get(name);
  }

  getExecutionState() {
    return {
      results: Object.fromEntries(this.context),
      variables: Object.fromEntries(this.variables),
    };
  }
}
