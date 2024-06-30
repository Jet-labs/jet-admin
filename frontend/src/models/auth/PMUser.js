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
      if (
        entities &&
        entities[actionEntity] &&
        entities[actionEntity].actions &&
        entities[actionEntity].actions != false
      ) {
        const actions = Object.keys(entities[actionEntity].actions).map(
          (action) => {
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

  extractAuthorizedGraphsForReadFromPolicyObject = () => {
    const authorizeGraphIDs = [];
    if (this.policy.graphs.read) {
      return true;
    } else if (this.policy.graphs && this.policy.graphs.graph_ids) {
      Object.keys(this.policy.graphs.graph_ids).forEach((graphID) => {
        if (this.policy.graphs.graph_ids[graphID].read) {
          authorizeGraphIDs.push(parseInt(graphID));
        }
      });
    }
    return authorizeGraphIDs;
  };

  extractAuthorizedGraphsForUpdateFromPolicyObject = () => {
    const authorizeGraphIDs = [];
    if (this.policy.graphs.edit) {
      return true;
    } else if (this.policy.graphs && this.policy.graphs.graph_ids) {
      Object.keys(this.policy.graphs.graph_ids).forEach((graphID) => {
        if (this.policy.graphs.graph_ids[graphID].edit) {
          authorizeGraphIDs.push(parseInt(graphID));
        }
      });
    }
    return authorizeGraphIDs;
  };

  extractAuthorizationForGraphAddFromPolicyObject = () => {
    console.log(this.policy.graphs);
    if (this.policy.graphs.add) {
      return true;
    }
    return false;
  };
  extractAuthorizedGraphsForReadFromPolicyObject = () => {
    const authorizeGraphIDs = [];
    if (this.policy.dashboards.read) {
      return true;
    } else if (this.policy.dashboards && this.policy.dashboards.dashboard_ids) {
      Object.keys(this.policy.dashboards.dashboard_ids).forEach(
        (dashboardID) => {
          if (this.policy.dashboards.dashboard_ids[dashboardID].read) {
            authorizeGraphIDs.push(parseInt(dashboardID));
          }
        }
      );
    }
    return authorizeGraphIDs;
  };

  extractAuthorizedGraphsForUpdateFromPolicyObject = () => {
    const authorizeGraphIDs = [];
    if (this.policy.dashboards.edit) {
      return true;
    } else if (this.policy.dashboards && this.policy.dashboards.dashboard_ids) {
      Object.keys(this.policy.dashboards.dashboard_ids).forEach(
        (dashboardID) => {
          if (this.policy.dashboards.dashboard_ids[dashboardID].edit) {
            authorizeGraphIDs.push(parseInt(dashboardID));
          }
        }
      );
    }
    return authorizeGraphIDs;
  };

  extractAuthorizationForDashboardAddFromPolicyObject = () => {
    console.log(this.policy.dashboards);
    if (this.policy.dashboards.add) {
      return true;
    }
    return false;
  };
  extractAuthorizedDashboardsForReadFromPolicyObject = () => {
    const authorizeDashboardIDs = [];
    if (this.policy.dashboards.read) {
      return true;
    } else if (this.policy.dashboards && this.policy.dashboards.dashboard_ids) {
      Object.keys(this.policy.dashboards.dashboard_ids).forEach(
        (dashboardID) => {
          if (this.policy.dashboards.dashboard_ids[dashboardID].read) {
            authorizeDashboardIDs.push(parseInt(dashboardID));
          }
        }
      );
    }
    return authorizeDashboardIDs;
  };

  extractAuthorizedDashboardsForUpdateFromPolicyObject = () => {
    const authorizeDashboardIDs = [];
    if (this.policy.dashboards.edit) {
      return true;
    } else if (this.policy.dashboards && this.policy.dashboards.dashboard_ids) {
      Object.keys(this.policy.dashboards.dashboard_ids).forEach(
        (dashboardID) => {
          if (this.policy.dashboards.dashboard_ids[dashboardID].edit) {
            authorizeDashboardIDs.push(parseInt(dashboardID));
          }
        }
      );
    }
    return authorizeDashboardIDs;
  };

  extractAuthorizationForDashboardAddFromPolicyObject = () => {
    console.log(this.policy.dashboards);
    if (this.policy.dashboards.add) {
      return true;
    }
    return false;
  };

  extractAuthorizationForQueryAddFromPolicyObject = () => {
    console.log(this.policy.queries);
    if (this.policy.queries?.add) {
      return true;
    }
    return false;
  };
  extractAuthorizedQueriesForReadFromPolicyObject = () => {
    const authorizeQueryIDs = [];
    if (this.policy.queries.read) {
      return true;
    } else if (this.policy.queries && this.policy.queries.query_ids) {
      Object.keys(this.policy.queries.query_ids).forEach((queryID) => {
        if (this.policy.queries.query_ids[queryID].read) {
          authorizeQueryIDs.push(parseInt(queryID));
        }
      });
    }
    return authorizeQueryIDs;
  };

  extractAuthorizedQueriesForUpdateFromPolicyObject = () => {
    const authorizeQueryIDs = [];
    if (this.policy.queries.edit) {
      return true;
    } else if (this.policy.queries && this.policy.queries.query_ids) {
      Object.keys(this.policy.queries.query_ids).forEach((queryID) => {
        if (this.policy.queries.query_ids[queryID].edit) {
          authorizeQueryIDs.push(parseInt(queryID));
        }
      });
    }
    return authorizeQueryIDs;
  };
}
