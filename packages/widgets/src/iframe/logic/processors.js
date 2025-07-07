export const processIframeWidgetQueryResults = ({
  widget,
  dataQueriesResult,
}) => {
  const datasets = widget.dataQueries.map((mapping, index) => {
    const result = dataQueriesResult[index] || [];
    return result;
  });
  return datasets;
};
