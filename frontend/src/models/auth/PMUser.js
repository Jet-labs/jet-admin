export class PMUser {
  constructor({
    pm_user_id,
    username,
    first_name,
    address1,
    pm_policy_object_id,
    email,
    is_disabled,
    created_at,
    updated_at,
    disabled_at,
    disable_reason,
    tbl_pm_policy_objects,
  }) {
    this.pm_user_id = pm_user_id;
    this.username = username;
    this.first_name = first_name;
    this.address1 = address1;
    this.pm_policy_object_id = pm_policy_object_id;
    this.email = email;
    this.is_disabled = is_disabled;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.disabled_at = disabled_at;
    this.disable_reason = disable_reason;
    this.is_profile_complete = this.first_name && this.email && this.address1;

    this.tbl_pm_policy_objects = tbl_pm_policy_objects;
    this.policy = tbl_pm_policy_objects ? tbl_pm_policy_objects.policy : null;
  }

  isPolicyEditor = () => {
    if (!this.policy) {
      return false;
    } else if (!this.policy.edit_policy_object) {
      return false;
    } else if (this.policy.edit_policy_object === true) {
      return true;
    }
    return false;
  };
  extractAuthorizedColumnsForEditFromPolicyObject = (tableName) => {
    let authorized_columns;

    if (!this.policy) {
      return [];
    } else if (!this.policy.tables[tableName]) {
      authorized_columns = false;
    } else if (this.policy.tables[tableName] === true) {
      authorized_columns = true;
    } else if (!this.policy.tables[tableName].edit) {
      authorized_columns = false;
    } else if (this.policy.tables[tableName].edit === true) {
      authorized_columns = true;
    } else if (!this.policy.tables[tableName].edit.columns) {
      authorized_columns = false;
    } else if (this.policy.tables[tableName].edit.columns === true) {
      authorized_columns = true;
    } else if (Array.isArray(this.policy.tables[tableName].edit.columns)) {
      authorized_columns = this.policy.tables[tableName].edit.columns;
    } else {
      authorized_columns = false;
    }
    return authorized_columns;
  };

  extractAuthorizedColumnsForReadFromPolicyObject = (tableName) => {
    let authorized_columns;
    if (!this.policy) {
      return [];
    } else if (!this.policy.tables[tableName]) {
      authorized_columns = false;
    } else if (this.policy.tables[tableName] === true) {
      authorized_columns = true;
    } else if (!this.policy.tables[tableName].read) {
      authorized_columns = false;
    } else if (this.policy.tables[tableName].read === true) {
      authorized_columns = true;
    } else if (!this.policy.tables[tableName].read.columns) {
      authorized_columns = false;
    } else if (this.policy.tables[tableName].read.columns === true) {
      authorized_columns = true;
    } else if (Array.isArray(this.policy.tables[tableName].read.columns)) {
      authorized_columns = this.policy.tables[tableName].read.columns;
    } else {
      authorized_columns = false;
    }
    return authorized_columns;
  };

  extractAuthorizedTables = () => {
    try {
      const tables = this.policy ? Object.keys(this.policy.tables) : [];

      const authorizedTables = tables.filter((table) => {
        return this.policy.tables[table] != false;
      });
      return authorizedTables;
    } catch {
      return [];
    }
  };

  extractAuthorizedActionEntities = () => {
    try {
      const entities = this.policy ? this.policy.actions : {};
      return entities;
    } catch {
      return {};
    }
  };

  extractAuthorizedActions = (actionEntity) => {
    try {
      const entities = this.policy ? this.policy.actions : {};
      console.log(entities);
      if (
        entities &&
        entities[actionEntity] &&
        entities[actionEntity].actions &&
        entities[actionEntity].actions != false
      ) {
        const actions = Object.keys(entities[actionEntity].actions).map(
          (action) => {
            console.log(entities[actionEntity].actions[action]);
            return entities[actionEntity].actions[action] == true
              ? action
              : null;
          }
        );
        return actions;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  extractAuthorizationForRowAdditionFromPolicyObject = (tableName) => {
    let authorization;

    if (!this.policy) {
      return [];
    } else if (!this.policy.tables[tableName]) {
      authorization = false;
    } else if (this.policy.tables[tableName] === true) {
      authorization = true;
    } else if (!this.policy.tables[tableName].add) {
      authorization = false;
    } else if (this.policy.tables[tableName].add === true) {
      authorization = true;
    } else {
      authorization = false;
    }
    return authorization;
  };

  extractAuthorizationForRowDeletionFromPolicyObject = (tableName) => {
    let authorization;

    if (!this.policy) {
      return [];
    } else if (!this.policy.tables[tableName]) {
      authorization = false;
    } else if (this.policy.tables[tableName] === true) {
      authorization = true;
    } else {
      authorization = Boolean(this.policy.tables[tableName].delete);
    }
    return authorization;
  };
}
