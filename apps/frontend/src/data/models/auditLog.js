export class AuditLog {
  constructor({
    auditLogID,
    userID,
    tenantID,
    type,
    subType,
    success,
    createdAt,
    metadata,
    error,
  }) {
    this.auditLogID = auditLogID;
    this.userID = userID;
    this.tenantID = tenantID;
    this.type = type;
    this.subType = subType;
    this.success = success;
    this.createdAt = createdAt;
    this.metadata = metadata;
    this.error = error;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new AuditLog(item));
    }
    return [];
  }
}
