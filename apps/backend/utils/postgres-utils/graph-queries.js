const graphQueryUtils = {};

graphQueryUtils.addGraph = () =>
  `INSERT INTO tbl_pm_graphs (pm_graph_title, pm_graph_options) VALUES (?, ?)`;

graphQueryUtils.getAllGraphs = (authorizedGraphs) => {
  if (
    authorizedGraphs === true ||
    authorizedGraphs === null ||
    authorizedGraphs === undefined
  ) {
    return `SELECT * FROM tbl_pm_graphs`;
  } else {
    // Fetch graphs where pm_graph_id is in the authorizedGraphs array
    return `SELECT * FROM tbl_pm_graphs WHERE pm_graph_id IN (${authorizedGraphs
      .map(() => "?")
      .join(", ")})`;
  }
};
graphQueryUtils.getGraphByID = () =>
  `SELECT * FROM tbl_pm_graphs WHERE pm_graph_id = ?`;

graphQueryUtils.updateGraph = () =>
  `UPDATE tbl_pm_graphs SET pm_graph_title = ?, pm_graph_options = ? WHERE pm_graph_id = ?`;

graphQueryUtils.deleteGraph = () =>
  `DELETE FROM tbl_pm_graphs WHERE pm_graph_id = ?`;

module.exports = { graphQueryUtils };
