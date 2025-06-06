/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseWidget - Database chart configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
export const processTableWidgetQueryResults = ({
  databaseWidget,
  databaseQueriesResult,
}) => {
  const datasets = databaseWidget.databaseQueries.map((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    return result;
  });
  return datasets;
};
