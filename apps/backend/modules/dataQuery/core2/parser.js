const Logger = require("../../../utils/logger");

// src/parser.js
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
    if(typeof runtimeArgs[key] === 'string' || typeof runtimeArgs[key] === 'number'){
      _args = _args.replaceAll(`${key}`, runtimeArgs[key]);
    }else if(typeof runtimeArgs[key] === 'object'){
      _args = _args.replaceAll(`${key}`, JSON.stringify(runtimeArgs[key]));
    }else{
      _args = _args.replaceAll(`${key}`, runtimeArgs[key]);
    }
    Logger.log("info", {
      message: "QueryEngine:resolveArgs:resolvedArg",
      params: { key, value: runtimeArgs[key], args: _args },
    });
  });
  return  JSON.parse(_args);
}

const parseQueryCalls = (expression, runtimeArgs) => {
  const regex = /query\s*\(\s*(\d+)\s*,\s*({[^}]*})\s*\)/g;
  const calls = [];
  let match;

  while ((match = regex.exec(expression)) !== null) {
    try {
      const rawArgs = match[2];
      const parsedArgs = resolveArgs(rawArgs, runtimeArgs);
      Logger.log("info", {
        message: "QueryEngine:parseQueryCalls:resolvedArgs",
        params: {expression, rawArgs, parsedArgs,runtimeArgs },
      });
      calls.push({
        dataQueryID: parseInt(match[1]),
        args: parsedArgs,
        raw: match[0],
      });
    } catch (error) {
      throw new Error(`Invalid arguments in query call: ${match[2]}`);
    }
  }
  return calls;
};


module.exports = {
  extractTemplateBlocks,
  parseQueryCalls,
  resolveArgs
};