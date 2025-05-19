import { User } from "./user";

export class Tenant {
  constructor({
    tenantID,
    tenantName,
    tenantLogoURL,
    tenantDBURL,
    tenantDBType,
    relationships,
    createdAt,
    roles,
    tblUsers,
    tenantRolesCount,
    tenantDatabaseSchemasCount,
    tenantDatabaseTablesCount,
    tenantChartCount,
    tenantDashboardCount,
    tenantDatabaseQueryCount,
    tenantCronJobCount,
    tenantAPIKeyCount,
    tenantWidgetCount,
  }) {
    this.tenantID = tenantID;
    this.tenantName = tenantName;
    this.tenantLogoURL = tenantLogoURL;
    this.tenantDBURL = tenantDBURL;
    this.tenantDBType = tenantDBType;
    this.relationships = relationships;
    this.createdAt = createdAt;
    this.roles = roles;
    this.creator = tblUsers ? new User(tblUsers) : null;
    this.tenantRolesCount = tenantRolesCount;
    this.tenantDatabaseSchemasCount = tenantDatabaseSchemasCount;
    this.tenantDatabaseTablesCount = tenantDatabaseTablesCount;
    this.tenantChartCount = tenantChartCount;
    this.tenantDashboardCount = tenantDashboardCount;
    this.tenantDatabaseQueryCount = tenantDatabaseQueryCount;
    this.tenantCronJobCount = tenantCronJobCount;
    this.tenantAPIKeyCount = tenantAPIKeyCount;
    this.tenantWidgetCount = tenantWidgetCount;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Tenant(item);
      });
    }
  };
}
