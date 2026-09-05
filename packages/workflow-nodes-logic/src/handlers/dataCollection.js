import { ERROR_HANDLING, NEXT_HANDLE, serializeError } from '../constants.js';

export async function executeDataCollection(nodeConfig, context, helpers = {}) {
  const {
    collectionType = 'form',
    title = 'Input required',
    description = '',
    formSchema = { type: 'object', properties: {} },
    formUischema = { type: 'VerticalLayout', elements: [] },
    outputVariable = 'collectedData',
    expiryMinutes = 60,
    errorHandling = ERROR_HANDLING.FAIL_WORKFLOW,
  } = nodeConfig ?? {};
  const { resolveTemplate } = helpers;
  try {
    const resolvedTitle = resolveTemplate ? resolveTemplate(title) : title;
    const resolvedDescription = resolveTemplate ? resolveTemplate(description) : description;
    const collectionConfig = {
      collectionType,
      title: resolvedTitle,
      description: resolvedDescription,
      formSchema,
      formUischema,
      outputVariable,
      expiryMinutes,
    };
    return {
      output: collectionConfig,
      nextHandle: NEXT_HANDLE.OUTPUT,
      suspended: true,
    };
  } catch (err) {
    if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw err;
    return {
      output: { [outputVariable]: null, success: false, error: serializeError(err) },
      nextHandle: NEXT_HANDLE.ERROR,
    };
  }
}
