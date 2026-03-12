const { tokenizeObjectPath } = require('./tokenizer');
const { extractTemplateBlocks, extractWholeTemplateExpression } = require('./parsers');

const MUSTACHE_ONLY_TEMPLATE_MESSAGE =
  'Use mustache syntax like {{ctx.input.customerID}} instead of a raw value path';

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function hasMissingTemplateBraces(value, options = { allowedRoots: ['ctx'] }) {
  if (typeof value !== 'string') return false;

  const trimmedValue = value.trim();
  if (!trimmedValue) return false;

  // If it's literally just the root allowed string (like "ctx"), ignore.
  if (options.allowedRoots?.includes(trimmedValue)) return false;

  // If it matches exactly a template expression `{{something}}`, it's not missing braces.
  if (extractWholeTemplateExpression(trimmedValue)) return false;

  // If it has *any* template block `{{something}}`, it's not missing braces.
  if (extractTemplateBlocks(trimmedValue).length > 0) return false;

  // Otherwise, see if it is a valid object path starting with one of the allowed roots.
  return tokenizeObjectPath(trimmedValue, options) !== null;
}

function collectTemplateViolations(value, path, issues = [], options = { allowedRoots: ['ctx'] }) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectTemplateViolations(item, [...path, index], issues, options));
    return issues;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, nestedValue]) => {
      collectTemplateViolations(nestedValue, [...path, key], issues, options);
    });
    return issues;
  }

  // Check strings
  if (hasMissingTemplateBraces(value, options)) {
    issues.push({
      path,
      message: MUSTACHE_ONLY_TEMPLATE_MESSAGE,
    });
  }

  return issues;
}

module.exports = {
  MUSTACHE_ONLY_TEMPLATE_MESSAGE,
  hasMissingTemplateBraces,
  collectTemplateViolations,
};
