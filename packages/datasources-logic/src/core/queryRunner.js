import DependencyGraph from "./dependencyGraph.js";
import TemplateResolver from "./templateResolver.js";
import ContextManager from "./contextManager.js";
import dataSourceRegistry from "../data-sources/index.js";
import { Logger } from "../utils/logger.js";


export default class QueryRunner {
  constructor(queryFetcher, datasourceFetcher) {
    this.queryFetcher = queryFetcher;
    this.datasourceFetcher = datasourceFetcher;
    this.context = new ContextManager();
    this.graph = new DependencyGraph();
    this.dataSourceCache = new Map();
  }

  async run(initialQueryIds, contextVariables = {}) {
    try {
      // Set context variables
      for (const [name, value] of Object.entries(contextVariables)) {
        this.context.setVariable(name, value);
      }

      // Build dependency graph
      await this.buildDependencyGraph(initialQueryIds);

      // Detect circular dependencies
      this.graph.detectCircularDependencies();

      // Get execution order
      const executionOrder = this.graph.getExecutionOrder();

      // Execute independent queries in parallel
      const independentQueries = this.graph.getIndependentQueries();
      await Promise.all(independentQueries.map((id) => this.runQuery(id)));

      // Execute dependent queries sequentially
      for (const queryId of executionOrder) {
        if (!independentQueries.includes(queryId)) {
          await this.runQuery(queryId);
        }
      }

      // Return results for initial queries
      const results = {};
      for (const queryId of initialQueryIds) {
        results[queryId] = this.context.getResult(parseInt(queryId));
      }

      Logger.log("warning", {
        message: "QueryRunner:run:success",
        params: {
          initialQueryIds,
          results,
          context: this.context.getResult(parseInt(initialQueryIds[0])),
          contextVariables: this.context.getExecutionState(),
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

  async runQuery(queryId) {
    if (this.context.hasResult(queryId)) {
      return this.context.getResult(queryId);
    }

    const node = this.graph.graph.get(queryId);
    if (!node) {
      throw new Error(`Query not found in graph: ${queryId}`);
    }

    const query = node.query;
    const datasource = await this.getDataSource(query);

    try {
      // Resolve templates in query options
      const resolvedOptions = await TemplateResolver.resolve(
        query.dataQueryOptions,
        this.context,
        this
      );

      // Execute query
      Logger.log("info", {
        message: "QueryRunner:runQuery:executing",
        params: { queryId, query },
      });
      const result = await datasource.execute(resolvedOptions, this.context);

      // Resolve any dynamic results
      const resolvedResult = await TemplateResolver.resolve(
        result,
        this.context,
        this
      );

      Logger.log("success", {
        message: "QueryRunner:runQuery:success",
        params: { queryId, result, resolvedResult },
      });

      this.context.setResult(queryId, resolvedResult);

      Logger.log("warning", {
        message: "QueryRunner:runQuery:success:context",
        params: {
          queryId,
          context: this.context.getResult(queryId),
          contextVariables: this.context.getExecutionState(),
        },
      });

      return resolvedResult;
    } catch (error) {
      Logger.log("error", {
        message: "QueryRunner:runQuery:catch-1",
        params: { queryId, error },
      });
      throw new Error(`Query ${queryId} failed: ${error.message}`);
    }
  }

  async buildDependencyGraph(queryIds) {
    const queue = [...queryIds];
    const processed = new Set();

    while (queue.length > 0) {
      const queryId = queue.shift();

      if (processed.has(queryId)) continue;
      processed.add(queryId);

      // Fetch query from data store
      const query = await this.queryFetcher(queryId);
      this.graph.addNode(query);

      // Extract dependencies from query text
      const dependencies = TemplateResolver.extractDependencies(
        JSON.stringify(query.dataQueryOptions)
      );

      // Add dependencies to graph
      for (const depId of dependencies) {
        this.graph.addDependency(queryId, depId);
        queue.push(depId);
      }
    }
  }

  async getDataSource(query) {
    const cacheKey = `${query.datasourceType}_${query.datasourceID}`;

    if (this.dataSourceCache.has(cacheKey)) {
      return this.dataSourceCache.get(cacheKey);
    }

    const datasourceConfig = await this.datasourceFetcher(query.datasourceID);
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
