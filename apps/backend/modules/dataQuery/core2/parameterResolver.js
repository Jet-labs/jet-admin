const { ASTParser } = require("./astParser");

// parameterResolver.js
class ParameterResolver {
  constructor(context, queryExecutor) {
    this.context = context;
    this.queryExecutor = queryExecutor;
    this.parser = new ASTParser();
    this.MAX_DEPTH = 10;
  }

  async resolveNode(node, depth = 0) {
    if (depth > this.MAX_DEPTH) {
      this._logError("resolveNode:maxDepth", { depth });
      throw new Error("Max resolution depth exceeded");
    }

    switch (node.type) {
      case "Literal":
        return node.value;

      case "Identifier":
        return this._resolveIdentifier(node, depth);

      case "ObjectExpression":
        return this._resolveObject(node, depth);

      case "ArrayExpression":
        return this._resolveArray(node, depth);

      case "MemberExpression":
        return this._resolveMember(node, depth);

      case "CallExpression":
        if (node.callee.name === "query") {
          return this._resolveQueryCall(node, depth);
        }
        this._logError("resolveNode:unsupportedCall", {
          callee: node.callee.name,
        });
        throw new Error(`Unsupported CallExpression: ${node.callee.name}`);

      default:
        this._logError("resolveNode:unsupportedType", { type: node.type });
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  }

  _resolveIdentifier(node, depth) {
    const value = this.context.getVariable(node.name);
    this._logInfo("resolveNode:identifier", {
      name: node.name,
      value: typeof value === "object" ? "[Object]" : value,
    });
    return value;
  }

  async _resolveObject(node, depth) {
    const obj = {};

    for (const prop of node.properties) {
      const key = this._getPropertyKey(prop.key);
      obj[key] = await this.resolveNode(prop.value, depth + 1);
    }

    return obj;
  }

  _getPropertyKey(keyNode) {
    if (keyNode.type === "Literal") return keyNode.value;
    if (keyNode.type === "Identifier") return keyNode.name;
    return null;
  }

  async _resolveArray(node, depth) {
    return Promise.all(
      node.elements.map((el) => this.resolveNode(el, depth + 1))
    );
  }

  async _resolveMember(node, depth) {
    const object = await this.resolveNode(node.object, depth + 1);
    const property = node.computed
      ? await this.resolveNode(node.property, depth + 1)
      : node.property.name;

    this._logDebug("resolveNode:member", {
      object: typeof object === "object" ? object : "primitive",
      property,
    });

    return object?.[property];
  }

  async _resolveQueryCall(node, depth) {
    const queryId = node.arguments[0].value;
    let params = {};

    if (node.arguments[1]) {
      params = await this.resolveNode(node.arguments[1], depth + 1);
    }

    this._logInfo("resolveNode:queryCall", { queryId, params });

    return this.queryExecutor.executeQuery(queryId, params);
  }

  _logInfo(method, params) {
    Logger.log("info", {
      message: `ParameterResolver:${method}`,
      params,
    });
  }

  _logError(method, params) {
    Logger.log("error", {
      message: `ParameterResolver:${method}`,
      params,
    });
  }

  _logDebug(method, params) {
    Logger.log("debug", {
      message: `ParameterResolver:${method}`,
      params,
    });
  }
}

module.exports = { ParameterResolver };
