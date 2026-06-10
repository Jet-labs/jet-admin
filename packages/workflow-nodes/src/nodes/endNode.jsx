import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { Button, Input } from '@jet-admin/ui';
import { Square, Check, X, AlertTriangle, Plus, Trash2, ChevronLeft } from 'lucide-react';

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
        <label className="text-xs font-medium text-brand-text-primary">Output Parameters</label>
        <Button
          type="button"
          onClick={addParameter}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-brand-black text-[#646cff] hover:bg-[#646cff]/10 rounded-sm transition-colors border border-brand-border"
        >
          <Plus className="w-2.5 h-2.5" />
          Add Output
        </Button>
      </div>

      <p className="text-[10px] text-brand-text-primary">
        Define outputs that will be returned when the workflow completes.
      </p>

      {parameters.length === 0 ? (
        <div className="text-xs text-brand-text-primary italic py-3 text-center border border-dashed border-brand-border rounded-sm">
          No output parameters defined. Workflow will complete with no output.
        </div>
      ) : (
        <div className="space-y-2">
          {parameters.map((param, index) => (
            <div
              key={param.id}
              className="border border-brand-border rounded-sm p-2 bg-brand-dark"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-3 h-3 text-red-500" />
                  <Input
                    type="text"
                    value={param.name}
                    onChange={(e) => updateParameter(index, 'name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="text-xs font-mono font-medium text-brand-text-primary bg-brand-black border border-brand-border rounded-sm px-2 py-1 w-28 focus:outline-none focus:border-[#646cff]"
                    placeholder="outputName"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeParameter(index)}
                  className="p-1 bg-brand-black text-brand-text-primary hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                  title="Remove output"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {/* Source Variable */}
              <div>
                <label className="text-[10px] text-brand-text-primary">Source Variable</label>
                <Input
                  type="text"
                  value={param.sourceVariable}
                  onChange={(e) => updateParameter(index, 'sourceVariable', e.target.value)}
                  placeholder="{{ctx.result}} or a literal value"
                  className="w-full text-xs text-brand-text-primary p-1.5 border border-brand-border rounded-sm font-mono bg-brand-black focus:outline-none focus:border-[#646cff]"
                />
                {availableVariables.length > 0 && (
                  <p className="text-[9px] text-brand-text-primary mt-0.5">
                    Available: {availableVariables.slice(0, 5).map(v => `ctx.${v.variable}`).join(', ')}
                    {availableVariables.length > 5 && '...'}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mt-2">
                <label className="text-[10px] text-brand-text-primary">Description</label>
                <Input
                  type="text"
                  value={param.description}
                  onChange={(e) => updateParameter(index, 'description', e.target.value)}
                  placeholder="What this output represents"
                  className="w-full text-xs text-brand-text-primary p-1.5 border border-brand-border rounded-sm bg-brand-black focus:outline-none focus:border-[#646cff]"
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
        <div className="border-t border-brand-border pt-4">
          <OutputParameterEditor
            parameters={formData.outputParameters}
            onChange={handleParametersChange}
            availableVariables={availableVariables}
          />
        </div>

        {/* Comprehensive instructions */}
        <div className="p-2.5 bg-brand-dark border border-brand-border rounded-sm text-[10px] text-brand-text-primary space-y-2">
          <div className="font-semibold text-brand-text-primary text-xs">📘 Workflow Output</div>

          <div>
            <span className="font-medium text-brand-text-primary">Source Variable Format:</span>
            <div className="ml-3 mt-0.5 text-brand-text-primary font-mono text-[9px] space-y-0.5">
              <div><code className="bg-brand-black px-1 rounded-sm">{"{{ctx.queryResult}}"}</code> → from previous node</div>
              <div><code className="bg-brand-black px-1 rounded-sm">{"{{ctx.processedData}}"}</code> → from script node</div>
            </div>
          </div>

          <div>
            <span className="font-medium text-brand-text-primary">Completion Status:</span>
            <div className="ml-3 mt-0.5 text-brand-text-primary">
              <strong>Success:</strong> Normal completion • <strong>Failure:</strong> Ended with error • <strong>Cancelled:</strong> Manual stop
            </div>
          </div>

          <div>
            <span className="font-medium text-brand-text-primary">Multiple End Nodes:</span>
            <div className="ml-3 mt-0.5 text-brand-text-primary">
              You can have multiple End nodes for different outcomes (e.g., success/failure branches).
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          className="w-full"
        >
          Save
        </Button>
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
          bgColor: 'bg-green-950/40',
          borderColor: 'border-green-800',
          textColor: 'text-green-500',
          hoverBorder: 'hover:border-green-400',
          handleColor: '#22c55e',
          icon: Check,
          label: 'Success',
        };
      case END_STATUS.FAILURE:
        return {
          color: 'red',
          bgColor: 'bg-red-950/40',
          borderColor: 'border-red-800',
          textColor: 'text-red-500',
          hoverBorder: 'hover:border-red-400',
          handleColor: '#ef4444',
          icon: X,
          label: 'Failure',
        };
      case END_STATUS.CANCELLED:
        return {
          color: 'amber',
          bgColor: 'bg-amber-950/40',
          borderColor: 'border-amber-100',
          textColor: 'text-amber-500',
          hoverBorder: 'hover:border-amber-400',
          handleColor: '#f59e0b',
          icon: AlertTriangle,
          label: 'Cancelled',
        };
      default:
        return {
          color: 'slate',
          bgColor: 'bg-brand-dark',
          borderColor: 'border-brand-border',
          textColor: 'text-brand-text-primary',
          hoverBorder: 'hover:border-brand-border',
          handleColor: '#94a3b8',
          icon: Square,
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
        return 'border-brand-border';
    }
  };

  // Execution status indicator icon
  const ExecutionIndicator = () => {
    if (executionStatus === 'running') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-spin z-10">
          <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      );
    }
    if (executionStatus === 'completed') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10">
          <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (executionStatus === 'failed') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10">
          <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      relative bg-brand-black border rounded
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
            ${executionStatus === 'running' ? 'bg-blue-950/40 border-blue-800' :
              executionStatus === 'completed' ? 'bg-green-950/40 border-green-800' :
              executionStatus === 'failed' ? 'bg-red-950/40 border-red-800' :
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
            <span className="text-xs font-semibold truncate text-brand-text-primary">
              {data?.title || 'End'}
            </span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-sm border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Output info */}
          <div className="text-[10px] mt-0.5 text-brand-text-primary">
            {outputCount === 0 
              ? 'No outputs defined' 
              : `${outputCount} output${outputCount !== 1 ? 's' : ''}: ${outputParams.slice(0, 3).map(p => p.name).join(', ')}${outputCount > 3 ? '...' : ''}`
            }
          </div>
        </div>

        {/* Right: Status indicator */}
        <div className="flex flex-col items-center justify-center px-2 border-l border-brand-border">
          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: statusConfig.handleColor }} title={statusConfig.label} />
        </div>
      </div>
    </div>
  );
});
