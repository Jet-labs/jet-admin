export class AppPage {
  constructor({
    createdAt,
    updatedAt,
    disabledAt,
    isDisabled,
    appPageID,
    appPageTitle,
    appPageDescription,
    appPageConfig,
  }) {
    this.appPageID = appPageID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;
    this.isDisabled = isDisabled;
    this.appPageTitle = appPageTitle;
    this.appPageDescription = appPageDescription;
    this.appPageConfig = appPageConfig;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new AppPage(item));
    }
    return [];
  }
}
