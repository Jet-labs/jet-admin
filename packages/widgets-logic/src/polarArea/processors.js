/**
 * Polar Area Chart Processor
 * Transforms workflow context data into Chart.js compatible format
 */
import { resolveDatasetFields, generateChartColors } from '../utils/pathResolvers';

/**
 * Process workflow context data for Polar Area Chart
 */
export const processPolarAreaChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  const params = parameters || {};
  const resolved = resolveDatasetFields(context, datasetFields);
  
  const labels = resolved.label || [];
  const data = resolved.value || [];

  if (!Array.isArray(labels) || !Array.isArray(data)) {
    return { labels: [], datasets: [] };
  }

  const colors = params.backgroundColor || generateChartColors(data.length);

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderColor: params.borderColor || colors.map(c => c.replace('0.6', '1')),
      borderWidth: params.borderWidth || 1,
    }],
  };
};
