const Logger = require("../../../utils/logger");

/**
 * Extracts template blocks from a string or object.
 * Template blocks are wrapped in {{ }} and contain variable expressions.
 * @param {string|object} template - The template to extract blocks from
 * @returns {Array} Array of matched blocks with fullMatch, expression, and index
 */
const extractTemplateBlocks = (template) => {
  if (!template) return [];
  if (typeof template === "object") {
    return Object.values(template).flatMap(extractTemplateBlocks);
  }

  const regex = /\{\{([\s\S]+?)\}\}/g;
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
};

module.exports = {
  extractTemplateBlocks,
};