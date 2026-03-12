const TEMPLATE_BLOCK_REGEX = /\{\{([\s\S]+?)\}\}/g;
const WHOLE_TEMPLATE_REGEX = /^\{\{([\s\S]+?)\}\}$/;

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function extractTemplateBlocks(template) {
  if (template === null || template === undefined || template === "") return [];

  if (Array.isArray(template)) {
    return template.flatMap(extractTemplateBlocks);
  }

  if (isPlainObject(template)) {
    return Object.values(template).flatMap(extractTemplateBlocks);
  }

  if (typeof template !== "string") {
    return [];
  }

  const regex = new RegExp(TEMPLATE_BLOCK_REGEX);
  let match;
  const matches = [];

  while ((match = regex.exec(template)) !== null) {
    matches.push({
      fullMatch: match[0],
      expression: match[1].trim(),
      index: match.index,
    });
  }

  return matches;
}

function extractWholeTemplateExpression(template) {
  if (typeof template !== "string") return null;

  const match = template.match(WHOLE_TEMPLATE_REGEX);
  if (!match) return null;

  return {
    fullMatch: match[0],
    expression: match[1].trim(),
    index: 0,
  };
}

module.exports = {
  TEMPLATE_BLOCK_REGEX,
  extractTemplateBlocks,
  extractWholeTemplateExpression,
};