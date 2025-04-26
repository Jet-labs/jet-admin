const Logger = require("../../utils/logger");

const databaseChartProcessor = {};

/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseChart - Database chart configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
databaseChartProcessor.processBarChartQueryResults = ({
  databaseChart,
  databaseQueriesResult,
}) => {
  // Collect all x-axis values
  const xValues = new Set();
  databaseChart.databaseQueries.forEach((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    const xField = mapping.datasetFields?.xAxis;
    if (xField) {
      result.forEach((row) => xValues.add(row[xField]));
    }
  });

  Logger.log("info", {
    message: "databaseChartProcessor:processBarChartQueryResults:xValues",
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
  const datasets = databaseChart.databaseQueries.map((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
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

/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseChart - Database chart configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
databaseChartProcessor.processLineChartQueryResults = ({
  databaseChart,
  databaseQueriesResult,
}) => {
  // Collect all x-axis values
  const xValues = new Set();
  databaseChart.databaseQueries.forEach((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    const xField = mapping.datasetFields?.xAxis;
    if (xField) {
      result.forEach((row) => xValues.add(row[xField]));
    }
  });

  Logger.log("info", {
    message: "databaseChartProcessor:processBarChartQueryResults:xValues",
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
  const datasets = databaseChart.databaseQueries.map((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
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

/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseChart - Database chart configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
databaseChartProcessor.processPieChartQueryResults = ({
  databaseChart,
  databaseQueriesResult,
}) => {
  // Collect all labels
  const labels = new Set();
  databaseChart.databaseQueries.forEach((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    const label = mapping.datasetFields?.label;
    if (label) {
      result.forEach((row) => labels.add(row[label]));
    }
  });

  Logger.log("info", {
    message: "databaseChartProcessor:processBarChartQueryResults:labels",
    params: {
      labels: Array.from(labels),
    },
  });

  // Sort labels
  const sortedLabels = [...labels].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return a.toString().localeCompare(b.toString());
  });

  // Build datasets
  const datasets = databaseChart.databaseQueries.map((mapping, index) => {
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

/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseChart - Database chart configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
databaseChartProcessor.processDoughnutChartQueryResults = ({
  databaseChart,
  databaseQueriesResult,
}) => {
  // Collect all labels
  const labels = new Set();
  databaseChart.databaseQueries.forEach((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    const label = mapping.datasetFields?.label;
    if (label) {
      result.forEach((row) => labels.add(row[label]));
    }
  });

  Logger.log("info", {
    message: "databaseChartProcessor:processBarChartQueryResults:labels",
    params: {
      labels: Array.from(labels),
    },
  });

  // Sort labels
  const sortedLabels = [...labels].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return a.toString().localeCompare(b.toString());
  });

  // Build datasets
  const datasets = databaseChart.databaseQueries.map((mapping, index) => {
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

/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseChart - Database chart configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
databaseChartProcessor.processScatterChartQueryResults = ({
  databaseChart,
  databaseQueriesResult,
}) => {
  const datasets = databaseChart.databaseQueries.map((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
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

/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseChart - Database chart configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
databaseChartProcessor.processBubbleChartQueryResults = ({
  databaseChart,
  databaseQueriesResult,
}) => {
  const datasets = databaseChart.databaseQueries.map((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    const { xAxis, yAxis, radius } = mapping.datasetFields;

    // Convert each row to {x, y} coordinate objects
    const data = result.map((row) => ({
      x: row[xAxis],
      y: row[yAxis],
      r: row[radius],
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

/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseChart - Database chart configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
databaseChartProcessor.processPolarAreaChartQueryResults = ({
  databaseChart,
  databaseQueriesResult,
}) => {
  // Collect all labels
  const labels = new Set();
  databaseChart.databaseQueries.forEach((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    const label = mapping.datasetFields?.label;
    if (label) {
      result.forEach((row) => labels.add(row[label]));
    }
  });

  Logger.log("info", {
    message: "databaseChartProcessor:processBarChartQueryResults:labels",
    params: {
      labels: Array.from(labels),
    },
  });

  // Sort labels
  const sortedLabels = [...labels].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return a.toString().localeCompare(b.toString());
  });

  // Build datasets
  const datasets = databaseChart.databaseQueries.map((mapping, index) => {
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

/**
 * Processes raw query results into Chart.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseChart - Database chart configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Chart.js compatible data structure with labels and datasets
 */
databaseChartProcessor.processRadarChartQueryResults = ({
  databaseChart,
  databaseQueriesResult,
}) => {
  // Collect all labels
  const labels = new Set();
  databaseChart.databaseQueries.forEach((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    const label = mapping.datasetFields?.label;
    if (label) {
      result.forEach((row) => labels.add(row[label]));
    }
  });

  Logger.log("info", {
    message: "databaseChartProcessor:processBarChartQueryResults:labels",
    params: {
      labels: Array.from(labels),
    },
  });

  // Sort labels
  const sortedLabels = [...labels].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return a.toString().localeCompare(b.toString());
  });

  // Build datasets
  const datasets = databaseChart.databaseQueries.map((mapping, index) => {
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

module.exports = { databaseChartProcessor };
