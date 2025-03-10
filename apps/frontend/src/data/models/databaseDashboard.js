export class DatabaseDashboard {
  constructor({
    createdAt,
    updatedAt,
    disabledAt,
    isDisabled,
    databaseDashboardID,
    databaseDashboardName,
    databaseDashboardDescription,
    databaseDashboardConfig,
    tblDatabaseDashboardChartMappings,
  }) {
    this.databaseDashboardID = databaseDashboardID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
    this.databaseDashboardName = databaseDashboardName;
    this.databaseDashboardDescription = databaseDashboardDescription;
    this.databaseDashboardConfig = databaseDashboardConfig;
    this.databaseCharts = tblDatabaseDashboardChartMappings;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new DatabaseDashboard(item));
    }
    return [];
  }
}
