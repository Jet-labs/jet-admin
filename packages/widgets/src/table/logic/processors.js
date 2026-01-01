/**
 * Processes raw query results for Table widget.
 * @param {Object} params
 * @param {Object} params.widget - Database widget configuration object
 * @param {Array<Object>} params.dataQueriesResult - Array of query results from execution
 * @returns {Array<Array<Object>>} Processed table data (Array of datasets, where each dataset is array of rows)
 */
export const processTableWidgetQueryResults = ({
  widget,
  dataQueriesResult,
}) => {
  // If multiple queries, we return structure that supports tabs or combined view?
  // Current implementation returns array of arrays.
  // Standardizing to return the first result set if that's the primary use case, 
  // or keeping structure but fixing documentation.
  // However, typical table use case is one query.

  const datasets = widget.dataQueries.map((mapping, index) => {
    const result = dataQueriesResult[index] || [];
    return result;
  });
  return datasets;
};
