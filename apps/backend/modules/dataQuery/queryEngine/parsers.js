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

/**
 * Resolves runtime arguments in a template or args object.
 * Replaces variable placeholders with their actual values.
 * @param {object|string} args - The args to resolve
 * @param {object} runtimeArgs - The runtime arguments containing variable values
 * @returns {object} The resolved args object
 */
const resolveArgs = (args, runtimeArgs) => {
  Logger.log("info", {
    message: "QueryEngine:resolveArgs:start",
    params: { args, runtimeArgs },
  });

  let _args = typeof args === 'object' ? JSON.stringify(args) : args;

  Object.keys(runtimeArgs).forEach((key) => {
    Logger.log("info", {
      message: "QueryEngine:resolveArgs:runtimeArg",
      params: { key, value: runtimeArgs[key] },
    });
    if (typeof runtimeArgs[key] === 'string' || typeof runtimeArgs[key] === 'number') {
      _args = _args.replaceAll(`${key}`, runtimeArgs[key]);
    } else if (typeof runtimeArgs[key] === 'object') {
      _args = _args.replaceAll(`${key}`, JSON.stringify(runtimeArgs[key]));
    } else {
      _args = _args.replaceAll(`${key}`, runtimeArgs[key]);
    }
    Logger.log("info", {
      message: "QueryEngine:resolveArgs:resolvedArg",
      params: { key, value: runtimeArgs[key], args: _args },
    });
  });
  return JSON.parse(_args);
};

module.exports = {
  extractTemplateBlocks,
  resolveArgs
};