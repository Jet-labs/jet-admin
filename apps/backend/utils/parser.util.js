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

module.exports = { evaluateAST };
