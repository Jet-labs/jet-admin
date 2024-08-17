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
    policy,
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
    this.policy = JSON.parse(policy);
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

  // tables

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

  // graphs

  extractAuthorizedGraphsForReadFromPolicyObject = () => {
    const authorizeGraphIDs = [];
    if (this.policy?.graphs?.read) {
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
    if (this.policy?.graphs?.edit) {
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
    if (this.policy?.graphs?.add) {
      return true;
    }
    return false;
  };

  isAuthorizedToDeleteGraph = (graphID) => {
    let authorization = false;
    if (
      this.policy.graphs &&
      !(
        this.policy.graphs.delete === null ||
        this.policy.graphs.delete === undefined
      )
    ) {
      authorization = this.policy.graphs.delete;
    } else if (this.policy.graphs && this.policy.graphs.graph_ids) {
      if (this.policy.graphs.graph_ids[graphID]) {
        authorization = Boolean(this.policy.graphs.graph_ids[graphID].delete);
      }
    }
    return authorization;
  };

  // dashboards

  extractAuthorizationForDashboardAddFromPolicyObject = () => {
    if (this.policy?.dashboards?.add) {
      return true;
    }
    return false;
  };

  extractAuthorizedDashboardsForReadFromPolicyObject = () => {
    const authorizeDashboardIDs = [];
    if (this.policy?.dashboards?.read) {
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
    if (this.policy?.dashboards?.edit) {
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

  isAuthorizedToDeleteDashboard = (dashboardID) => {
    let authorization = false;
    if (
      this.policy.dashboards &&
      !(
        this.policy.dashboards.delete === null ||
        this.policy.dashboards.delete === undefined
      )
    ) {
      authorization = this.policy.dashboards.delete;
    } else if (this.policy.dashboards && this.policy.dashboards.dashboard_ids) {
      if (this.policy.dashboards.dashboard_ids[dashboardID]) {
        authorization = Boolean(
          this.policy.dashboards.dashboard_ids[dashboardID].delete
        );
      }
    }
    return authorization;
  };

  // queries

  isAuthorizedToAddQuery = () => {
    if (this.policy?.queries?.add) {
      return true;
    }
    return false;
  };

  extractAuthorizedQueriesForReadFromPolicyObject = () => {
    const authorizeQueryIDs = [];
    if (this.policy?.queries?.read) {
      return true;
    } else if (this.policy.queries && this.policy.queries.query_ids) {
      Object.keys(this.policy.queries.query_ids).forEach((pmQueryID) => {
        if (this.policy.queries.query_ids[pmQueryID].read) {
          authorizeQueryIDs.push(parseInt(pmQueryID));
        }
      });
    }
    return authorizeQueryIDs;
  };

  extractAuthorizedQueriesForUpdateFromPolicyObject = () => {
    const authorizeQueryIDs = [];
    if (this.policy?.queries?.edit) {
      return true;
    } else if (this.policy.queries && this.policy.queries.query_ids) {
      Object.keys(this.policy.queries.query_ids).forEach((pmQueryID) => {
        if (this.policy.queries.query_ids[pmQueryID].edit) {
          authorizeQueryIDs.push(parseInt(pmQueryID));
        }
      });
    }
    return authorizeQueryIDs;
  };

  isAuthorizedToDeleteQuery = (pmQueryID) => {
    let authorization = false;
    if (
      this.policy.queries &&
      !(
        this.policy.queries.delete === null ||
        this.policy.queries.delete === undefined
      )
    ) {
      authorization = this.policy.queries.delete;
    } else if (this.policy.queries && this.policy.queries.query_ids) {
      if (this.policy.queries.query_ids[pmQueryID]) {
        authorization = Boolean(
          this.policy.queries.query_ids[pmQueryID].delete
        );
      }
    }
    return authorization;
  };

  // jobs

  isAuthorizedToAddJob = () => {
    if (this.policy?.jobs?.add) {
      return true;
    }
    return false;
  };

  extractAuthorizedJobsForReadFromPolicyObject = () => {
    const authorizeJobIDs = [];
    if (this.policy?.jobs?.read) {
      return true;
    } else if (this.policy.jobs && this.policy.jobs.job_ids) {
      Object.keys(this.policy.jobs.job_ids).forEach((pmJobID) => {
        if (this.policy.jobs.job_ids[pmJobID].read) {
          authorizeJobIDs.push(parseInt(pmJobID));
        }
      });
    }
    return authorizeJobIDs;
  };

  extractAuthorizedJobsForUpdateFromPolicyObject = () => {
    const authorizeJobIDs = [];
    if (this.policy?.jobs?.edit) {
      return true;
    } else if (this.policy.jobs && this.policy.jobs.job_ids) {
      Object.keys(this.policy.jobs.job_ids).forEach((pmJobID) => {
        if (this.policy.jobs.job_ids[pmJobID].edit) {
          authorizeJobIDs.push(parseInt(pmJobID));
        }
      });
    }
    return authorizeJobIDs;
  };

  isAuthorizedToDeleteJob = (pmJobID) => {
    let authorization = false;
    if (
      this.policy.jobs &&
      !(
        this.policy.jobs.delete === null ||
        this.policy.jobs.delete === undefined
      )
    ) {
      authorization = this.policy.jobs.delete;
    } else if (this.policy.jobs && this.policy.jobs.job_ids) {
      if (this.policy.jobs.job_ids[pmJobID]) {
        authorization = Boolean(this.policy.jobs.job_ids[pmJobID].delete);
      }
    }
    return authorization;
  };

  // app_constants

  isAuthorizedToAddAppConstant = () => {
    if (this.policy?.app_constants?.add) {
      return true;
    }
    return false;
  };

  extractAuthorizedAppConstantsForReadFromPolicyObject = () => {
    const authorizeAppConstantIDs = [];
    if (this.policy?.app_constants?.read) {
      return true;
    } else if (
      this.policy.app_constants &&
      this.policy.app_constants.app_constant_ids
    ) {
      Object.keys(this.policy.app_constants.app_constant_ids).forEach(
        (pmAppConstantID) => {
          if (
            this.policy.app_constants.app_constant_ids[pmAppConstantID].read
          ) {
            authorizeAppConstantIDs.push(parseInt(pmAppConstantID));
          }
        }
      );
    }
    return authorizeAppConstantIDs;
  };

  extractAuthorizedAppConstantsForUpdateFromPolicyObject = () => {
    const authorizeAppConstantIDs = [];
    if (this.policy?.app_constants?.edit) {
      return true;
    } else if (
      this.policy.app_constants &&
      this.policy.app_constants.app_constant_ids
    ) {
      Object.keys(this.policy.app_constants.app_constant_ids).forEach(
        (pmAppConstantID) => {
          if (
            this.policy.app_constants.app_constant_ids[pmAppConstantID].edit
          ) {
            authorizeAppConstantIDs.push(parseInt(pmAppConstantID));
          }
        }
      );
    }
    return authorizeAppConstantIDs;
  };

  isAuthorizedToDeleteAppConstant = (pmAppConstantID) => {
    let authorization = false;
    if (
      this.policy.app_constants &&
      !(
        this.policy.app_constants.delete === null ||
        this.policy.app_constants.delete === undefined
      )
    ) {
      authorization = this.policy.app_constants.delete;
    } else if (
      this.policy.app_constants &&
      this.policy.app_constants.app_constant_ids
    ) {
      if (this.policy.app_constants.app_constant_ids[pmAppConstantID]) {
        authorization = Boolean(
          this.policy.app_constants.app_constant_ids[pmAppConstantID].delete
        );
      }
    }
    return authorization;
  };

  isAuthorizedToAddPolicy = () => {
    if (this.policy?.policies?.add) {
      return true;
    }
    return false;
  };

  extractAuthorizedPolicysForReadFromPolicyObject = () => {
    const authorizePolicyIDs = [];
    if (this.policy?.policies?.read) {
      return true;
    } else if (this.policy.policies && this.policy.policies.policy_ids) {
      Object.keys(this.policy.policies.policy_ids).forEach((pmPolicyID) => {
        if (this.policy.policies.policy_ids[pmPolicyID].read) {
          authorizePolicyIDs.push(parseInt(pmPolicyID));
        }
      });
    }
    return authorizePolicyIDs;
  };

  extractAuthorizedPolicysForUpdateFromPolicyObject = () => {
    const authorizePolicyIDs = [];
    if (this.policy?.policies?.edit) {
      return true;
    } else if (this.policy.policies && this.policy.policies.policy_ids) {
      Object.keys(this.policy.policies.policy_ids).forEach((pmPolicyID) => {
        if (this.policy.policies.policy_ids[pmPolicyID].edit) {
          authorizePolicyIDs.push(parseInt(pmPolicyID));
        }
      });
    }
    return authorizePolicyIDs;
  };

  isAuthorizedToDeletePolicy = (pmPolicyID) => {
    let authorization = false;
    if (
      this.policy.policies &&
      !(
        this.policy.policies.delete === null ||
        this.policy.policies.delete === undefined
      )
    ) {
      authorization = this.policy.policies.delete;
    } else if (this.policy.policies && this.policy.policies.policy_ids) {
      if (this.policy.policies.policy_ids[pmPolicyID]) {
        authorization = Boolean(
          this.policy.policies.policy_ids[pmPolicyID].delete
        );
      }
    }
    return authorization;
  };

  isAuthorizedToAddAccount = () => {
    if (this.policy?.accounts?.add) {
      return true;
    }
    return false;
  };

  extractAuthorizedAccountsForReadFromPolicyObject = () => {
    const authorizeAccountIDs = [];
    if (this.policy?.accounts?.read) {
      return true;
    } else if (this.policy.accounts && this.policy.accounts.accounts_ids) {
      Object.keys(this.policy.accounts.accounts_ids).forEach((pmAccountID) => {
        if (this.policy.accounts.accounts_ids[pmAccountID].read) {
          authorizeAccountIDs.push(parseInt(pmAccountID));
        }
      });
    }
    return authorizeAccountIDs;
  };

  extractAuthorizedAccountsForUpdateFromPolicyObject = () => {
    const authorizeAccountIDs = [];
    if (this.policy?.accounts?.edit) {
      return true;
    } else if (this.policy.account && this.policy.account.account_ids) {
      Object.keys(this.policy.account.account_ids).forEach((pmAccountID) => {
        if (this.policy.account.account_ids[pmAccountID].edit) {
          authorizeAccountIDs.push(parseInt(pmAccountID));
        }
      });
    }
    return authorizeAccountIDs;
  };

  isAuthorizedToDeleteAccount = (pmAccountID) => {
    let authorization = false;
    if (
      this.policy.account &&
      !(
        this.policy.account.delete === null ||
        this.policy.account.delete === undefined
      )
    ) {
      authorization = this.policy.account.delete;
    } else if (this.policy.account && this.policy.account.account_ids) {
      if (this.policy.account.account_ids[pmAccountID]) {
        authorization = Boolean(
          this.policy.account.account_ids[pmAccountID].delete
        );
      }
    }
    return authorization;
  };

  isAuthorizedToAddTrigger = () => {
    if (this.policy?.triggers?.add) {
      return true;
    }
    return false;
  };
  isAuthorizedToReadAccount = () => {
    if (this.policy?.triggers?.read) {
      return true;
    }
    return false;
  };
  isAuthorizedToDeleteAccount = () => {
    if (this.policy?.triggers?.delete) {
      return true;
    }
    return false;
  };
}
