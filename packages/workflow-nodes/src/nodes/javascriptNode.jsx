import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { FaJs } from 'react-icons/fa';
import { IoMdTime } from 'react-icons/io';
import { TbRefresh } from 'react-icons/tb';
import { BiErrorCircle } from 'react-icons/bi';
import { VscDebugDisconnect } from 'react-icons/vsc';

// ============================================================================
// Error handling options
// ============================================================================
const ERROR_HANDLING_OPTIONS = {
  FAIL_WORKFLOW: 'fail_workflow',
  CONTINUE: 'continue',
  RETRY_THEN_CONTINUE: 'retry_then_continue',
  RETRY_THEN_FAIL: 'retry_then_fail',
};

// ============================================================================
// JavascriptNodeConfigurator - JSON Forms based configuration
// ============================================================================
export const JavascriptNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
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
  }, [strings, availableVariables]);

  // Handle form changes
  const handleFormChange = useCallback(({ data: newData }) => {
    setFormData(newData);
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    onChange(formData);
  }, [onChange, formData]);

  return (
    <div className="w-full h-full">
      <div className="space-y-3">
        <JsonForms
          schema={schema}
          uischema={uischema}
          data={formData}
          renderers={workflowNodeRenderers}
          onChange={handleFormChange}
        />
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
        >
          {strings?.WORKFLOW_EDITOR_JAVASCRIPT_NODE_SAVE_BUTTON || 'Save'}
        </button>
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
        return 'border-slate-200 hover:border-yellow-400 hover:shadow-md';
    }
  };

  // Status indicator icon
  const StatusIndicator = () => {
    if (executionStatus === 'running') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
          <TbRefresh className="w-3 h-3 text-white" />
        </div>
      );
    }
    if (executionStatus === 'completed') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (executionStatus === 'failed') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`
      relative bg-white border rounded
      min-w-[340px] max-w-[400px]
      transition-all duration-150
      ${isDisabled
        ? 'border-slate-200 opacity-50'
        : getStatusStyles()
      }
      ${!data.code ? '!border-red-400 !bg-red-50' : ''}
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
          ${isDisabled ? 'bg-slate-50 border-slate-100' :
              executionStatus === 'running' ? 'bg-blue-100 border-blue-200' :
                executionStatus === 'completed' ? 'bg-green-50 border-green-100' :
                  executionStatus === 'failed' ? 'bg-red-50 border-red-100' :
                    'bg-yellow-50 border-yellow-100'}
        `}>
          <FaJs className={`w-5 h-5 ${isDisabled ? 'text-slate-400' :
              executionStatus === 'running' ? 'text-blue-600' :
                executionStatus === 'completed' ? 'text-green-600' :
                  executionStatus === 'failed' ? 'text-red-600' :
                    'text-yellow-500'
            }`} />
        </div>

        {/* Center: Main info */}
        <div className="flex-1 px-3 py-2 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold truncate ${isDisabled ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {data?.title || 'Untitled Script'}
            </span>
            {isDisabled && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
                <VscDebugDisconnect className="w-2.5 h-2.5" />
                Skip
              </span>
            )}
          </div>

          {/* Code preview */}
          <div className={`text-[10px] font-mono truncate mt-0.5 ${isDisabled ? 'text-slate-300' : 'text-slate-400'}`}>
            {codePreview}
          </div>
        </div>

        {/* Right: Outputs indicator */}
        <div className="flex flex-col items-center justify-center px-2 border-l border-slate-100">
          <div className={`w-2 h-2 rounded-full mb-1 ${isDisabled ? 'bg-slate-300' : 'bg-green-400'}`} title="Success" />
          <div className={`w-2 h-2 rounded-full ${isDisabled ? 'bg-slate-300' : 'bg-red-400'}`} title="Error" />
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
