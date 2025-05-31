import DependencyGraph from "./dependencyGraph.js";
import TemplateResolver from "./templateResolver.js";
import ContextManager from "./contextManager.js";
import dataSourceRegistry from "../data-sources/index.js";
import { Logger } from "../utils/logger.js";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import ChildContext from "./childContext.js";

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
      Logger.log("info", {
        message: "QueryRunner:run:contextVariables",
        params: { initialQueryIds, contextVariables },
      });
      for (const [name, value] of Object.entries(contextVariables)) {
        this.context.setVariable(name, value);
      }

      Logger.log("info", {
        message: "QueryRunner:run:contextVariables",
        params: { contextVariables: this.context.getExecutionState() },
      });

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

    // Check if we already have a result for these parameters
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
      // Create a child context with parameters
      const childContext = new ChildContext(this.context, parameters);

      // Resolve templates in query options
      Logger.log("info", {
        message: "QueryRunner:runQuery:resolveOptions",
        params: { queryId: id, parameters, options: query.dataQueryOptions },
      });

      const resolvedOptions = await TemplateResolver.resolve(
        query.dataQueryOptions,
        childContext,
        this
      );

      Logger.log("info", {
        message: "QueryRunner:runQuery:resolvedOptions",
        params: { queryId: id, parameters, resolvedOptions },
      });

      // Execute query
      Logger.log("info", {
        message: "QueryRunner:runQuery:execute",
        params: { queryId: id, parameters, resolvedOptions },
      });

      const result = await datasource.execute(resolvedOptions, childContext);

      // Resolve any dynamic results in the result
      const resolvedResult = await TemplateResolver.resolve(
        result,
        childContext,
        this
      );

      // Store result with parameters
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

      // Fetch query from data store
      const query = await this.queryFetcher(queryId);
      if (!query) {
        Logger.log("error", {
          message: "QueryRunner:buildDependencyGraph:catch-2",
          params: { queryId, error: "Query not found in data store" },
        });
        throw new Error(`Query not found in data store: ${queryId}`);
      }

      Logger.log("info", {
        message: "QueryRunner:buildDependencyGraph:query",
        params: { queryId, query },
      });

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
