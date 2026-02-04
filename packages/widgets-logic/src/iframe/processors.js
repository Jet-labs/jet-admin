/**
 * IFrame Widget Processor
 * Transforms workflow context data into iframe widget format
 */
import { resolveDatasetFields } from '../utils/pathResolvers';

/**
 * Process workflow context data for IFrame Widget
 */
export const processIframeWidgetWorkflowData = ({ context, datasetFields }) => {
  const resolved = resolveDatasetFields(context, datasetFields);
  return { url: resolved.url || '' };
};
