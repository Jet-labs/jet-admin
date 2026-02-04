/**
 * Table Widget Processor
 * Transforms workflow context data into table widget format
 */
import { resolveDatasetFields } from '../utils/pathResolvers';

/**
 * Process workflow context data for Table Widget
 */
export const processTableWidgetWorkflowData = ({ context, datasetFields }) => {
  const resolved = resolveDatasetFields(context, datasetFields);
  return resolved.data || [];
};
