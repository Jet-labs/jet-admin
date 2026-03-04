// src/engine.js
const { extractTemplateBlocks, resolveArgs } = require("./parsers");
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
      params: { dataQueryID, runtimeArgs },
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
      // params: { dataQueryID, template, runtimeArgs, blocks },
    });

    let result = template;

    for (const block of blocks) {
      Logger.log("info", {
        message: "QueryEngine:resolveTemplate:enterBlock",
        params: { dataQueryID, block },
      });

      // Resolve input variable from runtimeArgs
      const value = block.expression.split('.').reduce((o, i) => o && o[i], runtimeArgs);

      Logger.log("info", {
        message: "QueryEngine:resolveTemplate:resolveVariable",
        // params: { dataQueryID, block, value },
      });

      result = result.replace(block.fullMatch, value);

      Logger.log("info", {
        message: "QueryEngine:resolveTemplate:resolvedVariable",
        params: { dataQueryID, block, result },
      });
    }

    return result;
  }
}

module.exports = { QueryEngine };
