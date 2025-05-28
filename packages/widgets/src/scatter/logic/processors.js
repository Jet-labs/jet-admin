/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.widget - Database chart configuration object
 * @param {Array<Object>} params.dataQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
export const processScatterChartQueryResults = ({
  widget,
  dataQueriesResult,
}) => {
  const datasets = widget.dataQueries.map((mapping, index) => {
    const result = dataQueriesResult[index]?.result || [];
    const { xAxis, yAxis } = mapping.datasetFields;

    // Convert each row to {x, y} coordinate objects
    const data = result.map((row) => ({
      x: row[xAxis],
      y: row[yAxis],
    }));

    return {
      ...mapping.parameters,
      label: mapping.title,
      data: data,

      // Preserve other dataset properties if needed
      // pointRadius: mapping.parameters?.pointRadius || 3,
    };
  });
  return { datasets };
};
