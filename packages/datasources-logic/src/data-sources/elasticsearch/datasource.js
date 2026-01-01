import { Client } from "@elastic/elasticsearch";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class ElasticsearchDataSource extends DataSource {
  getClient() {
    const datasourceOptions = this.config.datasourceOptions;
    let clientConfig = {};

    switch (datasourceOptions?.authType) {
      case "none":
        clientConfig = { node: datasourceOptions.node };
        break;
      case "basic":
        clientConfig = {
          node: datasourceOptions.node,
          auth: {
            username: datasourceOptions.username,
            password: datasourceOptions.password,
          },
        };
        break;
      case "apiKey":
        clientConfig = {
          node: datasourceOptions.node,
          auth: { apiKey: datasourceOptions.apiKey },
        };
        break;
      case "cloud":
        clientConfig = {
          cloud: { id: datasourceOptions.cloudId },
          auth: { apiKey: datasourceOptions.apiKey },
        };
        break;
      default:
        clientConfig = { node: datasourceOptions?.node };
    }

    return new Client(clientConfig);
  }

  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "elasticsearch:ElasticsearchDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const {
      operation,
      index,
      documentId,
      query,
      body,
      size,
      from,
      sort,
    } = dataQueryOptions;

    const client = this.getClient();

    try {
      let result;

      switch (operation) {
        case "search": {
          const queryDSL = typeof query === "string" ? JSON.parse(query) : query;
          const sortParsed = sort ? (typeof sort === "string" ? JSON.parse(sort) : sort) : undefined;
          
          const response = await client.search({
            index,
            query: queryDSL,
            size: size || 10,
            from: from || 0,
            sort: sortParsed,
          });

          result = {
            hits: response.hits.hits.map((hit) => ({
              _id: hit._id,
              _score: hit._score,
              ...hit._source,
            })),
            total: response.hits.total,
            took: response.took,
          };
          break;
        }

        case "get": {
          const response = await client.get({
            index,
            id: documentId,
          });

          result = {
            _id: response._id,
            found: response.found,
            ...response._source,
          };
          break;
        }

        case "index": {
          const docBody = typeof body === "string" ? JSON.parse(body) : body;
          const response = await client.index({
            index,
            id: documentId || undefined,
            document: docBody,
          });

          result = {
            _id: response._id,
            result: response.result,
          };
          break;
        }

        case "update": {
          const updateBody = typeof body === "string" ? JSON.parse(body) : body;
          const response = await client.update({
            index,
            id: documentId,
            doc: updateBody,
          });

          result = {
            _id: response._id,
            result: response.result,
          };
          break;
        }

        case "delete": {
          const response = await client.delete({
            index,
            id: documentId,
          });

          result = {
            _id: response._id,
            result: response.result,
          };
          break;
        }

        case "count": {
          const countQuery = typeof query === "string" ? JSON.parse(query) : query;
          const response = await client.count({
            index,
            query: countQuery,
          });

          result = {
            count: response.count,
          };
          break;
        }

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      Logger.log("info", {
        message: "elasticsearch:ElasticsearchDataSource:execute:success",
      });

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "elasticsearch:ElasticsearchDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Elasticsearch operation failed: ${error.message || error}`);
    }
  }
}
