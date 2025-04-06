import { DatabaseChartQueryMapping } from "./databaseChartQueryMapping";

export class DatabaseChart {
  constructor({
    createdAt,
    updatedAt,
    disabledAt,
    isDisabled,
    databaseChartID,
    databaseSchemaName,
    databaseChartName,
    databaseChartDescription,
    databaseChartType,
    databaseChartConfig,
    refreshInterval,
    tblDatabaseChartQueryMappings,
  }) {
    this.databaseChartID = databaseChartID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
    this.databaseSchemaName = databaseSchemaName;
    this.databaseChartName = databaseChartName;
    this.databaseChartDescription = databaseChartDescription;
    this.databaseChartType = databaseChartType;
    this.databaseChartConfig = databaseChartConfig;
    this.refreshInterval = refreshInterval;
    this.databaseQueries = tblDatabaseChartQueryMappings
      ? DatabaseChartQueryMapping.toList(tblDatabaseChartQueryMappings)
      : [];
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new DatabaseChart(item));
    }
    return [];
  }
}
