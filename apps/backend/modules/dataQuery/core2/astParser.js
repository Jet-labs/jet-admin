// astParser.js
const acorn = require("acorn");

class ASTParser {
  constructor() {
    this.PLACEHOLDER_REGEX = /\$\{([^}]+)\}/g;
  }

  parseExpression(expression) {
    try {
      return acorn.parse(expression, {
        ecmaVersion: 2020,
        sourceType: "module",
      }).body[0]?.expression;
    } catch (error) {
      Logger.log("error", {
        message: "ASTParser:parseExpression:error",
        params: { expression, error: error.message },
      });
      throw error;
    }
  }

  extractDependencies(ast) {
    const dependencies = [];

    // Manual AST walker
    function walk(node) {
      if (!node) return;

      if (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "query"
      ) {
        const queryId = node.arguments[0]?.value;
        const paramsNode = node.arguments[1];

        if (typeof queryId !== "number") {
          throw new Error(`Invalid query ID: ${queryId}`);
        }

        dependencies.push({
          queryId,
          paramsNode,
          raw: node,
        });
      }

      // Recurse into children
      for (const key in node) {
        const child = node[key];
        if (child && typeof child === "object" && !Array.isArray(child)) {
          walk(child);
        }
      }
    }

    walk(ast);
    return dependencies;
  }

  tokenizeTemplate(template) {
    const matches = [];
    let match;

    while ((match = this.PLACEHOLDER_REGEX.exec(template)) !== null) {
      matches.push({
        full: match[0],
        expression: match[1].trim(),
      });
    }

    return matches;
  }
}

module.exports = { ASTParser };
