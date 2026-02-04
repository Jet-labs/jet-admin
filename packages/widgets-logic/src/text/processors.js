/**
 * Text Widget Processor
 * Transforms workflow context data into text widget format
 */
import { resolveDatasetFields } from '../utils/pathResolvers';

/**
 * Process workflow context data for Text Widget
 */
export const processTextWidgetWorkflowData = ({ context, datasetFields }) => {
  const resolved = resolveDatasetFields(context, datasetFields);
  return { text: resolved.text || '' };
};
