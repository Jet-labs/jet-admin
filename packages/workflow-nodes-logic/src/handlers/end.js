import { NEXT_HANDLE } from '../constants.js';

export async function executeEnd(nodeConfig, context, helpers = {}) {
  const { resolveTemplate } = helpers;
  const { status = 'success', outputParameters = [] } = nodeConfig || {};
  const workflowOutput = {};
  for (const param of outputParameters) {
    const { name, sourceVariable } = param;
    if (name && sourceVariable) {
      let value;
      if (resolveTemplate) {
        value = resolveTemplate(sourceVariable, { nodeType: 'end' });
      } else {
        // Fallback: direct context access for {{ctx.*}}
        const m = String(sourceVariable).match(/^\{\{\s*ctx\.([a-zA-Z0-9_.]+)\s*\}\}$/);
        if (m) {
          const path = m[1].split('.');
          let cur = context;
          for (const p of path) cur = cur?.[p];
          value = cur;
        } else {
          value = context[sourceVariable] ?? sourceVariable;
        }
      }
      workflowOutput[name] = value;
    }
  }
  return {
    output: { status, workflowOutput, completedAt: new Date().toISOString() },
    nextHandle: null,
  };
}
