import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { VscDebugStart } from 'react-icons/vsc';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { IoMdArrowDropright } from 'react-icons/io';

// ============================================================================
// Input Parameter Types
// ============================================================================
const PARAM_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
};

// ============================================================================
// InputParameterEditor - For defining workflow input parameters
// ============================================================================
const InputParameterEditor = ({ parameters, onChange }) => {
  const addParameter = () => {
    const newParam = {
      id: `param_${Date.now()}`,
      name: `param${parameters.length + 1}`,
      type: PARAM_TYPES.STRING,
      required: false,
      defaultValue: '',
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
        <label className="text-xs font-medium text-slate-500">Input Parameters</label>
        <button
          type="button"
          onClick={addParameter}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-white text-[#646cff] hover:bg-[#646cff]/10 rounded transition-colors border border-slate-200"
        >
          <FaPlus className="w-2.5 h-2.5" />
          Add Parameter
        </button>
      </div>

      <p className="text-[10px] text-slate-400">
        Define inputs that will be available as <code className="bg-slate-100 px-1 rounded">ctx.input.paramName</code>
      </p>

      {parameters.length === 0 ? (
        <div className="text-xs text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded">
          No input parameters defined. Workflow can still be triggered.
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
                  <IoMdArrowDropright className="w-3 h-3 text-green-500" />
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => updateParameter(index, 'name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="text-xs font-mono font-medium text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 w-28 focus:outline-none focus:border-[#646cff]"
                    placeholder="paramName"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeParameter(index)}
                  className="p-1 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Remove parameter"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Type */}
                <div>
                  <label className="text-[10px] text-slate-400">Type</label>
                  <select
                    value={param.type}
                    onChange={(e) => updateParameter(index, 'type', e.target.value)}
                    className="w-full text-xs text-slate-700 p-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:border-[#646cff]"
                  >
                    <option value={PARAM_TYPES.STRING}>String</option>
                    <option value={PARAM_TYPES.NUMBER}>Number</option>
                    <option value={PARAM_TYPES.BOOLEAN}>Boolean</option>
                    <option value={PARAM_TYPES.OBJECT}>Object</option>
                    <option value={PARAM_TYPES.ARRAY}>Array</option>
                  </select>
                </div>

                {/* Required */}
                <div>
                  <label className="text-[10px] text-slate-400">Required</label>
                  <div className="flex items-center h-[30px]">
                    <input
                      type="checkbox"
                      checked={param.required}
                      onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                      className="w-4 h-4 text-[#646cff] rounded border-slate-300 focus:ring-[#646cff]"
                    />
                    <span className="text-xs text-slate-500 ml-2">{param.required ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Default Value */}
              <div className="mt-2">
                <label className="text-[10px] text-slate-400">Default Value</label>
                <input
                  type="text"
                  value={param.defaultValue}
                  onChange={(e) => updateParameter(index, 'defaultValue', e.target.value)}
                  placeholder={param.type === PARAM_TYPES.OBJECT ? '{}' : param.type === PARAM_TYPES.ARRAY ? '[]' : ''}
                  className="w-full text-xs text-slate-700 p-1.5 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
                />
              </div>

              {/* Description */}
              <div className="mt-2">
                <label className="text-[10px] text-slate-400">Description</label>
                <input
                  type="text"
                  value={param.description}
                  onChange={(e) => updateParameter(index, 'description', e.target.value)}
                  placeholder="What is this parameter for?"
                  className="w-full text-xs text-slate-700 p-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:border-[#646cff]"
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
// StartNodeConfigurator - JSON Forms based configuration
// ============================================================================
export const StartNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || 'Start',
    description: data?.description || '',
    inputParameters: data?.inputParameters || [],
  });

  // Sync form data when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || 'Start',
        description: data.description || '',
        inputParameters: data.inputParameters || [],
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

  // Handle parameters change
  const handleParametersChange = useCallback((newParams) => {
    setFormData(prev => ({ ...prev, inputParameters: newParams }));
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

        {/* Info about triggers */}
        <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-600">
          <strong>Triggers:</strong> Workflows can be started manually or via HTTP webhook (POST /api/workflows/:id/run)
        </div>

        {/* Input parameters editor */}
        <div className="border-t border-slate-100 pt-4">
          <InputParameterEditor
            parameters={formData.inputParameters}
            onChange={handleParametersChange}
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
// StartNode - Minimalist flat landscape design with execution status
// ============================================================================
export const StartNode = memo(({ id, data, isConnectable }) => {
  const { strings, nodeExecutionStatus } = useWorkflowNodes();
  
  // Get execution status for this node
  const executionStatus = nodeExecutionStatus?.[id] || 'idle';

  const inputParams = data?.inputParameters || [];
  const paramCount = inputParams.length;

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

          {/* Input params info */}
          <div className="text-[10px] mt-0.5 text-slate-400">
            {paramCount === 0 
              ? 'No input parameters' 
              : `${paramCount} input${paramCount !== 1 ? 's' : ''}: ${inputParams.slice(0, 3).map(p => p.name).join(', ')}${paramCount > 3 ? '...' : ''}`
            }
          </div>

          {/* Required params indicator */}
          {inputParams.some(p => p.required) && (
            <div className="text-[9px] mt-0.5 text-amber-500">
              * Has required parameters
            </div>
          )}
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
