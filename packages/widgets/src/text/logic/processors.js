/**
 * Processes raw query results into Widget.js compatible format.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.databaseWidget - Database widget configuration object
 * @param {Array<Object>} params.databaseQueriesResult - Array of query results from execution
 * @returns {Object} Widget.js compatible data structure with labels and datasets
 */
export const processTextWidgetQueryResults = ({
  databaseWidget,
  databaseQueriesResult,
}) => {
  const dataset = [];
  let consolidatedText = "";

  databaseWidget.databaseQueries.forEach((mapping, index) => {
    const result = databaseQueriesResult[index]?.result || [];
    const textField = mapping.datasetFields?.text;
    if (textField) {
      // for text widget, 1 value of result is considered
      dataset.push({ ...mapping.parameters, text: result[0][textField] });
      consolidatedText += result[0][textField];
    }
  });

  return { dataset, text: consolidatedText };
};
