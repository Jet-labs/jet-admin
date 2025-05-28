export class DatabaseNotification {
  constructor({
    databaseNotificationID,
    tenantID,
    databaseNotificationTitle,
    createdAt,
    updatedAt,
  }) {
    this.databaseNotificationID = databaseNotificationID;
    this.tenantID = tenantID;
    this.databaseNotificationTitle = databaseNotificationTitle;
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