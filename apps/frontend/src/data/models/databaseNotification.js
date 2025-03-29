export class DatabaseNotification {
  constructor({
    databaseNotificationID,
    tenantID,
    databaseNotificationName,
    createdAt,
    updatedAt,
  }) {
    this.databaseNotificationID = databaseNotificationID;
    this.tenantID = tenantID;
    this.databaseNotificationName = databaseNotificationName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static toList(databaseNotifications) {
    if (!databaseNotifications || !Array.isArray(databaseNotifications)) {
      return [];
    }
    return databaseNotifications.map(
      (databaseNotification) => new DatabaseNotification(databaseNotification)
    );
  }
}