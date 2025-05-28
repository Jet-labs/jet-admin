
/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.widget - Database chart configuration object
 * @param {Array<Object>} params.dataQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
export const processBarChartQueryResults = ({
  widget,
  dataQueriesResult,
}) => {
  // Collect all x-axis values
  const xValues = new Set();
  widget.dataQueries.forEach((mapping, index) => {
    const result = dataQueriesResult[index]?.result || [];
    const xField = mapping.datasetFields?.xAxis;
    if (xField) {
      result.forEach((row) => xValues.add(row[xField]));
    }
  });

  // Sort labels
  const sortedLabels = [...xValues].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return a.toString().localeCompare(b.toString());
  });

  // Build datasets
  const datasets = widget.dataQueries.map((mapping, index) => {
    const result = dataQueriesResult[index]?.result || [];
    const { xAxis, yAxis } = mapping.datasetFields;
    const dataMap = new Map(result.map((row) => [row[xAxis], row[yAxis]]));

    return {
      ...mapping.parameters,
      label: mapping.title,
      data: sortedLabels.map((x) => dataMap.get(x) ?? 0),
    };
  });

  return { labels: sortedLabels, datasets };
};

