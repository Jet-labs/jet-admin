export class Widget {
  constructor({
    createdAt,
    updatedAt,
    disabledAt,
    isDisabled,
    widgetID,
    widgetTitle,
    widgetDescription,
    widgetType,
    widgetConfig,
    refreshInterval,
    folderID,
  }) {
    this.widgetID = widgetID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
    this.widgetTitle = widgetTitle;
    this.widgetDescription = widgetDescription;
    this.widgetType = widgetType;
    this.widgetConfig = widgetConfig;
    this.refreshInterval = refreshInterval;
    this.folderID = folderID ?? null;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Widget(item));
    }
    return [];
  }
}
