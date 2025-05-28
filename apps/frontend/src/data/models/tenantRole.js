export class TenantRole {
  constructor({
    roleID,
    roleTitle,
    roleDescription,
    tenantID,
    tblRolePermissionMappings,
  }) {
    this.roleID = roleID;
    this.roleTitle = roleTitle;
    this.roleDescription = roleDescription;
    this.tenantID = tenantID;
    this.tblRolePermissionMappings = tblRolePermissionMappings;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new TenantRole(item);
      });
    }
  };
}
