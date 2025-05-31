export class DataQuery {
  constructor({
    dataQueryID,
    createdAt,
    updatedAt,
    disabledAt,
    isDisabled,
    dataQueryTitle,
    databaseSchemaName,
    dataQueryOptions,
    datasourceID,
    datasourceType,
    dataQueryResultSchema,
    runOnLoad,
  }) {
    this.dataQueryID = dataQueryID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
    this.dataQueryTitle = dataQueryTitle;
    this.databaseSchemaName = databaseSchemaName;
    this.dataQueryOptions = dataQueryOptions;
    this.datasourceID = datasourceID;
    this.datasourceType = datasourceType;
    this.dataQueryResultSchema = dataQueryResultSchema;
    this.runOnLoad = runOnLoad;
  }
}


