/**
 * Bar Chart Processor
 * Transforms workflow context data into Chart.js compatible format
 */
import { resolveDatasetFields } from '../utils/pathResolvers';

/**
 * Process workflow context data for Bar Chart
 * 
 * @param {object} params
 * @param {object} params.context - Workflow context data
 * @param {object} params.datasetFields - { xAxis: "{{ctx.data[*].date}}", yAxis: "{{ctx.data[*].value}}" }
 * @param {object} params.parameters - Additional chart parameters (colors, labels, etc.)
 * @returns {object} Chart.js compatible data { labels: [], datasets: [{ data: [] }] }
 */
export const processBarChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
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
      backgroundColor: params.backgroundColor || 'rgba(100, 108, 255, 0.6)',
      borderColor: params.borderColor || 'rgba(100, 108, 255, 1)',
      borderWidth: params.borderWidth || 1,
    }],
  };
};
