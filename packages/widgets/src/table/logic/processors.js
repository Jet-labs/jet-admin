/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.widget - Database chart configuration object
 * @param {Array<Object>} params.dataQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
export const processTableWidgetQueryResults = ({
  widget,
  dataQueriesResult,
}) => {
  const datasets = widget.dataQueries.map((mapping, index) => {
    const result = dataQueriesResult[index] || [];
    return result;
  });
  return datasets;
};
