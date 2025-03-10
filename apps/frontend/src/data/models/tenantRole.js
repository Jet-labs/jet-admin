export class TenantRole {
  constructor({
    roleID,
    roleName,
    roleDescription,
    tenantID,
    tblRolePermissionMappings,
  }) {
    this.roleID = roleID;
    this.roleName = roleName;
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
