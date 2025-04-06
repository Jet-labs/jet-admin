import { DatabaseQuery } from "./databaseQuery";

export class DatabaseChartQueryMapping {
  constructor({
    databaseChartID,
    databaseQueryID,
    parameters,
    title,
    executionOrder,
    datasetFields,
    databaseQueryArgValues,
    tblDatabaseQueries,
    createdAt,
    updatedAt,
    disabledAt,
    isDisabled,
  }) {
    this.databaseQueryID = databaseQueryID;
    this.databaseQuery = tblDatabaseQueries?new DatabaseQuery(tblDatabaseQueries):null;
    this.parameters = parameters;
    this.title = title;
    this.executionOrder = executionOrder;
    this.datasetFields = datasetFields;
    this.databaseQueryArgValues = databaseQueryArgValues;
    this.databaseChartID = databaseChartID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new DatabaseChartQueryMapping(item));
    }
    return [];
  }
}
