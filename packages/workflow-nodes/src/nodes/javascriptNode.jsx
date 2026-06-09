import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { Button } from '@jet-admin/ui';
import { Ban, Clock, RefreshCw, AlertCircle, FileCode } from 'lucide-react';

// ============================================================================
// Error handling options
// ============================================================================
const ERROR_HANDLING_OPTIONS = {
  FAIL_WORKFLOW: 'fail_workflow',
  CONTINUE: 'continue',
  RETRY_THEN_CONTINUE: 'retry_then_continue',
  RETRY_THEN_FAIL: 'retry_then_fail',
};

// Representative sample value for a declared input type so the expression engine
// can infer member completions on synthesized (pre-run) context entries.
const sampleForInputType = (type) => {
  switch ((type || '').toLowerCase()) {
    case 'number':
    case 'integer':
    case 'float':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return '';
  }
};

// ============================================================================
// JavascriptNodeConfigurator - JSON Forms based configuration
// ============================================================================
export const JavascriptNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes, workflowInputDefinitions, workflowContext } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    code: data?.code || 'return true;',
    outputVariable: data?.outputVariable || 'scriptResult',
    timeoutSeconds: data?.timeoutSeconds ?? 30,
    retryLimit: data?.retryLimit ?? 0,
    retryDelaySeconds: data?.retryDelaySeconds ?? 5,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false,
  });

  // Sync form data when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        code: data.code || 'return true;',
        outputVariable: data.outputVariable || 'scriptResult',
        timeoutSeconds: data.timeoutSeconds ?? 30,
        retryLimit: data.retryLimit ?? 0,
        retryDelaySeconds: data.retryDelaySeconds ?? 5,
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false,
      });
    }
  }, [data]);

  // Build available context variables from other nodes
  const availableVariables = useMemo(() => {
    if (!workflowNodes) return [];
    return workflowNodes
      .filter(n => n.id !== nodeId && n.data?.outputVariable)
      .map(n => ({
        nodeId: n.id,
        nodeTitle: n.data?.title || n.type,
        variable: n.data.outputVariable,
      }));
  }, [workflowNodes, nodeId]);

  const intellisenseFeed = useMemo(() => {
    const feed = [];
    
    // Fallback/base intellisense using workflowNodes and workflowInputDefinitions (for when context is empty before run)
    feed.push({ parentPath: "", label: "ctx", kind: "Variable", insertText: "ctx", detail: "Workflow context object" });
    feed.push({ parentPath: "ctx", label: "input", kind: "Property", insertText: "input", detail: "Workflow Input Parameters" });
    feed.push({ parentPath: "ctx", label: "item", kind: "Property", insertText: "item", detail: "Current loop item (if inside loop)" });

    if (workflowInputDefinitions && workflowInputDefinitions.length > 0) {
      workflowInputDefinitions.forEach(inputDef => {
        feed.push({
          parentPath: "ctx.input",
          label: inputDef.key,
          kind: "Field",
          insertText: inputDef.key,
          detail: inputDef.type ? `Input parameter (${inputDef.type})` : 'Workflow Input Parameter'
        });
      });
    }

    if (workflowNodes) {
      workflowNodes
        .filter(n => n.id !== nodeId && n.data?.outputVariable)
        .forEach(n => {
          feed.push({
            parentPath: "ctx",
            label: n.data.outputVariable,
            kind: "Variable",
            insertText: n.data.outputVariable,
            detail: (n.data?.title || n.type) ? `From: ${n.data?.title || n.type}` : 'Context variable'
          });
        });
    }

    // Traverse the actual runtime workflowContext to provide deep intellisense
    const traverse = (obj, currentPath, depth = 0) => {
      // Limit recursion depth to avoid huge feeds
      if (depth > 4 || obj === null || obj === undefined) return;

      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
          Object.entries(obj[0]).forEach(([key, value]) => {
             const type = Array.isArray(value) ? 'Array' : typeof value;
             feed.push({
               parentPath: currentPath,
               label: key,
               kind: type === 'object' || type === 'Array' ? 'Property' : 'Field',
               insertText: key,
               detail: `${type} (from array item)`
             });
             if (type === 'object' || type === 'Array') {
               traverse(value, `${currentPath}.${key}`, depth + 1);
             }
          });
        }
      } else if (typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => {
           const type = Array.isArray(value) ? 'Array' : typeof value;
           feed.push({
             parentPath: currentPath,
             label: key,
             kind: type === 'object' || type === 'Array' ? 'Property' : 'Field',
             insertText: key,
             detail: type
           });
           if (type === 'object' || type === 'Array') {
             traverse(value, `${currentPath}.${key}`, depth + 1);
           }
        });
      }
    };

    if (workflowContext && Object.keys(workflowContext).length > 0) {
      traverse(workflowContext, "ctx", 0);
    }

    // Deduplicate
    const uniqueFeed = [];
    const seen = new Set();
    feed.forEach(item => {
      const key = `${item.parentPath}.${item.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueFeed.push(item);
      }
    });

    return uniqueFeed;
  }, [workflowNodes, nodeId, workflowInputDefinitions, workflowContext]);

  // Build the `ctx` state tree exposed to the JS code editor. This synthesizes a
  // pre-run shape (input parameters, preceding node outputs, loop item) and merges any
  // live runtime workflowContext on top so the engine can offer deep, accurate
  // member completions for raw-JS code (js-template mode).
  const ctxStateTree = useMemo(() => {
    const ctx = { input: {}, item: '' };

    (workflowInputDefinitions || [])
      .filter((inputDef) => typeof inputDef?.key === 'string' && inputDef.key.trim())
      .forEach((inputDef) => {
        ctx.input[inputDef.key.trim()] = sampleForInputType(inputDef.type);
      });

    if (workflowNodes) {
      workflowNodes
        .filter((n) => n.id !== nodeId && n.data?.outputVariable)
        .forEach((n) => {
          if (!(n.data.outputVariable in ctx)) {
            ctx[n.data.outputVariable] = {};
          }
        });
    }

    if (workflowContext && typeof workflowContext === 'object') {
      Object.assign(ctx, workflowContext);
    }

    return { ctx };
  }, [workflowNodes, nodeId, workflowInputDefinitions, workflowContext]);

  // Build schema
  const schema = useMemo(() => {
    return {
      type: 'object',
      properties: {
        // General Tab
        title: {
          type: 'string',
          title: strings?.WORKFLOW_EDITOR_JAVASCRIPT_TITLE_LABEL || 'Node Title',
        },
        description: {
          type: 'string',
          title: strings?.WORKFLOW_EDITOR_NODE_DESCRIPTION_LABEL || 'Description',
        },
        code: {
          type: 'string',
          format: 'code-javascript',
          title: strings?.WORKFLOW_EDITOR_JAVASCRIPT_CODE_LABEL || 'JavaScript Code',
        },

        // Output Tab
        outputVariable: {
          type: 'string',
          title: strings?.WORKFLOW_EDITOR_OUTPUT_VARIABLE_LABEL || 'Output Variable Name',
          description: 'Variable name to store result (accessible as ctx.{name})',
          pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$',
        },

        // Execution Settings Tab
        timeoutSeconds: {
          type: 'integer',
          title: strings?.WORKFLOW_EDITOR_TIMEOUT_LABEL || 'Timeout (seconds)',
          minimum: 1,
          maximum: 300,
          default: 30,
        },
        retryLimit: {
          type: 'integer',
          title: strings?.WORKFLOW_EDITOR_RETRY_LIMIT_LABEL || 'Retry Attempts',
          minimum: 0,
          maximum: 10,
          default: 0,
        },
        retryDelaySeconds: {
          type: 'integer',
          title: strings?.WORKFLOW_EDITOR_RETRY_DELAY_LABEL || 'Retry Delay (seconds)',
          minimum: 1,
          maximum: 300,
          default: 5,
        },
        errorHandling: {
          type: 'string',
          title: strings?.WORKFLOW_EDITOR_ERROR_HANDLING_LABEL || 'Error Behavior',
          enum: Object.values(ERROR_HANDLING_OPTIONS),
        },
        isDisabled: {
          type: 'boolean',
          title: strings?.WORKFLOW_EDITOR_IS_DISABLED_LABEL || 'Skip this node',
          default: false,
        },
      },
      required: ['code'],
    };
  }, [strings]);

  // Build UI schema with tabs
  const uischema = useMemo(() => {
    // Build context hint string
    const contextHint = availableVariables.length > 0
      ? `Available: ${availableVariables.map(v => `ctx.${v.variable}`).join(', ')}`
      : 'No context variables available yet';

    return {
      type: 'Categorization',
      elements: [
        {
          type: 'Category',
          label: strings?.WORKFLOW_EDITOR_TAB_GENERAL || 'General',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/title',
              options: {
                placeholder: strings?.WORKFLOW_EDITOR_JAVASCRIPT_TITLE_PLACEHOLDER || 'Enter node title',
              },
            },
            {
              type: 'Control',
              scope: '#/properties/description',
              options: {
                placeholder: strings?.WORKFLOW_EDITOR_NODE_DESCRIPTION_PLACEHOLDER || 'Describe what this script does...',
                multi: true,
                rows: 2,
              },
            },
            {
              type: 'Control',
              scope: '#/properties/code',
              options: {
                format: 'code-javascript',
                multi: true,
                rows: 12,
                placeholder: '// Your JavaScript code here\n// Access context: ctx.variableName\n// Return a value to store in outputVariable\nreturn true;',
                hint: contextHint,
                intellisenseFeed: intellisenseFeed,
                stateTree: ctxStateTree,
                showHeader: true,
              },
            },
          ],
        },
        {
          type: 'Category',
          label: strings?.WORKFLOW_EDITOR_TAB_OUTPUT || 'Output',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/outputVariable',
              options: {
                placeholder: 'e.g., scriptResult, processedData, isValid',
              },
            },
          ],
        },
        {
          type: 'Category',
          label: strings?.WORKFLOW_EDITOR_TAB_ADVANCED || 'Advanced',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/timeoutSeconds',
            },
            {
              type: 'Control',
              scope: '#/properties/retryLimit',
            },
            {
              type: 'Control',
              scope: '#/properties/retryDelaySeconds',
            },
            {
              type: 'Control',
              scope: '#/properties/errorHandling',
              options: {
                enumLabels: {
                  [ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW]: 'Fail Workflow',
                  [ERROR_HANDLING_OPTIONS.CONTINUE]: 'Continue (ignore error)',
                  [ERROR_HANDLING_OPTIONS.RETRY_THEN_CONTINUE]: 'Retry, then Continue',
                  [ERROR_HANDLING_OPTIONS.RETRY_THEN_FAIL]: 'Retry, then Fail',
                },
              },
            },
            {
              type: 'Control',
              scope: '#/properties/isDisabled',
            },
          ],
        },
      ],
    };
  }, [strings, availableVariables, intellisenseFeed, ctxStateTree]);

  // Handle form changes
  const handleFormChange = useCallback(({ data: newData }) => {
    setFormData(newData);
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    onChange(formData);
  }, [onChange, formData]);

  return (
    <div className="w-full">
      <div className="space-y-3">
        <JsonForms
          schema={schema}
          uischema={uischema}
          data={formData}
          renderers={workflowNodeRenderers}
          onChange={handleFormChange}
        />

        {/* Comprehensive instructions */}
        <div className="p-2.5 bg-brand-dark border border-brand-border rounded-sm text-[10px] text-brand-text-primary space-y-2">
          <div className="font-semibold text-brand-text-primary text-xs">📘 Writing JavaScript Code</div>

          <div>
            <span className="font-medium text-brand-text-primary">Access Context:</span>
            <div className="ml-3 mt-0.5 text-brand-text-primary font-mono text-[9px] space-y-0.5">
              <div><code className="bg-brand-black px-1 rounded-sm">ctx.input.paramName</code> → workflow input</div>
              <div><code className="bg-brand-black px-1 rounded-sm">ctx.queryResult</code> → previous node output</div>
              <div><code className="bg-brand-black px-1 rounded-sm">ctx.item</code> → current loop item</div>
            </div>
          </div>

          <div>
            <span className="font-medium text-brand-text-primary">Return Value:</span>
            <div className="ml-3 mt-0.5 text-brand-text-primary">
              Use <code className="bg-brand-black px-1 py-0.5 rounded-sm font-mono">return yourValue;</code> to store result in output variable.
            </div>
          </div>

          <div>
            <span className="font-medium text-brand-text-primary">Available Globals:</span>
            <div className="ml-3 mt-0.5 text-brand-text-primary">
              <code className="bg-brand-black px-1 rounded-sm font-mono text-[9px]">JSON, Math, Date, Array, Object, String, Number, Boolean, parseInt, parseFloat</code>
            </div>
          </div>

          <div className="text-amber-600 bg-amber-50 border border-amber-800 rounded-sm p-1.5 mt-2">
            <strong>⚠️ Note:</strong> Code runs in a sandbox. No network access, filesystem, or require().
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          className="w-full"
        >
          {strings?.WORKFLOW_EDITOR_JAVASCRIPT_NODE_SAVE_BUTTON || 'Save'}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// JavascriptNode - Minimalist flat landscape design with execution status
// ============================================================================
export const JavascriptNode = memo(({ id, data, isConnectable }) => {
  const { strings, nodeExecutionStatus } = useWorkflowNodes();

  // Get execution status for this node
  const executionStatus = nodeExecutionStatus?.[id] || 'idle';

  const isDisabled = data?.isDisabled ?? false;
  const hasRetry = (data?.retryLimit ?? 0) > 0;
  const hasCustomTimeout = (data?.timeoutSeconds ?? 30) !== 30;
  const outputVar = data.outputVariable || 'scriptResult';
  const codePreview = data.code
    ? data.code.trim().split('\n')[0].substring(0, 25) + (data.code.length > 25 ? '...' : '')
    : '// No code';

  // Status-based styling
  const getStatusStyles = () => {
    switch (executionStatus) {
      case 'running':
        return 'border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse';
      case 'completed':
        return 'border-green-400 ring-2 ring-green-300 ring-opacity-50';
      case 'failed':
        return 'border-red-400 ring-2 ring-red-300 ring-opacity-50';
      case 'skipped':
        return 'border-orange-300 opacity-60';
      default:
        return 'border-brand-border hover:border-yellow-400 hover:shadow-md';
    }
  };

  // Status indicator icon
  const StatusIndicator = () => {
    if (executionStatus === 'running') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-spin">
          <RefreshCw className="w-3 h-3 text-foreground" />
        </div>
      );
    }
    if (executionStatus === 'completed') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (executionStatus === 'failed') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`
      relative bg-brand-black border rounded
      min-w-[340px] max-w-[400px]
      transition-all duration-150
      ${isDisabled
        ? 'border-brand-border opacity-50'
        : getStatusStyles()
      }
      ${!data.code ? '!border-red-400 !bg-red-950/40' : ''}
    `}>
      <StatusIndicator />

      {/* Main content - horizontal layout */}
      <div className="flex items-stretch">

        {/* Left: Icon & Type */}
        <div
          style={{
            borderTopLeftRadius: "0.25rem",
            borderBottomLeftRadius: "0.25rem",
          }}
          className={`
          flex flex-col items-center justify-center px-3 py-3 border-r
          ${isDisabled ? 'bg-brand-dark border-brand-border' :
              executionStatus === 'running' ? 'bg-primary/10/40 border-blue-800' :
                executionStatus === 'completed' ? 'bg-green-950/40 border-green-800' :
                  executionStatus === 'failed' ? 'bg-red-950/40 border-red-800' :
                    'bg-yellow-950/40 border-yellow-800'}
        `}>
          <FileCode className={`w-5 h-5 ${isDisabled ? 'text-brand-text-primary' :
              executionStatus === 'running' ? 'text-primary' :
                executionStatus === 'completed' ? 'text-green-600' :
                  executionStatus === 'failed' ? 'text-red-600' :
                    'text-yellow-500'
            }`} />
        </div>

        {/* Center: Main info */}
        <div className="flex-1 px-3 py-2 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold truncate ${isDisabled ? 'text-brand-text-primary line-through' : 'text-brand-text-primary'}`}>
              {data?.title || 'Untitled Script'}
            </span>
            {isDisabled && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm border border-orange-800">
                <Ban className="w-2.5 h-2.5" />
                Skip
              </span>
            )}
          </div>

          {/* Code preview */}
          <div className={`text-[10px] font-mono truncate mt-0.5 ${isDisabled ? 'text-brand-text-primary' : 'text-brand-text-primary'}`}>
            {codePreview}
          </div>
        </div>

        {/* Right: Outputs indicator */}
        <div className="flex flex-col items-center justify-center px-2 border-l border-brand-border">
          <div className={`w-2 h-2 rounded-full mb-1 ${isDisabled ? 'bg-brand-black' : 'bg-green-400'}`} title="Success" />
          <div className={`w-2 h-2 rounded-full ${isDisabled ? 'bg-brand-black' : 'bg-red-400'}`} title="Error" />
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#eab308',
          border: 'none',
          top: '-5px',
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        isConnectable={isConnectable}
        style={{
          left: '35%',
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#22c55e',
          border: 'none',
          bottom: '-5px',
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        isConnectable={isConnectable}
        style={{
          left: '65%',
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#ef4444',
          border: 'none',
          bottom: '-5px',
        }}
      />
    </div>
  );
});
