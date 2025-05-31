import { Logger } from "../utils/logger";

export default class TemplateResolver {
  // Unified regex for all placeholder types
  static PLACEHOLDER_REGEX =
    /\$\{([^:}]+)(?::(\d+))?(?:\[([^\]]+)\])?(?:\.([\w]+))?\}/g;

  static extractDependencies(template) {
    const dependencies = new Set();
    const extract = (value) => {
      if (typeof value === "string") {
        const matches = value.matchAll(this.PLACEHOLDER_REGEX);
        for (const match of matches) {
          // Handle both ${id_1} and ${query_id:23} formats
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

  static async resolve(template, context, queryRunner) {
    if (typeof template === "string") {
      return this.resolveString(template, context, queryRunner);
    }
    if (Array.isArray(template)) {
      return Promise.all(
        template.map((item) => this.resolve(item, context, queryRunner))
      );
    }
    if (template && typeof template === "object") {
      const resolvedObj = {};
      for (const [key, value] of Object.entries(template)) {
        resolvedObj[key] = await this.resolve(value, context, queryRunner);
      }
      return resolvedObj;
    }
    return template;
  }

  static async resolveString(str, context, queryRunner, depth = 0) {
    const MAX_DEPTH = 10;
    if (depth > MAX_DEPTH) {
      Logger.log("error", {
        message: "TemplateResolver:resolveString:catch-1",
        params: { error: "Max recursion depth reached", depth, MAX_DEPTH },
      });
      return str;
    }

    let resolved = str;
    const matches = [...str.matchAll(this.PLACEHOLDER_REGEX)];

    Logger.log("info", {
      message: "TemplateResolver:resolveString:params",
      params: { str, matches, depth },
    });

    for (const match of matches) {
      const [fullMatch, type, id, arrayIndex, property] = match;

      try {
        let value;

        // Handle query_id placeholders (${query_id:23[0].property})
        if (type === "query_id" && id) {
          const queryId = parseInt(id, 10);

          if (!context.hasResult(queryId)) {
            Logger.log("info", {
              message: "TemplateResolver:resolveString:runQuery",
              params: { queryId },
            });
            await queryRunner.runQuery(queryId);
          }

          value = context.getResult(queryId);

          // Handle array indexing
          if (arrayIndex) {
            const index = arrayIndex.replace(/['"]/g, "");
            value = value?.[index];
          }

          // Handle property access
          if (property) {
            value = value?.[property];
          }
        }
        // Handle variable placeholders (${id_1})
        else {
          const varName = type; // The full variable name is in the first group

          if (context.variables.has(varName)) {
            value = context.getVariable(varName);
          } else {
            Logger.log("warning", {
              message: "TemplateResolver:resolveString:variable_not_found",
              params: { varName },
            });
            continue; // Skip replacement
          }
        }

        // Special handling for object values in URL contexts
        if (typeof value === "object") {
          value = JSON.stringify(value);
        }

        resolved = resolved.replace(fullMatch, value);

        Logger.log("info", {
          message: "TemplateResolver:resolveString:placeholder_resolved",
          params: { fullMatch, value, resolvedSoFar: resolved },
        });
      } catch (error) {
        Logger.log("error", {
          message: "TemplateResolver:resolveString:catch-1",
          params: { error },
        });
      }
    }

    // Recursively resolve if new placeholders were created
    if (resolved.includes("${") && resolved !== str) {
      return this.resolveString(resolved, context, queryRunner, depth + 1);
    }

    return resolved;
  }
}
