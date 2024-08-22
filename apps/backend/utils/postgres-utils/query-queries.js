const queryQueryUtils = {};

queryQueryUtils.addQuery = () =>
  `INSERT INTO tbl_pm_queries (
    pm_query_type,
    pm_query_title,
    pm_query_description,
    pm_query,
    pm_query_args
  ) VALUES (?, ?, ?, ?, ?)`;

queryQueryUtils.getAllQueries = (authorizedQueries) => {
  if (
    authorizedQueries === true ||
    authorizedQueries === null ||
    authorizedQueries === undefined
  ) {
    return `SELECT * FROM tbl_pm_queries`;
  } else {
    // Fetch queries where pm_query_id is in the authorizedQueries array
    return `SELECT * FROM tbl_pm_queries WHERE pm_query_id IN (${authorizedQueries
      ?.map(() => "?")
      ?.join(", ")})`;
  }
};
queryQueryUtils.getQueryByID = () =>
  `SELECT * FROM tbl_pm_queries WHERE pm_query_id = ?`;

queryQueryUtils.updateQuery = () =>
  `UPDATE tbl_pm_queries SET
    pm_query_title = ?,
    pm_query_description = ?,
    pm_query = ?,
    pm_query_args = ?,
    pm_query_metadata = ?
  WHERE pm_query_id = ?`;

queryQueryUtils.updateQueryMetadata = () =>
  `UPDATE tbl_pm_queries SET pm_query_metadata = ? WHERE pm_query_id = ?`;

queryQueryUtils.deleteQuery = () =>
  `DELETE FROM tbl_pm_queries WHERE pm_query_id = ?`;

module.exports = { queryQueryUtils };
