/**
 * Scatter Chart Processor
 * Transforms workflow context data into Chart.js compatible format
 */
import { resolveDatasetFields } from '../utils/pathResolvers';

/**
 * Process workflow context data for Scatter Chart
 */
export const processScatterChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  const params = parameters || {};
  const resolved = resolveDatasetFields(context, datasetFields);
  
  const xData = resolved.xAxis || [];
  const yData = resolved.yAxis || [];

  if (!Array.isArray(xData) || !Array.isArray(yData)) {
    return { datasets: [] };
  }

  const dataPoints = xData.map((x, i) => ({ x, y: yData[i] }));

  return {
    datasets: [{
      label: params.label || 'Data',
      data: dataPoints,
      backgroundColor: params.backgroundColor || 'rgba(100, 108, 255, 0.6)',
    }],
  };
};
