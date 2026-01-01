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
    tblWidgetWorkflowMappings,
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

    // Merge query and workflow mappings into a unified dataQueries array
    const queryMappings = (tblWidgetQueryMappings || []).map(m => ({
      ...m,
      dataSourceType: 'query',
      tempId: m.dataQueryID + '_' + m.title,
    }));
    const workflowMappings = (tblWidgetWorkflowMappings || []).map(m => ({
      ...m,
      dataSourceType: 'workflow',
      tempId: m.workflowID + '_' + m.title,
    }));
    this.dataQueries = [...queryMappings, ...workflowMappings];

    // Also keep separate references if needed
    this.workflowSources = tblWidgetWorkflowMappings || [];
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Widget(item));
    }
    return [];
  }
}
