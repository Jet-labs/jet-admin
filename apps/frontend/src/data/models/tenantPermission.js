export class TenantPermission {
  constructor({
    permissionID,
    permissionName,
    permissionDescription,
    
  }) {
    this.permissionID = permissionID;
    this.permissionName = permissionName;
    this.permissionDescription = permissionDescription;
    
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new TenantPermission(item);
      });
    }
  };
}
