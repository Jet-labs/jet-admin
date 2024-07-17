const constants = require("../constants");

const evaluateAST = (ast, context) => {
  const traverse = (node, context) => {
    switch (node.type) {
      case "MemberExpression":
        const object = traverse(node.object, context);
        const property = node.computed
          ? traverse(node.property, context)
          : node.property.name;
        return object[property];
      case "CallExpression":
        const func = traverse(node.callee, context);
        const args = node.arguments.map((arg) => traverse(arg, context));
        return func.apply(null, args);
      case "Identifier":
        return context[node.name];
      case "Literal":
        return node.value;
      default:
        throw new Error(`Unsupported AST node type: ${node.type}`);
    }
  };
  return traverse(ast, context);
};

/**
 *
 * @param {String} query
 */
const extractVariablesFromQuery = (query) => {
  return query.match(constants.VARIABLE_DETECTION_REGEX);
};

/**
 *
 * @param {String} matchedVariable
 * @returns
 */
const replaceVariableNameWithQueryID = (matchedVariable) => {
  let pmQueryID = null;
  const variableWithReplacedQueryID = matchedVariable
    .slice(2, -2)
    .replace(constants.PM_QUERY_DETECTION_REGEX, (pmQueryIDString) => {
      const _pmQueryID = pmQueryIDString.match(
        constants.PM_QUERY_EXTRACTION_REGEX
      )[1];
      pmQueryID = parseInt(_pmQueryID);
      return `pmq_${_pmQueryID}`;
    });
  return { variableWithReplacedQueryID, pmQueryID };
};
module.exports = {
  evaluateAST,
  extractVariablesFromQuery,
  replaceVariableNameWithQueryID,
};
