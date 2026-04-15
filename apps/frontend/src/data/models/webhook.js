export class Webhook {
  constructor({
    webhookID,
    tenantID,
    webhookTitle,
    webhookPath,
    authType,
    authConfig,
    status,
    lastReceivedAt,
    eventCount,
    createdAt,
    updatedAt,
  }) {
    this.webhookID = webhookID;
    this.tenantID = tenantID;
    this.webhookTitle = webhookTitle;
    this.webhookPath = webhookPath;
    this.authType = authType;
    this.authConfig = authConfig;
    this.status = status;
    this.lastReceivedAt = lastReceivedAt;
    this.eventCount = eventCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Webhook(item));
    }
    return [];
  }
}
