const Logger = require("../logger");

const policyAuthorizations = {};

// graph authorizations
policyAuthorizations.extractGraphAddAuthorization = ({ policyObject }) => {
  if (policyObject.graphs.add) {
    return true;
  }
  return false;
};

policyAuthorizations.extractGraphReadAuthorization = ({ policyObject }) => {
  const authorizeGraphIDs = [];
  if (policyObject.graphs.read) {
    return true;
  } else if (policyObject.graphs && policyObject.graphs.graph_ids) {
    Object.keys(policyObject.graphs.graph_ids).forEach((pmGraphID) => {
      if (
        policyObject.graphs.graph_ids[pmGraphID].read ||
        policyObject.graphs.graph_ids[pmGraphID] === true
      ) {
        authorizeGraphIDs.push(parseInt(pmGraphID));
      }
    });
  }
  return authorizeGraphIDs;
};

policyAuthorizations.extractGraphEditAuthorization = ({ policyObject }) => {
  const authorizeGraphIDs = [];
  if (policyObject.graphs.edit) {
    return true;
  } else if (policyObject.graphs && policyObject.graphs.graph_ids) {
    Object.keys(policyObject.graphs.graph_ids).forEach((pmGraphID) => {
      if (
        policyObject.graphs.graph_ids[pmGraphID].edit ||
        policyObject.graphs.graph_ids[pmGraphID] === true
      ) {
        authorizeGraphIDs.push(parseInt(pmGraphID));
      }
    });
  }
  return authorizeGraphIDs;
};

policyAuthorizations.extractGraphDeleteAuthorization = ({ policyObject }) => {
  const authorizeGraphIDs = [];
  if (policyObject.graphs.delete) {
    return true;
  } else if (policyObject.graphs && policyObject.graphs.graph_ids) {
    Object.keys(policyObject.graphs.graph_ids).forEach((pmGraphID) => {
      if (
        policyObject.graphs.graph_ids[pmGraphID].delete ||
        policyObject.graphs.graph_ids[pmGraphID] === true
      ) {
        authorizeGraphIDs.push(parseInt(pmGraphID));
      }
    });
  }
  return authorizeGraphIDs;
};

// dashboard authorizations
policyAuthorizations.extractDashboardAddAuthorization = ({ policyObject }) => {
  if (policyObject.dashboards?.add) {
    return true;
  }
  return false;
};

policyAuthorizations.extractDashboardReadAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractDashboardEditAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractDashboardDeleteAuthorization = ({
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

// query authorizations
policyAuthorizations.extractQueryAddAuthorization = ({ policyObject }) => {
  if (policyObject.queries?.add) {
    return true;
  }
  return false;
};

policyAuthorizations.extractQueryReadAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractQueryEditAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractQueryDeleteAuthorization = ({ policyObject }) => {
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

// table authorizations

policyAuthorizations.extractTableAddAuthorization = ({ policyObject }) => {
  let authorization = false;
  if (
    (policyObject.schemas?.tables === true ||
      policyObject.schemas?.tables.add) === true
  ) {
    authorization = true;
  }
  return authorization;
};

policyAuthorizations.extractRowAddAuthorization = ({
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

policyAuthorizations.extractRowReadAuthorization = ({
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
  } else if (
    typeof policyObject.tables[tableName].read == "object" ||
    typeof policyObject.tables[tableName].read == "string"
  ) {
    authorized_rows = policyObject.tables[tableName].read;
  } else {
    authorized_rows = false;
  }
  return authorized_rows;
};

policyAuthorizations.extractRowEditAuthorization = ({
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
  } else if (
    typeof policyObject.tables[tableName].edit == "object" ||
    typeof policyObject.tables[tableName].edit == "string"
  ) {
    authorized_rows = policyObject.tables[tableName].edit;
  } else {
    authorized_rows = false;
  }
  return authorized_rows;
};

policyAuthorizations.extractRowDeleteAuthorization = ({
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

// job authorizations
policyAuthorizations.extractJobAddAuthorization = ({ policyObject }) => {
  if (policyObject.jobs?.add) {
    return true;
  }
  return false;
};

policyAuthorizations.extractJobReadAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractJobEditAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractJobDeleteAuthorization = ({ policyObject }) => {
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

// app variables authorizations
policyAuthorizations.extractAppVariableAddAuthorization = ({
  policyObject,
}) => {
  if (policyObject.app_variables?.add) {
    return true;
  }
  return false;
};

policyAuthorizations.extractAppVariableReadAuthorization = ({
  policyObject,
}) => {
  const authorizeAppVariableIDs = [];
  if (policyObject.app_variables?.read) {
    return true;
  } else if (
    policyObject.app_variables &&
    policyObject.app_variables.app_variable_ids
  ) {
    Object.keys(policyObject.app_variables.app_variable_ids).forEach(
      (app_variable_id) => {
        if (
          policyObject.app_variables.app_variable_ids[app_variable_id].read ||
          policyObject.app_variables.app_variable_ids[app_variable_id] === true
        ) {
          authorizeAppVariableIDs.push(parseInt(app_variable_id));
        }
      }
    );
  }
  return authorizeAppVariableIDs;
};

policyAuthorizations.extractAppVariableEditAuthorization = ({
  policyObject,
}) => {
  const authorizeAppVariableIDs = [];
  if (policyObject.app_variables?.edit) {
    return true;
  } else if (
    policyObject.app_variables &&
    policyObject.app_variables.app_variable_ids
  ) {
    Object.keys(policyObject.app_variables.app_variable_ids).forEach(
      (app_variable_id) => {
        if (
          policyObject.app_variables.app_variable_ids[app_variable_id].edit ||
          policyObject.app_variables.app_variable_ids[app_variable_id] === true
        ) {
          authorizeAppVariableIDs.push(parseInt(app_variable_id));
        }
      }
    );
  }
  return authorizeAppVariableIDs;
};

policyAuthorizations.extractAppVariableDeleteAuthorization = ({
  policyObject,
}) => {
  const authorizeAppVariableIDs = [];
  if (policyObject.app_variables?.delete) {
    return true;
  } else if (
    policyObject.app_variables &&
    policyObject.app_variables.app_variable_ids
  ) {
    Object.keys(policyObject.app_variables.app_variable_ids).forEach(
      (app_variable_id) => {
        if (
          policyObject.app_variables.app_variable_ids[app_variable_id].delete ||
          policyObject.app_variables.app_variable_ids[app_variable_id] === true
        ) {
          authorizeAppVariableIDs.push(parseInt(app_variable_id));
        }
      }
    );
  }
  return authorizeAppVariableIDs;
};

// schema authorizations
policyAuthorizations.extractSchemaReadAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractSchemaEditAuthorization = ({ policyObject }) => {
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

// policy authorizations
policyAuthorizations.extractPolicyAddAuthorization = ({ policyObject }) => {
  if (policyObject.policies?.add) {
    return true;
  }
  return false;
};

policyAuthorizations.extractPolicyReadAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractPolicyEditAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractPolicyDeleteAuthorization = ({ policyObject }) => {
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

// account authorizations
policyAuthorizations.extractAccountAddAuthorization = ({ policyObject }) => {
  if (policyObject.accounts?.add) {
    return true;
  }
  return false;
};

policyAuthorizations.extractAccountReadAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractAccountEditAuthorization = ({ policyObject }) => {
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

policyAuthorizations.extractTriggerDeleteAuthorization = ({ policyObject }) => {
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

// trigger authorizations
policyAuthorizations.extractTriggerAddAuthorization = ({ policyObject }) => {
  return Boolean(policyObject.triggers?.add);
};

policyAuthorizations.extractTriggerReadAuthorization = ({ policyObject }) => {
  return Boolean(policyObject.triggers?.read);
};

policyAuthorizations.extractTriggerDeleteAuthorization = ({ policyObject }) => {
  return Boolean(policyObject.triggers?.delete);
};

module.exports = { policyAuthorizations };
