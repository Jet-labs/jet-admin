const constants = require("../../constants");
const Logger = require("../logger");

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
const replaceQueryIDStringWithQueryID = (matchedVariable) => {
  let pmQueryIDs = [];
  const queryIDStringWithReplacedQueryID = matchedVariable
    .slice(2, -2)
    .replace(constants.PM_QUERY_DETECTION_REGEX, (pmQueryIDString) => {
      const _pmQueryID = pmQueryIDString.match(
        constants.PM_QUERY_EXTRACTION_REGEX
      )[1];
      if (!isNaN(_pmQueryID)) {
        pmQueryIDs.push(parseInt(_pmQueryID));
      }
      return isNaN(_pmQueryID) ? null : `pmq_${_pmQueryID}`;
    });
  Logger.log("warning", {
    message: "replaceQueryIDStringWithQueryID",
    params: { queryIDStringWithReplacedQueryID },
  });
  return { queryIDStringWithReplacedQueryID, pmQueryIDs };
};

/**
 *
 * @param {String} matchedVariable
 * @returns
 */
const replaceAppVariableIDStringWithAppVariableID = (matchedVariable) => {
  let pmAppVariableIDs = [];
  const appVariableIDStringWithReplacedAppVariableID = matchedVariable
    .slice(2, -2)
    .replace(
      constants.PM_APP_VARIABLES_DETECTION_REGEX,
      (pmAppVariableIDString) => {
        const _pmAppVariableID = pmAppVariableIDString.match(
          constants.PM_APP_VARIABLES_EXTRACTION_REGEX
        )[1];
        if (!isNaN(_pmAppVariableID)) {
          pmAppVariableIDs.push(parseInt(_pmAppVariableID));
        }
        return isNaN(_pmAppVariableID) ? null : `pmac_${_pmAppVariableID}`;
      }
    );
  Logger.log("warning", {
    message: "replaceAppVariableStringWithAppVariable",
    params: { appVariableIDStringWithReplacedAppVariableID },
  });
  return { appVariableIDStringWithReplacedAppVariableID, pmAppVariableIDs };
};

module.exports = {
  evaluateAST,
  extractVariablesFromQuery,
  replaceQueryIDStringWithQueryID,
  replaceAppVariableIDStringWithAppVariableID,
};
