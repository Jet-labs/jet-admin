import { Client } from "@notionhq/client";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class NotionDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "notion:NotionDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { resource, operation, databaseId, pageId, filter, sorts, searchQuery, pageSize } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    const notion = new Client({ auth: datasourceOptions?.apiToken });

    try {
      let result;
      const parsedFilter = filter ? (typeof filter === "string" ? JSON.parse(filter) : filter) : undefined;
      const parsedSorts = sorts ? (typeof sorts === "string" ? JSON.parse(sorts) : sorts) : undefined;

      switch (resource) {
        case "databases":
          if (operation === "list") {
            result = await notion.search({ filter: { property: "object", value: "database" }, page_size: pageSize || 100 });
          } else if (operation === "query") {
            result = await notion.databases.query({
              database_id: databaseId,
              filter: parsedFilter,
              sorts: parsedSorts,
              page_size: pageSize || 100,
            });
          } else if (operation === "retrieve") {
            result = await notion.databases.retrieve({ database_id: databaseId });
          }
          break;

        case "pages":
          if (operation === "retrieve") {
            result = await notion.pages.retrieve({ page_id: pageId });
          } else if (operation === "create") {
            result = await notion.pages.create(parsedFilter);
          } else if (operation === "update") {
            result = await notion.pages.update({ page_id: pageId, ...parsedFilter });
          }
          break;

        case "blocks":
          if (operation === "list") {
            result = await notion.blocks.children.list({ block_id: pageId, page_size: pageSize || 100 });
          } else if (operation === "retrieve") {
            result = await notion.blocks.retrieve({ block_id: pageId });
          }
          break;

        case "users":
          if (operation === "list") {
            result = await notion.users.list({ page_size: pageSize || 100 });
          }
          break;

        case "search":
          result = await notion.search({ query: searchQuery, page_size: pageSize || 100 });
          break;

        default:
          throw new Error(`Unsupported resource: ${resource}`);
      }

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "notion:NotionDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Notion operation failed: ${error.message || error}`);
    }
  }
}
