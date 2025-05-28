export class TenantPermission {
  constructor({ permissionID, permissionTitle, permissionDescription }) {
    this.permissionID = permissionID;
    this.permissionTitle = permissionTitle;
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
