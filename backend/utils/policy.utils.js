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
      if (policyObject.graphs.graph_ids[graphID].read) {
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
      if (policyObject.graphs.graph_ids[graphID].edit) {
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
module.exports = { policyUtils };
