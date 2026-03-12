const {
  TEMPLATE_BLOCK_REGEX,
  extractTemplateBlocks,
  extractWholeTemplateExpression,
} = require("./parsers");
const { resolveTemplate } = require("./resolver");
const { hasMissingTemplateBraces, collectTemplateViolations } = require("./validator");

module.exports = {
  TEMPLATE_BLOCK_REGEX,
  extractTemplateBlocks,
  extractWholeTemplateExpression,
  resolveTemplate,
  hasMissingTemplateBraces,
  collectTemplateViolations,
};