const { DATASOURCE_TYPES } = require("@jet-admin/datasource-types");
const Logger = require("../../../utils/logger");
const { ASTParser } = require("./astParser");
const { ChildContext } = require("./childContext");
const { ContextManager } = require("./contextManager");
const { DependencyGraph } = require("./dependencyGraph");
const { TemplateResolver } = require("./templateResolver");
const { dataSourceRegistry } = require("@jet-admin/datasources-logic");

// queryRunner.js
class QueryRunner {
  constructor(queryFetcher, datasourceFetcher) {
    this.queryFetcher = queryFetcher;
    this.datasourceFetcher = datasourceFetcher;
    this.context = new ContextManager();
    this.graph = new DependencyGraph();
    this.dataSourceCache = new Map();
    this.parser = new ASTParser();
    this.templateResolver = new TemplateResolver();
  }

  async run(initialQueryIds, contextVariables = {}) {
    try {
      this._setContextVariables(contextVariables);

      await this.buildDependencyGraph(initialQueryIds);
      this.graph.detectCircularDependencies();

      const executionOrder = this.graph.getExecutionOrder();
      const independentQueries = this.graph.getIndependentQueries();

      await Promise.all(independentQueries.map((id) => this.runQuery(id)));

      for (const queryId of executionOrder) {
        if (!independentQueries.includes(queryId)) {
          await this.runQuery(queryId);
        }
      }

      const results = {};
      for (const queryId of initialQueryIds) {
        results[queryId] = this.context.getResult(queryId);
      }
      Logger.log("success", {
        message: "QueryRunner:run:success",
        params: {
          initialQueryIds,
          results,
          context: this.context.getResult(parseInt(initialQueryIds[0])),
        },
      });
      return results;
    } catch (error) {
      Logger.log("error", {
        message: "QueryRunner:run:catch-1",
        params: { error },
      });
      throw error;
    } finally {
      this.cleanup();
    }
  }

  async runQuery(queryId, parameters = {}) {
    const id = Number(queryId);
    Logger.log("info", {
      message: "QueryRunner:runQuery",
      params: { queryId: id, parameters },
    });

    if (this.context.hasResult(id, parameters)) {
      Logger.log("info", {
        message: "QueryRunner:runQuery:cached",
        params: { queryId: id, parameters },
      });
      return this.context.getResult(id, parameters);
    }

    const node = this.graph.graph.get(id);
    if (!node) {
      Logger.log("error", {
        message: "QueryRunner:runQuery:catch-2",
        params: { queryId: id, error: "Query not found in graph" },
      });
      throw new Error(`Query ${id} not found in graph`);
    }

    const query = node.query;
    const datasource = await this.getDataSource(query);

    try {
      const childContext = new ChildContext(this.context, parameters);
      const resolvedOptions = await this.templateResolver.resolve(
        query.dataQueryOptions,
        childContext,
        this
      );

      const result = await datasource.execute(resolvedOptions, childContext);
      const resolvedResult = await this.templateResolver.resolve(
        result,
        childContext,
        this
      );

      this.context.setResult(id, resolvedResult, parameters);
      return resolvedResult;
    } catch (error) {
      Logger.log("error", {
        message: "QueryRunner:runQuery:catch-3",
        params: { queryId: id, parameters, error },
      });
      throw error;
    }
  }

  async buildDependencyGraph(queryIds) {
    const queue = [...queryIds];
    const processed = new Set();

    while (queue.length > 0) {
      const queryId = queue.shift();

      if (processed.has(queryId)) continue;
      processed.add(queryId);

      const query = await this.queryFetcher(queryId);

      if (!query) {
        Logger.log("error", {
          message: "QueryRunner:buildDependencyGraph:catch-2",
          params: { queryId, error: "Query not found in data store" },
        });
        throw new Error(`Query not found in data store: ${queryId}`);
      }

      this.graph.addNode(query);

      const dependencies = this._extractDependenciesFromQuery(query);

      for (const depId of dependencies) {
        this.graph.addDependency(queryId, depId);
        queue.push(depId);
      }
    }
  }

  _extractDependenciesFromQuery(query) {
    return this.parser.extractDependencies(
      JSON.stringify(query.dataQueryOptions)
    );
  }

  _setContextVariables(contextVariables) {
    for (const [name, value] of Object.entries(contextVariables)) {
      this.context.setVariable(name, value);
    }
  }

  async getDataSource(query) {
    const cacheKey = `${query.datasourceType}_${query.datasourceID}`;

    if (this.dataSourceCache.has(cacheKey)) {
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
    return instance;
  }

  cleanup() {
    // Close any persistent connections
    for (const datasource of this.dataSourceCache.values()) {
      if (typeof datasource.cleanup === "function") {
        datasource.cleanup();
      }
    }
    this.dataSourceCache.clear();
  }
  
}

module.exports = { QueryRunner };
