const jsep = require("jsep");

// Define context
const context = {
  pmq_21: {
    level2: () => ({
      level3: (arg) => `Function level3 called with: ${arg}`,
    }),
  },
  pmq_43: {
    levelB: "someValue",
  },
};

// Evaluate the AST
const evaluateAST = (ast, context) => {
  const traverse = (node, context) => {
    if (node.type === "MemberExpression") {
      return traverse(node.object, context)[node.property.name];
    } else if (node.type === "CallExpression") {
      return traverse(node.callee, context).apply(
        null,
        node.arguments.map((arg) => traverse(arg, context))
      );
    } else if (node.type === "Identifier") {
      return context[node.name];
    }
  };
  return traverse(ast, context);
};

const apiUrlTemplate =
  "https://api.example.com/users/{{[pm_query_id:21].level2().level3([pm_query_id:43].levelB)}}";

const queryIDs = [];
const processedURL = apiUrlTemplate.replace(
  /{{(.*?)}}/g,
  (_, variableString) => {
    console.log({ variableString });
    const variableWithReplacedQueryID = String(variableString).replace(
      /\[pm_query_id:\d+\]/g,
      (pmQueryIDString) => {
        const pmQueryID = pmQueryIDString.match(/\[pm_query_id:(\d+)\]/)[1];
        queryIDs.push(pmQueryID);
        return `pmq_${pmQueryID}`;
      }
    );
    console.log({ variableWithReplacedQueryID });
    const ast = jsep(variableWithReplacedQueryID);
    const result = evaluateAST(ast, context);
    return result;
  }
);
console.log(processedURL);
