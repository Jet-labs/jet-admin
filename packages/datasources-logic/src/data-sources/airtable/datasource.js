import Airtable from "airtable";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class AirtableDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "airtable:AirtableDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const {
      operation,
      tableName,
      recordId,
      fields,
      filterByFormula,
      maxRecords,
      sortField,
      sortDirection,
      view,
    } = dataQueryOptions;

    const datasourceOptions = this.config.datasourceOptions;

    Airtable.configure({
      apiKey: datasourceOptions.apiKey,
    });

    const base = Airtable.base(datasourceOptions.baseId);
    const table = base(tableName);

    try {
      let result;

      switch (operation) {
        case "list": {
          const selectOptions = {};
          
          if (filterByFormula) {
            selectOptions.filterByFormula = filterByFormula;
          }
          if (maxRecords) {
            selectOptions.maxRecords = maxRecords;
          }
          if (view) {
            selectOptions.view = view;
          }
          if (sortField) {
            selectOptions.sort = [{ field: sortField, direction: sortDirection || "asc" }];
          }

          const records = await table.select(selectOptions).all();
          result = records.map((record) => ({
            id: record.id,
            ...record.fields,
          }));
          break;
        }

        case "find": {
          const record = await table.find(recordId);
          result = {
            id: record.id,
            ...record.fields,
          };
          break;
        }

        case "create": {
          const fieldsData = typeof fields === "string" ? JSON.parse(fields) : fields;
          const record = await table.create(fieldsData);
          result = {
            id: record.id,
            ...record.fields,
          };
          break;
        }

        case "update": {
          const updateFields = typeof fields === "string" ? JSON.parse(fields) : fields;
          const record = await table.update(recordId, updateFields);
          result = {
            id: record.id,
            ...record.fields,
          };
          break;
        }

        case "delete": {
          const deletedRecord = await table.destroy(recordId);
          result = {
            id: deletedRecord.id,
            deleted: true,
          };
          break;
        }

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      Logger.log("info", {
        message: "airtable:AirtableDataSource:execute:success",
      });

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "airtable:AirtableDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Airtable operation failed: ${error.message || error}`);
    }
  }
}
