

const STATIC_PLACEHOLDER_REGEX = /\$\{query_id_(\d+)\.value\}/g;
const DYNAMIC_PLACEHOLDER_REGEX =
  /\$\{query_id_(\d+)(?:\[([^\]]+)\])?(?:\.([\w]+))?\}/g;
const NESTED_ID_REGEX = /\$\{query_id_(\d+)(?:\[([^\]]+)\])?(?:\.([\w]+))?\}/;

export default class TemplateResolver {
  static extractDependencies(template) {
    const dependencies = new Set();

    const extract = (value) => {
      if (typeof value === "string") {
        let match;
        while ((match = DYNAMIC_PLACEHOLDER_REGEX.exec(value)) !== null) {
          dependencies.add(parseInt(match[1], 10));
        }
      } else if (Array.isArray(value)) {
        value.forEach(extract);
      } else if (typeof value === "object" && value !== null) {
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

    if (typeof template === "object" && template !== null) {
      return this.resolveObject(template, context, queryRunner);
    }

    return template;
  }

  static async resolveString(str, context, queryRunner) {
    // First resolve any nested query IDs
    let resolvedStr = str;
    let nestedMatch;

    while ((nestedMatch = NESTED_ID_REGEX.exec(str)) !== null) {
      const [fullMatch, queryId] = nestedMatch;
      if (!context.hasResult(parseInt(queryId, 10))) {
        await queryRunner.runQuery(parseInt(queryId, 10));
      }

      const innerResult = context.getResult(parseInt(queryId, 10));
      resolvedStr = resolvedStr.replace(fullMatch, innerResult);
    }

    // Now resolve all placeholders in the resolved string
    const placeholders = [];
    let match;

    while ((match = DYNAMIC_PLACEHOLDER_REGEX.exec(resolvedStr)) !== null) {
      placeholders.push({
        fullMatch: match[0],
        queryId: parseInt(match[1], 10),
        arrayIndex: match[2],
        property: match[3],
      });
    }

    for (const { fullMatch, queryId, arrayIndex, property } of placeholders) {
      if (!context.hasResult(queryId)) {
        await queryRunner.runQuery(queryId);
      }

      let value = context.getResult(queryId);

      // Handle array indexing
      if (arrayIndex) {
        const index = arrayIndex.replace(/['"]/g, "");
        if (Array.isArray(value)) {
          value = value[parseInt(index, 10)];
        } else if (typeof value === "object") {
          value = value[index];
        }
      }

      // Handle property access
      if (property) {
        value = value?.[property];
      }

      // Replace placeholder with actual value
      resolvedStr = resolvedStr.replace(fullMatch, value);
    }

    return resolvedStr;
  }

  static async resolveObject(obj, context, queryRunner) {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      result[key] = await this.resolve(value, context, queryRunner);
    }

    return result;
  }
}
