const { getValueByPath } = require("./tokenizer");
const {
  extractTemplateBlocks,
  extractWholeTemplateExpression,
} = require("./parsers");

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function resolveTemplatePath(target, expression, { allowedRoots = [] } = {}) {
  if (!expression) return undefined;

  return getValueByPath(target, expression, { allowedRoots });
}

function defaultInlineValueFormatter(value) {
  return value !== undefined && value !== null ? String(value) : "";
}

function formatInlineTemplateValue(value, options = {}) {
  const formatter = options.inlineValueFormatter || defaultInlineValueFormatter;
  return formatter(value);
}

function resolveStringTemplateInternal(template, target, options = {}) {
  if (typeof template !== "string") return template;

  const wholeExpression = extractWholeTemplateExpression(template);
  if (wholeExpression) {
    const value = resolveTemplatePath(target, wholeExpression.expression, options);
    return options.preserveSingleExpressionType
      ? value
      : formatInlineTemplateValue(value, options);
  }

  const blocks = extractTemplateBlocks(template);
  if (blocks.length === 0) return template;

  let result = template;
  for (const block of blocks) {
    const value = resolveTemplatePath(target, block.expression, options);
    result = result.replace(block.fullMatch, formatInlineTemplateValue(value, options));
  }

  return result;
}

function resolveArrayTemplateInternal(template, target, options = {}, meta = {}) {
  return template.map((value) => resolveTemplate(value, target, options, meta));
}

function resolveObjectTemplateInternal(template, target, options = {}, meta = {}) {
  return Object.fromEntries(
    Object.entries(template).map(([key, value]) => [
      key,
      resolveTemplate(value, target, options, meta),
    ])
  );
}

function resolveTemplate(template, target, options = {}, meta = {}) {
  if (typeof template === "string") {
    return resolveStringTemplateInternal(template, target, options);
  }

  if (Array.isArray(template)) {
    return resolveArrayTemplateInternal(template, target, options, meta);
  }

  if (isPlainObject(template)) {
    return resolveObjectTemplateInternal(template, target, options, meta);
  }

  return template;
}

module.exports = {
  resolveTemplate,
};