/**
 * Line Chart Processor
 * Transforms workflow context data into Chart.js compatible format
 */
import { resolveDatasetFields } from '../utils/pathResolvers';

/**
 * Process workflow context data for Line Chart
 */
export const processLineChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  const params = parameters || {};
  const resolved = resolveDatasetFields(context, datasetFields);
  
  const labels = resolved.xAxis || [];
  const data = resolved.yAxis || [];

  if (!Array.isArray(labels) || !Array.isArray(data)) {
    return { labels: [], datasets: [] };
  }

  return {
    labels,
    datasets: [{
      label: params.label || 'Data',
      data,
      fill: params.fill !== undefined ? params.fill : false,
      backgroundColor: params.backgroundColor || 'rgba(100, 108, 255, 0.6)',
      borderColor: params.borderColor || 'rgba(100, 108, 255, 1)',
      borderWidth: params.borderWidth || 2,
      tension: params.tension || 0.1,
    }],
  };
};
