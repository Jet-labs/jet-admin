import { Datasource } from "./datasource";

export class DatabaseQuery {
  constructor({
    databaseQueryID,
    createdAt,
    updatedAt,
    disabledAt,
    isDisabled,
    databaseQueryTitle,
    databaseSchemaName,
    databaseQueryDescription,
    databaseQueryData,
    databaseQueryResultSchema,
    runOnLoad,
    tblDatabaseChartQueryMappings,
    linkedDatabaseChartCount,
    linkedDatabaseWidgetCount,
    tblDatasources,
  }) {
    this.databaseQueryID = databaseQueryID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
    this.databaseSchemaName = databaseSchemaName;
    this.databaseQueryTitle = databaseQueryTitle;
    this.databaseQueryDescription = databaseQueryDescription;
    this.runOnLoad = runOnLoad;
    this.databaseQueryResultSchema = databaseQueryResultSchema;
    this.databaseQueryData = databaseQueryData;
    this.tblDatabaseChartQueryMappings = tblDatabaseChartQueryMappings;
    this.linkedDatabaseChartCount = linkedDatabaseChartCount || 0;
    this.linkedDatabaseWidgetCount = linkedDatabaseWidgetCount || 0;
    this.datasource = tblDatasources ? new Datasource(tblDatasources) : null;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new DatabaseQuery(item));
    }
    return [];
  }
}
