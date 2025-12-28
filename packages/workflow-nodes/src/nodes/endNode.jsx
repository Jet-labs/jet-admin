import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { VscDebugStop } from 'react-icons/vsc';
import { FaCheck, FaTimes, FaExclamationTriangle, FaPlus, FaTrash } from 'react-icons/fa';
import { IoMdArrowDropleft } from 'react-icons/io';

// ============================================================================
// End Status Types
// ============================================================================
const END_STATUS = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  CANCELLED: 'cancelled',
};

// ============================================================================
// OutputParameterEditor - For defining workflow output parameters
// ============================================================================
const OutputParameterEditor = ({ parameters, onChange, availableVariables }) => {
  const addParameter = () => {
    const newParam = {
      id: `output_${Date.now()}`,
      name: `output${parameters.length + 1}`,
      sourceVariable: '',
      description: '',
    };
    onChange([...parameters, newParam]);
  };

  const updateParameter = (index, field, value) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeParameter = (index) => {
    const updated = parameters.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-500">Output Parameters</label>
        <button
          type="button"
          onClick={addParameter}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-white text-[#646cff] hover:bg-[#646cff]/10 rounded transition-colors border border-slate-200"
        >
          <FaPlus className="w-2.5 h-2.5" />
          Add Output
        </button>
      </div>

      <p className="text-[10px] text-slate-400">
        Define outputs that will be returned when the workflow completes.
      </p>

      {parameters.length === 0 ? (
        <div className="text-xs text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded">
          No output parameters defined. Workflow will complete with no output.
        </div>
      ) : (
        <div className="space-y-2">
          {parameters.map((param, index) => (
            <div
              key={param.id}
              className="border border-slate-200 rounded p-2 bg-slate-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IoMdArrowDropleft className="w-3 h-3 text-red-500" />
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => updateParameter(index, 'name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="text-xs font-mono font-medium text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 w-28 focus:outline-none focus:border-[#646cff]"
                    placeholder="outputName"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeParameter(index)}
                  className="p-1 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Remove output"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>

              {/* Source Variable */}
              <div>
                <label className="text-[10px] text-slate-400">Source Variable</label>
                <input
                  type="text"
                  value={param.sourceVariable}
                  onChange={(e) => updateParameter(index, 'sourceVariable', e.target.value)}
                  placeholder="ctx.result or a value"
                  className="w-full text-xs p-1.5 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
                />
                {availableVariables.length > 0 && (
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Available: {availableVariables.slice(0, 5).map(v => `ctx.${v.variable}`).join(', ')}
                    {availableVariables.length > 5 && '...'}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mt-2">
                <label className="text-[10px] text-slate-400">Description</label>
                <input
                  type="text"
                  value={param.description}
                  onChange={(e) => updateParameter(index, 'description', e.target.value)}
                  placeholder="What this output represents"
                  className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:border-[#646cff]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EndNodeConfigurator - JSON Forms based configuration
// ============================================================================
export const EndNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || 'End',
    description: data?.description || '',
    status: data?.status || END_STATUS.SUCCESS,
    outputParameters: data?.outputParameters || [],
  });

  // Sync form data when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || 'End',
        description: data.description || '',
        status: data.status || END_STATUS.SUCCESS,
        outputParameters: data.outputParameters || [],
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
        title: {
          type: 'string',
          title: 'Node Title',
        },
        description: {
          type: 'string',
          title: 'Description',
        },
        status: {
          type: 'string',
          title: 'Completion Status',
          enum: Object.values(END_STATUS),
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
          options: { placeholder: 'Describe this end point...', multi: true, rows: 2 },
        },
        {
          type: 'Control',
          scope: '#/properties/status',
          options: {
            enumLabels: {
              [END_STATUS.SUCCESS]: '✓ Success',
              [END_STATUS.FAILURE]: '✗ Failure',
              [END_STATUS.CANCELLED]: '⚠ Cancelled',
            },
          },
        },
      ],
    };
  }, []);

  // Handle form changes
  const handleFormChange = useCallback(({ data: newData }) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  // Handle parameters change
  const handleParametersChange = useCallback((newParams) => {
    setFormData(prev => ({ ...prev, outputParameters: newParams }));
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

        {/* Output parameters editor */}
        <div className="border-t border-slate-100 pt-4">
          <OutputParameterEditor
            parameters={formData.outputParameters}
            onChange={handleParametersChange}
            availableVariables={availableVariables}
          />
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
// EndNode - Minimalist flat landscape design with execution status
// ============================================================================
export const EndNode = memo(({ id, data, isConnectable }) => {
  const { strings, nodeExecutionStatus } = useWorkflowNodes();
  
  // Get execution status for this node
  const executionStatus = nodeExecutionStatus?.[id] || 'idle';

  const status = data?.status || END_STATUS.SUCCESS;
  const outputParams = data?.outputParameters || [];
  const outputCount = outputParams.length;

  // Status colors and icons based on END_STATUS (config status, not execution status)
  const getStatusConfig = () => {
    switch (status) {
      case END_STATUS.SUCCESS:
        return {
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-100',
          textColor: 'text-green-500',
          hoverBorder: 'hover:border-green-400',
          handleColor: '#22c55e',
          icon: FaCheck,
          label: 'Success',
        };
      case END_STATUS.FAILURE:
        return {
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
          textColor: 'text-red-500',
          hoverBorder: 'hover:border-red-400',
          handleColor: '#ef4444',
          icon: FaTimes,
          label: 'Failure',
        };
      case END_STATUS.CANCELLED:
        return {
          color: 'amber',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          textColor: 'text-amber-500',
          hoverBorder: 'hover:border-amber-400',
          handleColor: '#f59e0b',
          icon: FaExclamationTriangle,
          label: 'Cancelled',
        };
      default:
        return {
          color: 'slate',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-100',
          textColor: 'text-slate-500',
          hoverBorder: 'hover:border-slate-400',
          handleColor: '#94a3b8',
          icon: VscDebugStop,
          label: 'End',
        };
    }
  };

  // Execution status-based styling
  const getExecutionStatusStyles = () => {
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
        return 'border-slate-200';
    }
  };

  // Execution status indicator icon
  const ExecutionIndicator = () => {
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

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`
      relative bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${getExecutionStatusStyles()} ${statusConfig.hoverBorder} hover:shadow-md
    `}>
      <ExecutionIndicator />
      
      {/* Input Handle only (End node has no output) */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: statusConfig.handleColor,
          border: 'none',
          top: '-5px',
        }}
      />

      {/* Main content - horizontal layout */}
      <div className="flex items-stretch">

        {/* Left: Icon */}
        <div
          style={{
            borderTopLeftRadius: "0.25rem",
            borderBottomLeftRadius: "0.25rem",
          }}
          className={`
            flex flex-col items-center justify-center px-3 py-3 border-r
            ${executionStatus === 'running' ? 'bg-blue-100 border-blue-200' :
              executionStatus === 'completed' ? 'bg-green-100 border-green-200' :
              executionStatus === 'failed' ? 'bg-red-50 border-red-100' :
              `${statusConfig.bgColor} ${statusConfig.borderColor}`}
          `}
        >
          <StatusIcon className={`w-5 h-5 ${
            executionStatus === 'running' ? 'text-blue-600' :
            executionStatus === 'completed' ? 'text-green-600' :
            executionStatus === 'failed' ? 'text-red-600' :
            statusConfig.textColor
          }`} />
        </div>

        {/* Center: Main info */}
        <div className="flex-1 px-3 py-2 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold truncate text-slate-700">
              {data?.title || 'End'}
            </span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Output info */}
          <div className="text-[10px] mt-0.5 text-slate-400">
            {outputCount === 0 
              ? 'No outputs defined' 
              : `${outputCount} output${outputCount !== 1 ? 's' : ''}: ${outputParams.slice(0, 3).map(p => p.name).join(', ')}${outputCount > 3 ? '...' : ''}`
            }
          </div>
        </div>

        {/* Right: Status indicator */}
        <div className="flex flex-col items-center justify-center px-2 border-l border-slate-100">
          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: statusConfig.handleColor }} title={statusConfig.label} />
        </div>
      </div>
    </div>
  );
});
