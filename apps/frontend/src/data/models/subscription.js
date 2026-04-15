import { Datasource } from "./datasource";

export class Subscription {
  constructor({
    subscriptionID,
    tenantID,
    datasourceID,
    subscriptionTitle,
    subscriptionType,
    subscriptionConfig,
    status,
    errorMessage,
    lastEventAt,
    eventCount,
    createdAt,
    updatedAt,
    tblDatasources,
  }) {
    this.subscriptionID = subscriptionID;
    this.tenantID = tenantID;
    this.datasourceID = datasourceID;
    this.subscriptionTitle = subscriptionTitle;
    this.subscriptionType = subscriptionType;
    this.subscriptionConfig = subscriptionConfig;
    this.status = status;
    this.errorMessage = errorMessage;
    this.lastEventAt = lastEventAt;
    this.eventCount = eventCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.datasource = tblDatasources ? new Datasource(tblDatasources) : null;
  }

  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Subscription(item));
    }
    return [];
  }
}
