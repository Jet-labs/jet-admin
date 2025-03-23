const Logger = require("../../utils/logger");

const databaseWidgetProcessor = {};

/**
 * Processes raw query results into Widget.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseWidget - Database widget configuration object
 * @param {Array<Object>} params.queryResults - Array of query results from execution
 * @returns {Object} Widget.js compatible data structure with labels and datasets
 */
databaseWidgetProcessor.processTextWidgetQueryResults = ({
  databaseWidget,
  queryResults,
}) => {
  // Collect all x-axis values
  const xValues = new Set();
  databaseWidget.databaseQueries.forEach((mapping, index) => {
    const result = queryResults[index]?.result || [];
    const xField = mapping.datasetFields?.xAxis;
    if (xField) {
      result.forEach((row) => xValues.add(row[xField]));
    }
  });

  Logger.log("info", {
    message: "databaseWidgetProcessor:processBarWidgetQueryResults:xValues",
    params: {
      xValues: Array.from(xValues),
    },
  });

  // Sort labels
  const sortedLabels = [...xValues].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return a.toString().localeCompare(b.toString());
  });

  // Build datasets
  const datasets = databaseWidget.databaseQueries.map((mapping, index) => {
    const result = queryResults[index]?.result || [];
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


module.exports = { databaseWidgetProcessor };
