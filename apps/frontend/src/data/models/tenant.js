import { User } from "./user";

export class Tenant {
  constructor({
    tenantID,
    tenantName,
    tenantLogoURL,
    tenantDBURL,
    relationships,
    createdAt,
    roles,
    tblUsers,
  }) {
    this.tenantID = tenantID;
    this.tenantName = tenantName;
    this.tenantLogoURL = tenantLogoURL;
    this.tenantDBURL = tenantDBURL;
    this.relationships = relationships;
    this.createdAt = createdAt;
    this.roles = roles;
    this.creator = tblUsers ? new User(tblUsers) : null;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Tenant(item);
      });
    }
  };
}
