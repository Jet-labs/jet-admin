import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { VscDebugStart } from 'react-icons/vsc';

// ============================================================================
// StartNodeConfigurator - Simple configuration for the start node
// Note: Input parameters are managed at the workflow level (workflowOptions.args),
// not in the Start Node itself.
// ============================================================================
export const StartNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || 'Start',
    description: data?.description || '',
  });

  // Sync form data when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || 'Start',
        description: data.description || '',
      });
    }
  }, [data]);

  // Build schema
  const schema = useMemo(() => {
    return {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          title: 'Node Title',
        },
        description: {
          type: 'string',
          title: 'Description',
        },
      },
    };
  }, []);

  // Build UI schema
  const uischema = useMemo(() => {
    return {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/title',
          options: { placeholder: 'Enter node title' },
        },
        {
          type: 'Control',
          scope: '#/properties/description',
          options: { placeholder: 'Describe this workflow...', multi: true, rows: 2 },
        },
      ],
    };
  }, []);

  // Handle form changes
  const handleFormChange = useCallback(({ data: newData }) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    onChange(formData);
  }, [onChange, formData]);

  return (
    <div className="w-full h-full">
      <div className="space-y-4">
        {/* Basic settings via JSON Forms */}
        <JsonForms
          schema={schema}
          uischema={uischema}
          data={formData}
          renderers={workflowNodeRenderers}
          onChange={handleFormChange}
        />

        {/* Comprehensive instructions */}
        <div className="space-y-2">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2">
            <div className="font-semibold text-slate-700 text-xs">📘 How This Works</div>

            <div>
              <span className="font-medium text-slate-700">Triggers:</span>
              <ul className="ml-3 mt-0.5 space-y-0.5 list-disc list-inside text-slate-500">
                <li>Manual: Click "Test Workflow" button</li>
                <li>API: POST /api/v1/workflows/:id/run</li>
                <li>Widget: Link workflow to a widget</li>
              </ul>
            </div>

            <div>
              <span className="font-medium text-slate-700">Input Parameters:</span>
              <div className="ml-3 mt-0.5 text-slate-500">
                Define inputs in the <strong>"Input Parameters"</strong> panel (right side).
                Access them in other nodes using: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">{"{{ctx.input.paramName}}"}</code>
              </div>
            </div>

            <div>
              <span className="font-medium text-slate-700">Variable Format:</span>
              <div className="ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5">
                <div><code className="bg-white px-1 rounded">{"{{ctx.input.userId}}"}</code> → input parameter</div>
                <div><code className="bg-white px-1 rounded">{"{{ctx.queryResult}}"}</code> → previous node output</div>
                <div><code className="bg-white px-1 rounded">{"id_{{ctx.input.id}}"}</code> → string interpolation</div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// StartNode - Minimalist flat landscape design with execution status
// ============================================================================
export const StartNode = memo(({ id, data, isConnectable }) => {
  const { strings, nodeExecutionStatus } = useWorkflowNodes();
  
  // Get execution status for this node
  const executionStatus = nodeExecutionStatus?.[id] || 'idle';

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
        return 'border-slate-200 hover:border-green-400 hover:shadow-md';
    }
  };

  // Status indicator
  const StatusIndicator = () => {
    if (executionStatus === 'running') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      );
    }
    if (executionStatus === 'completed') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (executionStatus === 'failed') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10">
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
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${getStatusStyles()}
    `}>
      <StatusIndicator />
      
      {/* Main content - horizontal layout */}
      <div className="flex items-stretch">

        {/* Left: Icon */}
        <div style={{
            borderTopLeftRadius: "0.25rem",
            borderBottomLeftRadius: "0.25rem",
        }} className={`flex flex-col items-center justify-center px-3 py-3 border-r ${
          executionStatus === 'running' ? 'bg-blue-100 border-blue-200' :
          executionStatus === 'completed' ? 'bg-green-100 border-green-200' :
          executionStatus === 'failed' ? 'bg-red-50 border-red-100' :
          'bg-green-50 border-green-100'
        }`}>
          <VscDebugStart className={`w-5 h-5 ${
            executionStatus === 'running' ? 'text-blue-600' :
            executionStatus === 'completed' ? 'text-green-600' :
            executionStatus === 'failed' ? 'text-red-600' :
            'text-green-500'
          }`} />
        </div>

        {/* Center: Main info */}
        <div className="flex-1 px-3 py-2 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold truncate text-slate-700">
              {data?.title || 'Start'}
            </span>
          </div>

          {/* Subtitle */}
          <div className="text-[10px] mt-0.5 text-slate-400">
            Workflow entry point
          </div>
        </div>

        {/* Right: Output indicator */}
        <div className="flex flex-col items-center justify-center px-2 border-l border-slate-100">
          <div className="w-2 h-2 rounded-full bg-green-400" title="Output" />
        </div>
      </div>

      {/* Output Handle only (Start node has no input) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        isConnectable={isConnectable}
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: '#22c55e',
          border: 'none',
          bottom: '-5px',
        }}
      />
    </div>
  );
});
