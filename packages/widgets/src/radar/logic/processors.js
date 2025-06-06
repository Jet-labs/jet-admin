/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseWidget - Database chart configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
export const processRadarChartQueryResults = ({
  databaseWidget,
  databaseQueriesResult,
}) => {
  // Collect all labels
  const labels = new Set();
  databaseWidget.databaseQueries.forEach((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    const label = mapping.datasetFields?.label;
    if (label) {
      result.forEach((row) => labels.add(row[label]));
    }
  });

  // Sort labels
  const sortedLabels = [...labels].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return a.toString().localeCompare(b.toString());
  });

  // Build datasets
  const datasets = databaseWidget.databaseQueries.map((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    const { label, value } = mapping.datasetFields;
    const dataMap = new Map(result.map((row) => [row[label], row[value]]));

    return {
      ...mapping.parameters,
      label: mapping.title,
      data: sortedLabels.map((x) => dataMap.get(x) ?? 0),
    };
  });

  return { labels: sortedLabels, datasets };
};
