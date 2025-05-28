export class Widget {
  constructor({
    createdAt,
    updatedAt,
    disabledAt,
    isDisabled,
    widgetID,
    databaseSchemaName,
    widgetTitle,
    widgetDescription,
    widgetType,
    widgetConfig,
    refreshInterval,
    tblWidgetQueryMappings,
  }) {
    this.widgetID = widgetID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
    this.databaseSchemaName = databaseSchemaName;
    this.widgetTitle = widgetTitle;
    this.widgetDescription = widgetDescription;
    this.widgetType = widgetType;
    this.widgetConfig = widgetConfig;
    this.refreshInterval = refreshInterval;
    this.dataQueries = tblWidgetQueryMappings;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Widget(item));
    }
    return [];
  }
}
