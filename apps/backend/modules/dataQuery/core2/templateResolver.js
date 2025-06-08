const Logger = require("../../../utils/logger");
const { ASTParser } = require("./astParser");
const { ParameterResolver } = require("./parameterResolver");

// templateResolver.js
class TemplateResolver {
  constructor() {
    this.parser = new ASTParser();
    this.MAX_DEPTH = 10;
  }

  static extractDependencies(template) {
    const dependencies = new Set();
    const extract = (value) => {
      if (typeof value === "string") {
        const matches = value.matchAll(this.PLACEHOLDER_REGEX);
        for (const match of matches) {
          if (match[1] === "query_id" && match[2]) {
            dependencies.add(parseInt(match[2], 10));
          }
        }
      } else if (Array.isArray(value)) {
        value.forEach(extract);
      } else if (value && typeof value === "object") {
        Object.values(value).forEach(extract);
      }
    };
    extract(template);
    return Array.from(dependencies);
  }

  async resolve(template, context, queryExecutor) {
    if (typeof template === "string") {
      return this.resolveString(template, context, queryExecutor);
    }

    if (Array.isArray(template)) {
      return Promise.all(
        template.map((item) => this.resolve(item, context, queryExecutor))
      );
    }

    if (template && typeof template === "object") {
      const resolvedObj = {};
      for (const [key, value] of Object.entries(template)) {
        resolvedObj[key] = await this.resolve(value, context, queryExecutor);
      }
      return resolvedObj;
    }

    return template;
  }

  async resolveString(str, context, queryExecutor, depth = 0) {
    Logger.log("info", {
      message: "TemplateResolver:resolveString:enter",
      params: { str, depth, context: context.getExecutionState() },
    });

    if (depth > this.MAX_DEPTH) {
      Logger.log("error", {
        message: "TemplateResolver:resolveString:maxDepth",
        params: { depth, MAX_DEPTH: this.MAX_DEPTH },
      });
      return str;
    }

    let resolved = str;
    const tokens = this.parser.tokenizeTemplate(str);

    for (const token of tokens) {
      try {
        const ast = this.parser.parseExpression(token.expression);
        const value = await this._resolveAST(
          ast,
          context,
          queryExecutor,
          depth
        );

        if (typeof value === "object") {
          resolved = resolved.replace(token.full, JSON.stringify(value));
        } else {
          resolved = resolved.replace(token.full, value);
        }

        Logger.log("info", {
          message: "TemplateResolver:resolveString:resolved",
          params: { fullMatch: token.full, value, resolvedSoFar: resolved },
        });
      } catch (error) {
        Logger.log("error", {
          message: "TemplateResolver:resolveString:catch",
          params: { fullMatch: token.full, error: error.message },
        });
      }
    }

    if (resolved.includes("${") && resolved !== str) {
      return this.resolveString(resolved, context, queryExecutor, depth + 1);
    }

    return resolved;
  }

  async _resolveAST(ast, context, queryExecutor, depth) {
    const resolver = new ParameterResolver(context, queryExecutor);
    return resolver.resolveNode(ast, depth);
  }
}

module.exports = { TemplateResolver };
