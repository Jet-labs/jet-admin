import { ERROR_HANDLING, NEXT_HANDLE, serializeError } from '../constants.js';

/**
 * Approval handler — specialized human-in-the-loop decision step.
 * Returns a suspension descriptor (like dataCollection); the orchestrator
 * creates the request, waits for the human signal, and routes:
 *  - approved  -> human approved (`approved: true`)
 *  - rejected  -> human rejected
 *  - expired   -> wait timed out (only when `onTimeout: 'expired'`,
 *                 otherwise the run fails like dataCollection)
 *
 * The collection form is fixed (decision + comment) so every approval renders
 * the same Approve/Reject UX. Resolved title/description support templates.
 */
export const APPROVAL_FORM_SCHEMA = {
  type: 'object',
  properties: {
    decision: {
      type: 'string',
      title: 'Your decision',
      enum: ['approve', 'reject'],
    },
    comment: { type: 'string', title: 'Comment' },
  },
  required: ['decision'],
};

export const APPROVAL_FORM_UISCHEMA = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/decision',
      options: {
        format: 'radio',
        orientation: 'vertical',
        enumLabels: {
          approve: 'Approve — proceed down the approved path',
          reject: 'Reject — take the rejected path',
        },
      },
    },
    { type: 'Control', scope: '#/properties/comment', options: { multi: true, rows: 3 } },
  ],
};

export async function executeApproval(nodeConfig, context, helpers = {}) {
  const {
    title = 'Approval required',
    description = '',
    approvers = '',
    requireComment = false,
    approveLabel = 'Accept',
    rejectLabel = 'Reject',
    cancelLabel = 'Cancel',
    expiryMinutes = 60,
    onTimeout = 'expired',
    outputVariable = 'approval',
    errorHandling = ERROR_HANDLING.FAIL_WORKFLOW,
  } = nodeConfig ?? {};
  const { resolveTemplate } = helpers;
  try {
    const schema = JSON.parse(JSON.stringify(APPROVAL_FORM_SCHEMA));
    if (requireComment && !schema.required.includes('comment')) {
      schema.required.push('comment');
    }
    const resolve = (v) => (resolveTemplate && typeof v === 'string' ? resolveTemplate(v) : v);
    const collectionConfig = {
      collectionType: 'approval',
      title: resolve(title),
      description: resolve(description),
      approvers,
      requireComment: Boolean(requireComment),
      approveLabel: resolve(approveLabel) || 'Accept',
      rejectLabel: resolve(rejectLabel) || 'Reject',
      cancelLabel: resolve(cancelLabel) || 'Cancel',
      formSchema: schema,
      formUischema: APPROVAL_FORM_UISCHEMA,
      outputVariable,
      expiryMinutes,
      onTimeout,
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
