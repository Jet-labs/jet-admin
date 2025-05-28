export class Dashboard {
  constructor({
    createdAt,
    updatedAt,
    disabledAt,
    isDisabled,
    dashboardID,
    dashboardTitle,
    dashboardDescription,
    dashboardConfig,
  }) {
    this.dashboardID = dashboardID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
    this.dashboardTitle = dashboardTitle;
    this.dashboardDescription = dashboardDescription;
    this.dashboardConfig = dashboardConfig;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Dashboard(item));
    }
    return [];
  }
}
