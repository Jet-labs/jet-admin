// src/engine.js
const { extractTemplateBlocks, parseQueryCalls, resolveArgs } = require("./parsers");
const { QueryGraph } = require("./dependencyGraph");
const Logger = require("../../../utils/logger");
const { DATASOURCE_TYPES } = require("@jet-admin/datasource-types");
const { dataSourceRegistry } = require("@jet-admin/datasources-logic");

class QueryEngine {
  constructor(queryFetcher, datasourceFetcher) {
    this.queryFetcher = queryFetcher;
    this.datasourceFetcher = datasourceFetcher;
    this.cache = new Map();
    this.dataSourceCache = new Map();
  }

  async executeQuery(dataQueryID, runtimeArgs) {
    const cacheKey = `${dataQueryID}|${JSON.stringify(runtimeArgs)}`;
    Logger.log("info", {
      message: "QueryEngine:executeQuery:start",
      params: { dataQueryID, runtimeArgs },
    });

    if (this.cache.has(cacheKey)) {
      Logger.log("info", {
        message: "QueryEngine:executeQuery:cacheHit",
        params: { dataQueryID },
      });
      return this.cache.get(cacheKey);
    }

    const query = await this.queryFetcher(dataQueryID);
    if (!query) {
      Logger.log("error", {
        message: "QueryEngine:executeQuery:queryNotFound",
        params: { dataQueryID },
      });
      throw new Error(`Query ${dataQueryID} not found`);
    }

    Logger.log("info", {
      message: "QueryEngine:executeQuery:fetchedQuery",
      params: { dataQueryID, query },
    });

    const resolvedTemplate = await this.resolveTemplate(
      query.dataQueryOptions,
      runtimeArgs,
      dataQueryID
    );
    Logger.log("info", {
      message: "QueryEngine:executeQuery:resolvedTemplate",
      params: { dataQueryID, resolvedTemplate },
    });

    const datasource = await this.getDataSource(query, dataQueryID);
    const result = await datasource.execute(resolvedTemplate);

    this.cache.set(cacheKey, result);
    Logger.log("info", {
      message: "QueryEngine:executeQuery:executed",
      params: { dataQueryID, runtimeArgs, result },
    });
    return result;
  }

  async getDataSource(query, dataQueryID) {
    const cacheKey = `${query.datasourceType}_${query.datasourceID}`;

    Logger.log("info", {
      message: "QueryEngine:getDataSource:start",
      params: { dataQueryID, cacheKey },
    });

    if (this.dataSourceCache.has(cacheKey)) {
      Logger.log("info", {
        message: "QueryEngine:getDataSource:cacheHit",
        params: { dataQueryID },
      });
      return this.dataSourceCache.get(cacheKey);
    }

    let datasourceConfig;
    switch (query.datasourceType) {
      case DATASOURCE_TYPES.RESTAPI.value:
        datasourceConfig = {
          datasourceType: query.datasourceType,
          datasourceOptions: query.dataQueryOptions,
        };
        break;
      default:
        datasourceConfig = await this.datasourceFetcher(query.datasourceID);
        break;
    }

    const DataSource = dataSourceRegistry.getDataSource(query.datasourceType);
    const instance = new DataSource(datasourceConfig);

    this.dataSourceCache.set(cacheKey, instance);
    Logger.log("info", {
      message: "QueryEngine:getDataSource:created",
      params: { dataQueryID, cacheKey },
    });
    return instance;
  }

  async resolveTemplate(template, runtimeArgs, dataQueryID) {
    if (typeof template === "object") {
      return this.resolveObjectTemplate(template, runtimeArgs, dataQueryID);
    }

    return this.resolveStringTemplate(template, runtimeArgs, dataQueryID);
  }

  async resolveObjectTemplate(template, runtimeArgs, dataQueryID) {
    Logger.log("info", {
      message: "QueryEngine:resolveObjectTemplate:start",
      params: { dataQueryID, template },
    });

    const resolvedObj = {};
    for (const [key, value] of Object.entries(template)) {
      resolvedObj[key] = await this.resolveTemplate(
        value,
        runtimeArgs,
        dataQueryID
      );
    }

    Logger.log("info", {
      message: "QueryEngine:resolveObjectTemplate:done",
      params: { dataQueryID, resolvedObj },
    });

    return resolvedObj;
  }

  async resolveStringTemplate(template, runtimeArgs, dataQueryID) {
    const blocks = extractTemplateBlocks(template);

    Logger.log("info", {
      message: "QueryEngine:resolveStringTemplate:blocksExtracted",
      params: { dataQueryID, template, runtimeArgs, blocks },
    });

    let result = template;

    for (const block of blocks) {
      Logger.log("info", {
        message: "QueryEngine:resolveTemplate:enterBlock",
        params: { dataQueryID, block },
      });

      const calls = parseQueryCalls(block.expression, runtimeArgs);

      Logger.log("info", {
        message: "QueryEngine:resolveTemplate:parseQueryCalls",
        params: { dataQueryID, block, calls },
      });

      if (calls.length > 0) {
        const call = calls[0];

        Logger.log("info", {
          message: "QueryEngine:resolveTemplate:executeSubQuery",
          params: { dataQueryID, block, call },
        });

        const resolvedArgs = resolveArgs(call.args, runtimeArgs);
        
        Logger.log("info", {
          message: "QueryEngine:resolveTemplate:resolvedArgs",
          params: { dataQueryID, block, call, resolvedArgs, runtimeArgs },
        });

        const subResult = await this.executeQuery(call.dataQueryID, {
          ...runtimeArgs,
          ...resolvedArgs,
        });

        // const subResult = await this.executeQuery(call.dataQueryID, {
        //   ...runtimeArgs,
        //   ...call.args,
        // });

        

        Logger.log("info", {
          message: "QueryEngine:resolveTemplate:executedSubQuery",
          params: { dataQueryID, call, subResult,block },
        });

        const processedExpression = this.replaceQueryCallsWithResult(
          block.expression,
          'subResult'
        );

        Logger.log("info", {
          message: "QueryEngine:resolveTemplate:processedExpression",
          params: { dataQueryID, block, processedExpression },
        });

        const value = eval(processedExpression);

        Logger.log("info", {
          message: "QueryEngine:resolveTemplate:evaluatedQueryExpression",
          params: { dataQueryID, block, value },
        });

        result = result.replace(block.fullMatch, value);

        Logger.log("info", {
          message: "QueryEngine:resolveTemplate:replacedQueryResult",
          params: { dataQueryID, block, result },
        });
      } else {
        const value = eval(`runtimeArgs.${block.expression}`);

        Logger.log("info", {
          message: "QueryEngine:resolveTemplate:resolveContextVariable",
          params: { dataQueryID, block, value },
        });

        result = result.replace(block.fullMatch, value);

        Logger.log("info", {
          message: "QueryEngine:resolveTemplate:resolvedContextVariable",
          params: { dataQueryID, block, result },
        });
      }
    }

    return result;
  }

  replaceQueryCallsWithResult(template, replacer = 'queryResult') {
    return template.replace(/query\s*\(\s*\d+\s*,\s*{[^}]*}\s*\)/g, replacer);
  }
  
  buildDependencyGraph(template) {
    const graph = new QueryGraph();
    const blocks = extractTemplateBlocks(template);

    for (const block of blocks) {
      const calls = parseQueryCalls(block.expression);
      for (const call of calls) {
        graph.addDependency(call.dataQueryID, call.dataQueryID);
      }
    }

    if (graph.detectCycles()) {
      Logger.log("error", {
        message: "QueryEngine:buildDependencyGraph:cycleDetected",
        params: { template },
      });
      throw new Error("Circular dependency detected in query template");
    }

    Logger.log("info", {
      message: "QueryEngine:buildDependencyGraph:complete",
      params: { template },
    });

    return graph;
  }

  async renderTemplate(template, runtimeArgs) {
    Logger.log("info", {
      message: "QueryEngine:renderTemplate:start",
      params: { template, runtimeArgs },
    });

    const graph = this.buildDependencyGraph(template);
    const executionOrder = topologicalSort(graph);
    const context = { args: runtimeArgs, queryResults: {} };

    for (const dataQueryID of executionOrder) {
      Logger.log("info", {
        message: "QueryEngine:renderTemplate:executeInOrder",
        params: { dataQueryID },
      });
      context.queryResults[dataQueryID] = await this.executeQuery(
        dataQueryID,
        context.args
      );
    }

    const result = replaceTemplateValues(template, context);

    Logger.log("info", {
      message: "QueryEngine:renderTemplate:complete",
      params: { result },
    });

    return result;
  }
}

module.exports = { QueryEngine };
