import { User } from "./user";

export class Tenant {
  constructor({
    tenantID,
    tenantTitle,
    tenantLogoURL,
    relationships,
    createdAt,
    roles,
    tblUsers,
    tenantRolesCount,
    tenantAppPageCount,
    tenantDashboardCount,
    tenantDataQueryCount,
    tenantCronJobCount,
    tenantAPIKeyCount,
    tenantWidgetCount,
    tenantDatasourceCount,
    tenantWorkflowCount,
    tenantListenerCount,
  }) {
    this.tenantID = tenantID;
    this.tenantTitle = tenantTitle;
    this.tenantLogoURL = tenantLogoURL;
    this.relationships = relationships;
    this.createdAt = createdAt;
    this.roles = roles;
    this.creator = tblUsers ? new User(tblUsers) : null;
    this.tenantRolesCount = tenantRolesCount;
    this.tenantAppPageCount = tenantAppPageCount ?? tenantDashboardCount;
    this.tenantDashboardCount = tenantDashboardCount ?? tenantAppPageCount;
    this.tenantDataQueryCount = tenantDataQueryCount;
    this.tenantCronJobCount = tenantCronJobCount;
    this.tenantAPIKeyCount = tenantAPIKeyCount;
    this.tenantWidgetCount = tenantWidgetCount;
    this.tenantDatasourceCount = tenantDatasourceCount;
    this.tenantWorkflowCount = tenantWorkflowCount;
    this.tenantListenerCount = tenantListenerCount;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Tenant(item);
      });
    }
  };
}
