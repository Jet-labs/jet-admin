export class DatabaseWidget {
  constructor({
    createdAt,
    updatedAt,
    disabledAt,
    isDisabled,
    databaseWidgetID,
    databaseSchemaName,
    databaseWidgetName,
    databaseWidgetDescription,
    databaseWidgetType,
    databaseWidgetConfig,
    refreshInterval,
    tblDatabaseWidgetQueryMappings,
  }) {
    this.databaseWidgetID = databaseWidgetID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
    this.databaseSchemaName = databaseSchemaName;
    this.databaseWidgetName = databaseWidgetName;
    this.databaseWidgetDescription = databaseWidgetDescription;
    this.databaseWidgetType = databaseWidgetType;
    this.databaseWidgetConfig = databaseWidgetConfig;
    this.refreshInterval = refreshInterval;
    this.databaseQueries = tblDatabaseWidgetQueryMappings;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new DatabaseWidget(item));
    }
    return [];
  }
}
