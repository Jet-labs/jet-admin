import neo4j from "neo4j-driver";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class Neo4jDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "neo4j:Neo4jDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { query, args } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    const driver = neo4j.driver(
      datasourceOptions?.uri,
      neo4j.auth.basic(datasourceOptions?.username, datasourceOptions?.password)
    );

    const session = driver.session({
      database: datasourceOptions?.database || "neo4j",
    });

    try {
      const params = {};
      if (args && Array.isArray(args)) {
        for (const arg of args) {
          params[arg.key] = context?.[arg.key] || null;
        }
      }

      const result = await session.run(query, params);
      return result.records.map((record) => record.toObject());
    } catch (error) {
      Logger.log("error", {
        message: "neo4j:Neo4jDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Neo4j query failed: ${error.message || error}`);
    } finally {
      await session.close();
      await driver.close();
    }
  }
}
