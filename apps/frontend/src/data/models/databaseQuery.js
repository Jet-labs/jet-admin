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
    databaseQuery,
    databaseQueryResultSchema,
    runOnLoad,
    tblDatabaseChartQueryMappings,
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
    this.databaseQuery = databaseQuery;
    this.tblDatabaseChartQueryMappings = tblDatabaseChartQueryMappings;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new DatabaseQuery(item));
    }
    return [];
  }
}
