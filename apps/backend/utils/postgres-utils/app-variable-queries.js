const appVariableQueryUtils = {};

appVariableQueryUtils.addAppVariable = () =>
  `
  INSERT INTO tbl_pm_app_variables (
    pm_app_variable_title,
    pm_app_variable_value,
    is_internal
  ) VALUES (?, ?, ?)
`;

appVariableQueryUtils.getAllAppVariables = (authorizedAppVariables) => {
  if (
    authorizedAppVariables === true ||
    authorizedAppVariables === null ||
    authorizedAppVariables === undefined
  ) {
    return `SELECT * FROM tbl_pm_app_variables`;
  } else {
    // Fetch app_variables where pm_app_variable_id is in the authorizedAppVariables array
    return `SELECT * FROM tbl_pm_app_variables WHERE pm_app_variable_id IN (${authorizedAppVariables
      .map(() => "?")
      .join(", ")})`;
  }
};
appVariableQueryUtils.getAllInternalAppVariables = (authorizedAppVariables) => {
  if (
    authorizedAppVariables === true ||
    authorizedAppVariables === null ||
    authorizedAppVariables === undefined
  ) {
    return `SELECT * FROM tbl_pm_app_variables WHERE is_internal = true`;
  } else {
    // Fetch app_variables where pm_app_variable_id is in the authorizedAppVariables array
    return `SELECT * FROM tbl_pm_app_variables WHERE pm_app_variable_id IN (${authorizedAppVariables
      ?.map(() => "?")
      ?.join(", ")}) AND is_internal = true`;
  }
};
appVariableQueryUtils.getAppVariableByID = () =>
  `SELECT * FROM tbl_pm_app_variables WHERE pm_app_variable_id = ?`;

appVariableQueryUtils.updateAppVariable = () =>
  `UPDATE tbl_pm_app_variables SET pm_app_variable_title = ?, pm_app_variable_value = ?, is_internal = ? WHERE pm_app_variable_id = ?`;

appVariableQueryUtils.deleteAppVariable = () =>
  `DELETE FROM tbl_pm_app_variables WHERE pm_app_variable_id = ?`;

module.exports = { appVariableQueryUtils };
