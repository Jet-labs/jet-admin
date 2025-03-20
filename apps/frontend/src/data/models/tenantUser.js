/**
 * Represents a tenant user (user) with their details and roles.
 */
export class TenantUser {
  /**
   * Creates a new TenantUser instance.
   *
   * @param {object} param0
   * @param {number} param0.userID - The unique ID of the user.
   * @param {string} param0.firebaseID - The Firebase ID associated with the user.
   * @param {string} [param0.phoneNumber] - The phone number of the user.
   * @param {string} [param0.firstName] - The first name of the user.
   * @param {string} [param0.lastName] - The last name of the user.
   * @param {string} param0.email - The email address of the user.
   * @param {boolean} param0.isTenantAdmin
   * @param {Array<object>} [param0.roles] - The roles assigned to the user within the tenant.
   */
  constructor({
    userID,
    firebaseID,
    phoneNumber = null,
    firstName = null,
    lastName = null,
    email,
    isTenantAdmin,
    roles = [],
    tenantUserFrom,
  }) {
    this.userID = userID;
    this.firebaseID = firebaseID;
    this.phoneNumber = phoneNumber;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.roles = roles; // Array of role objects
    this.isTenantAdmin = Boolean(isTenantAdmin);
    this.tenantUserFrom = tenantUserFrom;
  }

  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new TenantUser(item);
      });
    }
  };
}

