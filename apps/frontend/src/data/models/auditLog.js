export class AuditLog {
  constructor({
    auditLogID,
    userID,
    tenantID,
    apiKeyID,
    type,
    subType,
    success,
    createdAt,
    metadata,
    error,
    tblUsers,
    tblAPIKeys,
  }) {
    this.auditLogID = auditLogID;
    this.userID = userID;
    this.tenantID = tenantID;
    this.apiKeyID = apiKeyID ?? null;
    this.type = type;
    this.subType = subType;
    this.success = success;
    this.createdAt = createdAt;
    this.metadata = metadata;
    this.error = error;

    // Linked user record (firstName, lastName, email)
    this.tblUsers = tblUsers ?? null;

    // Linked API key record (apiKeyID, apiKeyTitle, apiKeyPrefix)
    this.tblAPIKeys = tblAPIKeys ?? null;
  }

  /** Returns a human-readable label for the actor (user name/email or API key title). */
  get actorLabel() {
    if (this.tblUsers) {
      const name = [this.tblUsers.firstName, this.tblUsers.lastName]
        .filter(Boolean)
        .join(" ");
      return name || this.tblUsers.email || this.userID;
    }
    if (this.tblAPIKeys) {
      return this.tblAPIKeys.apiKeyTitle || this.apiKeyID;
    }
    return this.userID || this.apiKeyID || "—";
  }

  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new AuditLog(item));
    }
    return [];
  }
}
