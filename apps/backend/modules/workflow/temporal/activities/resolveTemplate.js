/**
 * Shared resolveTemplate builder for Temporal activities.
 * Keeps expression-engine options in one place.
 */
const { resolveTemplate: sharedResolveTemplate } = require('@jet-admin/expression-engine');

const WORKFLOW_TEMPLATE_OPTIONS = {
  allowedRoots: ['ctx'],
  preserveSingleExpressionType: true,
};

function buildResolveTemplate(currentContext, meta = {}) {
  return (template, extraMeta = {}) =>
    sharedResolveTemplate(template, currentContext, WORKFLOW_TEMPLATE_OPTIONS, {
      module: 'workflow',
      ...meta,
      ...extraMeta,
    });
}

module.exports = { buildResolveTemplate, WORKFLOW_TEMPLATE_OPTIONS };
