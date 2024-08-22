const appConstantQueryUtils = {};

appConstantQueryUtils.addAppConstant = () =>
  `INSERT INTO tbl_pm_app_constants (pm_app_constant_title, pm_app_constant_value, is_internal) VALUES (?, ?, ?)`;

appConstantQueryUtils.getAllAppConstants = (authorizedAppConstants) => {
  if (
    authorizedAppConstants === true ||
    authorizedAppConstants === null ||
    authorizedAppConstants === undefined
  ) {
    return `SELECT * FROM tbl_pm_app_constants`;
  } else {
    // Fetch app_constants where pm_app_constant_id is in the authorizedAppConstants array
    return `SELECT * FROM tbl_pm_app_constants WHERE pm_app_constant_id IN (${authorizedAppConstants
      .map(() => "?")
      .join(", ")})`;
  }
};
appConstantQueryUtils.getAllInternalAppConstants = (authorizedAppConstants) => {
  if (
    authorizedAppConstants === true ||
    authorizedAppConstants === null ||
    authorizedAppConstants === undefined
  ) {
    return `SELECT * FROM tbl_pm_app_constants WHERE is_internal = ?`;
  } else {
    // Fetch app_constants where pm_app_constant_id is in the authorizedAppConstants array
    return `SELECT * FROM tbl_pm_app_constants WHERE pm_app_constant_id IN (${authorizedAppConstants
      .map(() => "?")
      .join(", ")}) AND is_internal = ?`;
  }
};
appConstantQueryUtils.getAppConstantByID = () =>
  `SELECT * FROM tbl_pm_app_constants WHERE pm_app_constant_id = ?`;

appConstantQueryUtils.updateAppConstant = () =>
  `UPDATE tbl_pm_app_constants SET pm_app_constant_title = ?, pm_app_constant_value = ?, is_internal = ? WHERE pm_app_constant_id = ?`;

appConstantQueryUtils.deleteAppConstant = () =>
  `DELETE FROM tbl_pm_app_constants WHERE pm_app_constant_id = ?`;

module.exports = { appConstantQueryUtils };
