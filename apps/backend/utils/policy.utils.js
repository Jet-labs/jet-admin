const Logger = require("./logger");

const policyUtils = {};

policyUtils.extractAuthorizationForActions = ({
  policyObject,
  actionEntity,
  actionCommand,
}) => {
  if (
    policyObject.actions &&
    policyObject.actions[actionEntity] &&
    policyObject.actions[actionEntity].actions &&
    policyObject.actions[actionEntity].actions[actionCommand] &&
    policyObject.actions[actionEntity].actions[actionCommand] == true
  ) {
    return true;
  }
  return false;
};

policyUtils.extractAuthorizedGraphsForReadFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeGraphIDs = [];
  if (policyObject.graphs.read) {
    return true;
  } else if (policyObject.graphs && policyObject.graphs.graph_ids) {
    Object.keys(policyObject.graphs.graph_ids).forEach((graphID) => {
      if (
        policyObject.graphs.graph_ids[graphID].read ||
        policyObject.graphs.graph_ids[graphID] === true
      ) {
        authorizeGraphIDs.push(parseInt(graphID));
      }
    });
  }
  return authorizeGraphIDs;
};

policyUtils.extractAuthorizedGraphsForUpdateFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeGraphIDs = [];
  if (policyObject.graphs.edit) {
    return true;
  } else if (policyObject.graphs && policyObject.graphs.graph_ids) {
    Object.keys(policyObject.graphs.graph_ids).forEach((graphID) => {
      if (
        policyObject.graphs.graph_ids[graphID].edit ||
        policyObject.graphs.graph_ids[graphID] === true
      ) {
        authorizeGraphIDs.push(parseInt(graphID));
      }
    });
  }
  return authorizeGraphIDs;
};

policyUtils.extractAuthorizedGraphsForDeleteFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeGraphIDs = [];
  if (policyObject.graphs.delete) {
    return true;
  } else if (policyObject.graphs && policyObject.graphs.graph_ids) {
    Object.keys(policyObject.graphs.graph_ids).forEach((graphID) => {
      if (
        policyObject.graphs.graph_ids[graphID].delete ||
        policyObject.graphs.graph_ids[graphID] === true
      ) {
        authorizeGraphIDs.push(parseInt(graphID));
      }
    });
  }
  return authorizeGraphIDs;
};

policyUtils.extractAuthorizationForGraphAddFromPolicyObject = ({
  policyObject,
}) => {
  if (policyObject.graphs.add) {
    return true;
  }
  return false;
};

policyUtils.extractAuthorizedDashboardsForReadFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeDashboardIDs = [];
  if (policyObject.dashboards?.read) {
    return true;
  } else if (policyObject.dashboards && policyObject.dashboards.dashboard_ids) {
    Object.keys(policyObject.dashboards.dashboard_ids).forEach(
      (dashboard_id) => {
        if (
          policyObject.dashboards.dashboard_ids[dashboard_id].read ||
          policyObject.dashboards.dashboard_ids[dashboard_id] === true
        ) {
          authorizeDashboardIDs.push(parseInt(dashboard_id));
        }
      }
    );
  }
  return authorizeDashboardIDs;
};

policyUtils.extractAuthorizedDashboardsForUpdateFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeDashboardIDs = [];
  if (policyObject.dashboards?.edit) {
    return true;
  } else if (policyObject.dashboards && policyObject.dashboards.dashboard_ids) {
    Object.keys(policyObject.dashboards.dashboard_ids).forEach(
      (dashboard_id) => {
        if (
          policyObject.dashboards.dashboard_ids[dashboard_id].edit ||
          policyObject.dashboards.dashboard_ids[dashboard_id] === true
        ) {
          authorizeDashboardIDs.push(parseInt(dashboard_id));
        }
      }
    );
  }
  return authorizeDashboardIDs;
};

policyUtils.extractAuthorizedDashboardsForDeleteFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeDashboardIDs = [];
  if (policyObject.dashboards?.delete) {
    return true;
  } else if (policyObject.dashboards && policyObject.dashboards.dashboard_ids) {
    Object.keys(policyObject.dashboards.dashboard_ids).forEach(
      (dashboard_id) => {
        if (
          policyObject.dashboards.dashboard_ids[dashboard_id].delete ||
          policyObject.dashboards.dashboard_ids[dashboard_id] === true
        ) {
          authorizeDashboardIDs.push(parseInt(dashboard_id));
        }
      }
    );
  }
  return authorizeDashboardIDs;
};

policyUtils.extractAuthorizationForDashboardAddFromPolicyObject = ({
  policyObject,
}) => {
  if (policyObject.dashboards?.add) {
    return true;
  }
  return false;
};

policyUtils.extractAuthorizedQueriesForReadFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeQueryIDs = [];
  if (policyObject.queries?.read) {
    return true;
  } else if (policyObject.queries && policyObject.queries.query_ids) {
    Object.keys(policyObject.queries.query_ids).forEach((query_id) => {
      if (
        policyObject.queries.query_ids[query_id].read ||
        policyObject.queries.query_ids[query_id] === true
      ) {
        authorizeQueryIDs.push(parseInt(query_id));
      }
    });
  }
  return authorizeQueryIDs;
};

policyUtils.extractAuthorizedQueriesForUpdateFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeQueryIDs = [];
  if (policyObject.queries?.edit) {
    return true;
  } else if (policyObject.queries && policyObject.queries.query_ids) {
    Object.keys(policyObject.queries.query_ids).forEach((query_id) => {
      if (
        policyObject.queries.query_ids[query_id].edit ||
        policyObject.queries.query_ids[query_id] === true
      ) {
        authorizeQueryIDs.push(parseInt(query_id));
      }
    });
  }
  return authorizeQueryIDs;
};

policyUtils.extractAuthorizedQueriesForDeleteFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeQueryIDs = [];
  if (
    policyObject.queries &&
    !(
      policyObject.queries.delete === null ||
      policyObject.queries.delete === undefined
    )
  ) {
    return Boolean(policyObject.queries.delete);
  } else if (policyObject.queries && policyObject.queries.query_ids) {
    Object.keys(policyObject.queries.query_ids).forEach((query_id) => {
      if (
        policyObject.queries.query_ids[query_id].delete ||
        policyObject.queries.query_ids[query_id] === true
      ) {
        authorizeQueryIDs.push(parseInt(query_id));
      }
    });
  }
  return authorizeQueryIDs;
};

policyUtils.extractAuthorizationForQueryAddFromPolicyObject = ({
  policyObject,
}) => {
  if (policyObject.queries?.add) {
    return true;
  }
  return false;
};

policyUtils.extractAuthorizedRowsForEditFromPolicyObject = ({
  policyObject,
  tableName,
}) => {
  let authorized_rows;
  if (!policyObject.tables[tableName]) {
    authorized_rows = false;
  } else if (policyObject.tables[tableName] === true) {
    authorized_rows = true;
  } else if (!policyObject.tables[tableName].edit) {
    authorized_rows = false;
  } else if (policyObject.tables[tableName].edit === true) {
    authorized_rows = true;
  } else if (!policyObject.tables[tableName].edit.rows) {
    authorized_rows = false;
  } else if (policyObject.tables[tableName].edit.rows === true) {
    authorized_rows = true;
  } else if (typeof policyObject.tables[tableName].edit.rows == "object") {
    authorized_rows = policyObject.tables[tableName].edit.rows;
  } else {
    authorized_rows = false;
  }
  return authorized_rows;
};

policyUtils.extractAuthorizedColumnsForEditFromPolicyObject = ({
  policyObject,
  tableName,
}) => {
  let authorized_columns;
  if (!policyObject.tables[tableName]) {
    authorized_columns = false;
  } else if (policyObject.tables[tableName] === true) {
    authorized_columns = true;
  } else if (!policyObject.tables[tableName].edit) {
    authorized_columns = false;
  } else if (policyObject.tables[tableName].edit === true) {
    authorized_columns = true;
  } else if (!policyObject.tables[tableName].edit.columns) {
    authorized_columns = false;
  } else if (policyObject.tables[tableName].edit.columns === true) {
    authorized_columns = true;
  } else if (Array.isArray(policyObject.tables[tableName].edit.columns)) {
    authorized_columns = policyObject.tables[tableName].edit.columns;
  } else {
    authorized_columns = false;
  }
  return authorized_columns;
};

policyUtils.extractAuthorizedRowsForReadFromPolicyObject = ({
  policyObject,
  tableName,
}) => {
  let authorized_rows;
  if (!policyObject.tables[tableName]) {
    authorized_rows = false;
  } else if (policyObject.tables[tableName] === true) {
    authorized_rows = true;
  } else if (!policyObject.tables[tableName].read) {
    authorized_rows = false;
  } else if (policyObject.tables[tableName].read === true) {
    authorized_rows = true;
  } else if (!policyObject.tables[tableName].read.rows) {
    authorized_rows = false;
  } else if (policyObject.tables[tableName].read.rows === true) {
    authorized_rows = true;
  } else if (typeof policyObject.tables[tableName].read.rows == "object") {
    authorized_rows = policyObject.tables[tableName].read.rows;
  } else {
    authorized_rows = false;
  }
  return authorized_rows;
};

policyUtils.extractAuthorizedColumnsForReadFromPolicyObject = ({
  policyObject,
  tableName,
}) => {
  let authorized_columns;
  if (!policyObject.tables[tableName]) {
    authorized_columns = false;
  } else if (policyObject.tables[tableName] === true) {
    authorized_columns = true;
  } else if (!policyObject.tables[tableName].read) {
    authorized_columns = false;
  } else if (policyObject.tables[tableName].read === true) {
    authorized_columns = true;
  } else if (!policyObject.tables[tableName].read.columns) {
    authorized_columns = false;
  } else if (policyObject.tables[tableName].read.columns === true) {
    authorized_columns = true;
  } else if (Array.isArray(policyObject.tables[tableName].read.columns)) {
    authorized_columns = policyObject.tables[tableName].read.columns;
  } else {
    authorized_columns = false;
  }
  return authorized_columns;
};

policyUtils.extractAuthorizedIncludeColumnsForReadFromPolicyObject = ({
  policyObject,
  tableName,
}) => {
  let authorized_include_columns;
  if (
    policyObject?.tables?.[tableName]?.read?.include &&
    typeof policyObject.tables[tableName].read.include == "object"
  ) {
    authorized_include_columns = policyObject.tables[tableName].read.include;
  } else {
    authorized_include_columns = false;
  }

  return authorized_include_columns;
};

policyUtils.extractAuthorizedForRowAdditionFromPolicyObject = ({
  policyObject,
  tableName,
}) => {
  let authorization;
  if (!policyObject.tables[tableName]) {
    authorization = false;
  } else if (policyObject.tables[tableName] === true) {
    authorization = true;
  } else if (!policyObject.tables[tableName].add) {
    authorization = false;
  } else if (policyObject.tables[tableName].add === true) {
    authorization = true;
  } else {
    authorization = false;
  }
  return authorization;
};

policyUtils.extractAuthorizedForRowDeletionFromPolicyObject = ({
  policyObject,
  tableName,
}) => {
  let authorization;
  if (!policyObject.tables[tableName]) {
    authorization = false;
  } else if (policyObject.tables[tableName] === true) {
    authorization = true;
  } else if (!policyObject.tables[tableName].delete) {
    authorization = false;
  } else if (policyObject.tables[tableName].delete === true) {
    authorization = true;
  } else {
    authorization = false;
  }
  return authorization;
};

policyUtils.extractAuthorizedJobsForReadFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeJobIDs = [];
  if (policyObject.jobs?.read) {
    return true;
  } else if (policyObject.jobs && policyObject.jobs.job_ids) {
    Object.keys(policyObject.jobs.job_ids).forEach((job_id) => {
      if (
        policyObject.jobs.job_ids[job_id].read ||
        policyObject.jobs.job_ids[job_id] === true
      ) {
        authorizeJobIDs.push(parseInt(job_id));
      }
    });
  }
  return authorizeJobIDs;
};

policyUtils.extractAuthorizedJobsForUpdateFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeJobIDs = [];
  if (policyObject.jobs?.edit) {
    return true;
  } else if (policyObject.jobs && policyObject.jobs.job_ids) {
    Object.keys(policyObject.jobs.job_ids).forEach((job_id) => {
      if (
        policyObject.jobs.job_ids[job_id].edit ||
        policyObject.jobs.job_ids[job_id] === true
      ) {
        authorizeJobIDs.push(parseInt(job_id));
      }
    });
  }
  return authorizeJobIDs;
};

policyUtils.extractAuthorizedJobsForDeleteFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeJobIDs = [];
  if (policyObject.jobs?.delete) {
    return true;
  } else if (policyObject.jobs && policyObject.jobs.job_ids) {
    Object.keys(policyObject.jobs.job_ids).forEach((job_id) => {
      if (
        policyObject.jobs.job_ids[job_id].delete ||
        policyObject.jobs.job_ids[job_id] === true
      ) {
        authorizeJobIDs.push(parseInt(job_id));
      }
    });
  }
  return authorizeJobIDs;
};

policyUtils.extractAuthorizationForJobAddFromPolicyObject = ({
  policyObject,
}) => {
  if (policyObject.jobs?.add) {
    return true;
  }
  return false;
};

policyUtils.extractAuthorizedAppConstantsForReadFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeAppConstantIDs = [];
  if (policyObject.app_constants?.read) {
    return true;
  } else if (
    policyObject.app_constants &&
    policyObject.app_constants.app_constant_ids
  ) {
    Object.keys(policyObject.app_constants.app_constant_ids).forEach(
      (app_constant_id) => {
        if (
          policyObject.app_constants.app_constant_ids[app_constant_id].read ||
          policyObject.app_constants.app_constant_ids[app_constant_id] === true
        ) {
          authorizeAppConstantIDs.push(parseInt(app_constant_id));
        }
      }
    );
  }
  return authorizeAppConstantIDs;
};

policyUtils.extractAuthorizedAppConstantsForUpdateFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeAppConstantIDs = [];
  if (policyObject.app_constants?.edit) {
    return true;
  } else if (
    policyObject.app_constants &&
    policyObject.app_constants.app_constant_ids
  ) {
    Object.keys(policyObject.app_constants.app_constant_ids).forEach(
      (app_constant_id) => {
        if (
          policyObject.app_constants.app_constant_ids[app_constant_id].edit ||
          policyObject.app_constants.app_constant_ids[app_constant_id] === true
        ) {
          authorizeAppConstantIDs.push(parseInt(app_constant_id));
        }
      }
    );
  }
  return authorizeAppConstantIDs;
};

policyUtils.extractAuthorizedAppConstantsForDeleteFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeAppConstantIDs = [];
  if (policyObject.app_constants?.delete) {
    return true;
  } else if (
    policyObject.app_constants &&
    policyObject.app_constants.app_constant_ids
  ) {
    Object.keys(policyObject.app_constants.app_constant_ids).forEach(
      (app_constant_id) => {
        if (
          policyObject.app_constants.app_constant_ids[app_constant_id].delete ||
          policyObject.app_constants.app_constant_ids[app_constant_id] === true
        ) {
          authorizeAppConstantIDs.push(parseInt(app_constant_id));
        }
      }
    );
  }
  return authorizeAppConstantIDs;
};

policyUtils.extractAuthorizationForAppConstantAddFromPolicyObject = ({
  policyObject,
}) => {
  if (policyObject.app_constants?.add) {
    return true;
  }
  return false;
};

policyUtils.extractAuthorizedSchemasForReadFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeSchemaIDs = [];
  if (policyObject.schemas?.read) {
    return true;
  } else if (policyObject.schemas && policyObject.schemas.schema_ids) {
    Object.keys(policyObject.schemas.schema_ids).forEach((schema_id) => {
      if (
        policyObject.schemas.schema_ids[schema_id].read ||
        policyObject.schemas.schema_ids[schema_id] === true
      ) {
        authorizeSchemaIDs.push(parseInt(schema_id));
      }
    });
  }
  return authorizeSchemaIDs;
};

policyUtils.extractAuthorizedSchemasForUpdateFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeSchemaIDs = [];
  if (policyObject.schemas?.edit) {
    return true;
  } else if (policyObject.schemas && policyObject.schemas.schema_ids) {
    Object.keys(policyObject.schemas.schema_ids).forEach((schema_id) => {
      if (
        policyObject.schemas.schema_ids[schema_id].edit ||
        policyObject.schemas.schema_ids[schema_id] === true
      ) {
        authorizeSchemaIDs.push(parseInt(schema_id));
      }
    });
  }
  return authorizeSchemaIDs;
};

policyUtils.extractAuthorizedPoliciesForReadFromPolicyObject = ({
  policyObject,
}) => {
  const authorizePolicyIDs = [];
  if (policyObject.policies?.read) {
    return true;
  } else if (policyObject.policies && policyObject.policies.policy_ids) {
    Object.keys(policyObject.policies.policy_ids).forEach((policy_id) => {
      if (
        policyObject.policies.policy_ids[policy_id].read ||
        policyObject.policies.policy_ids[policy_id] === true
      ) {
        authorizePolicyIDs.push(parseInt(policy_id));
      }
    });
  }
  return authorizePolicyIDs;
};

policyUtils.extractAuthorizedPoliciesForUpdateFromPolicyObject = ({
  policyObject,
}) => {
  const authorizePolicyIDs = [];
  if (policyObject.policies?.edit) {
    return true;
  } else if (policyObject.policies && policyObject.policies.policy_ids) {
    Object.keys(policyObject.policies.policy_ids).forEach((policy_id) => {
      if (
        policyObject.policies.policy_ids[policy_id].edit ||
        policyObject.policies.policy_ids[policy_id] === true
      ) {
        authorizePolicyIDs.push(parseInt(policy_id));
      }
    });
  }
  return authorizePolicyIDs;
};

policyUtils.extractAuthorizedPoliciesForDeleteFromPolicyObject = ({
  policyObject,
}) => {
  const authorizePolicyIDs = [];
  if (policyObject.policies?.delete) {
    return true;
  } else if (policyObject.policies && policyObject.policies.policy_ids) {
    Object.keys(policyObject.policies.policy_ids).forEach((policy_id) => {
      if (
        policyObject.policies.policy_ids[policy_id].delete ||
        policyObject.policies.policy_ids[policy_id] === true
      ) {
        authorizePolicyIDs.push(parseInt(policy_id));
      }
    });
  }
  return authorizePolicyIDs;
};

policyUtils.extractAuthorizationForPolicyAddFromPolicyObject = ({
  policyObject,
}) => {
  if (policyObject.policies?.add) {
    return true;
  }
  return false;
};

policyUtils.extractAuthorizedAccountsForReadFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeAccountIDs = [];
  if (policyObject.accounts?.read) {
    return true;
  } else if (policyObject.accounts && policyObject.accounts.account_ids) {
    Object.keys(policyObject.accounts.policy_ids).forEach((account_id) => {
      if (
        policyObject.accounts.policy_ids[account_id].read ||
        policyObject.accounts.policy_ids[account_id] === true
      ) {
        authorizeAccountIDs.push(parseInt(account_id));
      }
    });
  }
  return authorizeAccountIDs;
};

policyUtils.extractAuthorizedAccountsForUpdateFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeAccountIDs = [];
  if (policyObject.accounts?.edit) {
    return true;
  } else if (policyObject.accounts && policyObject.accounts.policy_ids) {
    Object.keys(policyObject.accounts.policy_ids).forEach((account_id) => {
      if (
        policyObject.accounts.policy_ids[account_id].edit ||
        policyObject.accounts.policy_ids[account_id] === true
      ) {
        authorizeAccountIDs.push(parseInt(account_id));
      }
    });
  }
  return authorizeAccountIDs;
};

policyUtils.extractAuthorizedAccountsForDeleteFromPolicyObject = ({
  policyObject,
}) => {
  const authorizeAccountIDs = [];
  if (policyObject.accounts?.delete) {
    return true;
  } else if (policyObject.accounts && policyObject.accounts.policy_ids) {
    Object.keys(policyObject.accounts.policy_ids).forEach((account_id) => {
      if (
        policyObject.accounts.policy_ids[account_id].delete ||
        policyObject.accounts.policy_ids[account_id] === true
      ) {
        authorizeAccountIDs.push(parseInt(account_id));
      }
    });
  }
  return authorizeAccountIDs;
};

policyUtils.extractAuthorizationForAccountAddFromPolicyObject = ({
  policyObject,
}) => {
  if (policyObject.accounts?.add) {
    return true;
  }
  return false;
};

module.exports = { policyUtils };
