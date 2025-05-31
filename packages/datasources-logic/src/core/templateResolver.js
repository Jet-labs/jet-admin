import { Logger } from "../utils/logger";

export default class TemplateResolver {
  // Unified regex for all placeholder types
  static PLACEHOLDER_REGEX =
    /\$\{([^:}]+)(?::(\d+))?(?:\[([^\]]+)\])?(?:\.([\w]+))?(?::(\{[^}]*\}))?\}/g;

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
    Logger.log("info", {
      message: "TemplateResolver:resolveString:enter",
      params: { input: str, depth, context: context.getExecutionState() },
    });

    // Prevent infinite recursion
    const MAX_DEPTH = 10;
    if (depth > MAX_DEPTH) {
      Logger.log("error", {
        message: "TemplateResolver:resolveString:maxDepth",
        params: { depth, MAX_DEPTH, context: context.getExecutionState() },
      });
      return str;
    }

    let resolved = str;
    const matches = [...str.matchAll(this.PLACEHOLDER_REGEX)];

    Logger.log("info", {
      message: "TemplateResolver:resolveString:matches",
      params: { input: str, matches: matches.map((m) => m[0]), depth },
    });

    for (const match of matches) {
      const [fullMatch, type, id, arrayIndex, property, paramsJson] = match;

      try {
        let value;
        let parameters = {};

        // Parse parameters if provided
        if (paramsJson) {
          try {
            parameters = JSON.parse(paramsJson);
            // Resolve any placeholders within parameters
            for (const [key, val] of Object.entries(parameters)) {
              parameters[key] = await this.resolve(val, context, queryRunner);
            }
          } catch (e) {
            Logger.log("error", {
              message: "TemplateResolver:resolveString:parseParams:catch",
              params: { paramsJson, error: e.message },
            });
          }
        }

        // Handle query_id placeholders (${query_id:23[0].property:{"param":"value"}})
        if (type === "query_id" && id) {
          const queryId = parseInt(id, 10);

          if (!context.hasResult(queryId, parameters)) {
            Logger.log("info", {
              message: "TemplateResolver:resolveString:runQuery",
              params: { queryId, parameters },
            });
            await queryRunner.runQuery(queryId, parameters);
          }

          value = context.getResult(queryId, parameters);

          // Handle array indexing
          if (arrayIndex) {
            // Resolve array index
            Logger.log("info", {
              message: "TemplateResolver:resolveString:resolveArrayIndex",
              params: { arrayIndex },
            });
            const index = arrayIndex.replace(/['"]/g, "");
            const resolvedIndex = await this.resolve(
              index,
              context,
              queryRunner
            );

            // Validate that the resolved index is a number
            if (isNaN(resolvedIndex)) {
              Logger.log("error", {
                message: "TemplateResolver:resolveString:invalidArrayIndex",
                params: { arrayIndex, resolvedIndex },
              });
              throw new Error(`Invalid array index: ${resolvedIndex}`);
            }
            value = value?.[resolvedIndex];
            Logger.log("info", {
              message: "TemplateResolver:resolveString:resolvedArrayIndex",
              params: { arrayIndex, resolvedIndex },
            });
          }

          // Handle property access
          if (property) {
            value = value?.[property];
          }
        }
        // Handle variable placeholders (${id_1})
        else {
          const varName = type;

          Logger.log("info", {
            message: "TemplateResolver:resolveString:resolveVariable",
            params: {
              varName,
              context: context.getExecutionState(),
              t: context?.variables?.keys(),
            },
          });

          try {
            value = context.getVariable(varName);
            Logger.log("info", {
              message: "TemplateResolver:resolveString:resolvedVariable",
              params: { varName, value },
            });
          } catch (e) {
            Logger.log("error", {
              message: "TemplateResolver:resolveString:variableNotFound",
              params: { varName, error: e.message },
            });
            continue;
          }
        }

        // Special handling for object values
        if (typeof value === "object") {
          value = JSON.stringify(value);
        }

        resolved = resolved.replace(fullMatch, value);

        Logger.log("info", {
          message: "TemplateResolver:resolveString:resolved",
          params: { fullMatch, value, resolvedSoFar: resolved },
        });
      } catch (error) {
        Logger.log("error", {
          message: "TemplateResolver:resolveString:catch",
          params: { fullMatch, error },
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
