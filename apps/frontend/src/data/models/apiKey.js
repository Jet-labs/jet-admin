export class APIKey {
  constructor({
    apiKeyID,
    tenantID,
    apiKeyName,
    apiKey,
    createdAt,
    isDisabled,
    tblAPIKeyRoleMappings,
  }) {
    this.apiKeyID = apiKeyID;
    this.tenantID = tenantID;
    this.apiKeyName = apiKeyName;
    this.apiKey = apiKey;
    this.createdAt = createdAt;
    this.isDisabled = isDisabled;
    this.roles = tblAPIKeyRoleMappings;
  }

  static toList(apiKeys) {
    if (!apiKeys || !Array.isArray(apiKeys)) {
      return [];
    }
    return apiKeys.map(
      (apiKey) => new APIKey(apiKey)
    );
  }
}