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
    workflowID,
    workflowConfig,
    tblWorkflows,
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
    this.workflowID = workflowID;
    this.workflowConfig = workflowConfig;
    this.workflow = tblWorkflows || null;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Widget(item));
    }
    return [];
  }
}
