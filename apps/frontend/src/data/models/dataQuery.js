import { Datasource } from "./datasource";

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
    linkedWidgetCount,
    tblDatasources,
  }) {
    this.dataQueryID = dataQueryID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
    this.databaseSchemaName = databaseSchemaName;
    this.dataQueryTitle = dataQueryTitle;
    this.runOnLoad = runOnLoad;
    this.dataQueryResultSchema = dataQueryResultSchema;
    this.dataQueryOptions = dataQueryOptions;
    this.datasourceID = datasourceID;
    this.datasourceType = datasourceType;
    this.linkedWidgetCount = linkedWidgetCount || 0;
    this.datasource = tblDatasources ? new Datasource(tblDatasources) : null;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new DataQuery(item));
    }
    return [];
  }
}
