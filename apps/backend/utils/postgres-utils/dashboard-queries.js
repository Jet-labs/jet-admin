const dashboardQueryUtils = {};

dashboardQueryUtils.addDashboard = () =>
  `INSERT INTO tbl_pm_dashboards (pm_dashboard_title, pm_dashboard_description, pm_dashboard_options) VALUES (?, ?, ?)`;

dashboardQueryUtils.getAllDashboards = (authorizedDashboards) => {
  if (
    authorizedDashboards === true ||
    authorizedDashboards === null ||
    authorizedDashboards === undefined
  ) {
    return `SELECT * FROM tbl_pm_dashboards`;
  } else {
    // Fetch dashboards where pm_dashboard_id is in the authorizedDashboards array
    return `SELECT * FROM tbl_pm_dashboards WHERE pm_dashboard_id IN (${authorizedDashboards
      .map(() => "?")
      .join(", ")})`;
  }
};
dashboardQueryUtils.getDashboardByID = () =>
  `SELECT * FROM tbl_pm_dashboards WHERE pm_dashboard_id = ?`;

dashboardQueryUtils.updateDashboard = () =>
  `UPDATE tbl_pm_dashboards SET pm_dashboard_title = ?, pm_dashboard_description = ?, pm_dashboard_options = ? WHERE pm_dashboard_id = ?`;

dashboardQueryUtils.deleteDashboard = () =>
  `DELETE FROM tbl_pm_dashboards WHERE pm_dashboard_id = ?`;

module.exports = { dashboardQueryUtils };
