import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { Ban, Clock } from 'lucide-react';
import { Button } from '@jet-admin/ui';

// ============================================================================
// DelayNodeConfigurator - JSON Forms based configuration
// ============================================================================
export const DelayNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || 'Delay',
    description: data?.description || '',
    delayType: data?.delayType || 'fixed',
    delayMs: data?.delayMs ?? 1000,
    delaySeconds: data?.delaySeconds ?? 0,
    delayMinutes: data?.delayMinutes ?? 0,
    // For dynamic delay
    delayVariable: data?.delayVariable || '',
    // For until time
    untilTime: data?.untilTime || '',
    isDisabled: data?.isDisabled ?? false,
  });

  // Sync form data when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || 'Delay',
        description: data.description || '',
        delayType: data.delayType || 'fixed',
        delayMs: data.delayMs ?? 1000,
        delaySeconds: data.delaySeconds ?? 0,
        delayMinutes: data.delayMinutes ?? 0,
        delayVariable: data.delayVariable || '',
        untilTime: data.untilTime || '',
        isDisabled: data.isDisabled ?? false,
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
        delayType: {
          type: 'string',
          title: 'Delay Type',
          enum: ['fixed', 'dynamic', 'until'],
        },
        delayMs: {
          type: 'integer',
          title: 'Milliseconds',
          minimum: 0,
          maximum: 999,
          default: 0,
        },
        delaySeconds: {
          type: 'integer',
          title: 'Seconds',
          minimum: 0,
          maximum: 59,
          default: 1,
        },
        delayMinutes: {
          type: 'integer',
          title: 'Minutes',
          minimum: 0,
          maximum: 1440,
          default: 0,
        },
        delayVariable: {
          type: 'string',
          title: 'Delay Variable',
          description: 'Template resolving to delay in ms (e.g., {{ctx.waitTime}})',
        },
        untilTime: {
          type: 'string',
          title: 'Until Time',
          description: 'Wait until this time (ISO string or template like {{ctx.targetTime}})',
        },
        isDisabled: {
          type: 'boolean',
          title: 'Skip this node',
          default: false,
        },
      },
    };
  }, []);

  // Build UI schema with tabs
  const uischema = useMemo(() => {
    const delayElements = [
      {
        type: 'Control',
        scope: '#/properties/delayType',
        options: {
          enumLabels: {
            'fixed': 'Fixed Duration',
            'dynamic': 'From Variable',
            'until': 'Until Time',
          },
        },
      },
    ];

    // Add conditional fields based on delay type
    if (formData.delayType === 'fixed') {
      delayElements.push(
        { type: 'Control', scope: '#/properties/delayMinutes' },
        { type: 'Control', scope: '#/properties/delaySeconds' },
        { type: 'Control', scope: '#/properties/delayMs' }
      );
    } else if (formData.delayType === 'dynamic') {
      delayElements.push({
        type: 'Control',
        scope: '#/properties/delayVariable',
        options: { placeholder: '{{ctx.waitTime}} (in milliseconds)' },
      });
    } else if (formData.delayType === 'until') {
      delayElements.push({
        type: 'Control',
        scope: '#/properties/untilTime',
        options: { placeholder: '2024-12-31T23:59:59Z or {{ctx.targetTime}}' },
      });
    }

    return {
      type: 'Categorization',
      elements: [
        {
          type: 'Category',
          label: 'General',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/title',
              options: { placeholder: 'Enter node title' },
            },
            {
              type: 'Control',
              scope: '#/properties/description',
              options: { placeholder: 'Describe this delay...', multi: true, rows: 2 },
            },
          ],
        },
        {
          type: 'Category',
          label: 'Delay Config',
          elements: delayElements,
        },
        {
          type: 'Category',
          label: 'Advanced',
          elements: [
            { type: 'Control', scope: '#/properties/isDisabled' },
          ],
        },
      ],
    };
  }, [formData.delayType]);

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
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={formData}
        renderers={workflowNodeRenderers}
        onChange={handleFormChange}
      />

      {/* Comprehensive instructions */}
      <div className="px-2">
        <div className="p-2.5 bg-brand-dark border border-brand-border rounded text-xs text-brand-text-primary space-y-2">
          <div className="font-semibold text-brand-text-primary text-xs">📘 Delay Types</div>

          <div>
            <span className="font-medium text-brand-text-primary">Fixed Duration:</span>
            <div className="ml-3 mt-0.5 text-brand-text-primary">
              Set exact wait time using minutes, seconds, and milliseconds.
            </div>
          </div>

          <div>
            <span className="font-medium text-brand-text-primary">From Variable:</span>
            <div className="ml-3 mt-0.5 text-brand-text-primary font-mono text-[9px]">
              <code className="bg-brand-black px-1 rounded">{"{{ctx.waitTime}}"}</code> → value in milliseconds
            </div>
          </div>

          <div className="text-green-600 bg-green-50 border border-green-800 rounded p-1.5 mt-2">
            <strong>✓ Non-blocking:</strong> Delay uses queue scheduling. Workflow resources are released during wait.
          </div>
        </div>
      </div>

      <div className="px-2 mt-2">
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
// DelayNode - Minimalist flat landscape design
// ============================================================================
export const DelayNode = memo(({ data, isConnectable }) => {
  const { strings } = useWorkflowNodes();

  const isDisabled = data?.isDisabled ?? false;
  const delayType = data?.delayType || 'fixed';

  // Calculate total delay for display
  const getDelayDisplay = () => {
    if (delayType === 'dynamic') {
      return data?.delayVariable || '{{ctx.delay}}';
    }
    if (delayType === 'until') {
      const time = data?.untilTime || '';
      return time.length > 20 ? time.substring(0, 20) + '...' : time || 'until time';
    }
    
    const mins = data?.delayMinutes || 0;
    const secs = data?.delaySeconds || 0;
    const ms = data?.delayMs || 0;
    
    const parts = [];
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0) parts.push(`${secs}s`);
    if (ms > 0) parts.push(`${ms}ms`);
    
    return parts.length > 0 ? parts.join(' ') : '0s';
  };

  return (
    <div className={`
      bg-brand-black border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled
        ? 'border-brand-border opacity-50'
        : 'border-brand-border hover:border-amber-400 hover:shadow-md'
      }
    `}>
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
          ${isDisabled ? 'bg-brand-dark border-brand-border' : 'bg-amber-950/40 border-amber-100'}
        `}>
          <Clock className={`w-5 h-5 ${isDisabled ? 'text-brand-text-primary' : 'text-amber-500'}`} />
        </div>

        {/* Center: Main info */}
        <div className="flex-1 px-3 py-2 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold truncate ${isDisabled ? 'text-brand-text-primary line-through' : 'text-brand-text-primary'}`}>
              {data?.title || 'Delay'}
            </span>
            {isDisabled && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-800">
                <Ban className="w-2.5 h-2.5" />
                Skip
              </span>
            )}
          </div>

          {/* Delay info */}
          <div className={`text-xs font-mono mt-0.5 ${isDisabled ? 'text-brand-text-primary' : 'text-brand-text-primary'}`}>
            wait {getDelayDisplay()}
          </div>
        </div>

        {/* Right: Output indicator */}
        <div className="flex flex-col items-center justify-center px-2 border-l border-brand-border">
          <div className={`w-2 h-2 rounded-full ${isDisabled ? 'bg-brand-black' : 'bg-amber-400'}`} title="After Delay" />
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#f59e0b',
          border: 'none',
          top: '-5px',
        }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        isConnectable={isConnectable}
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#f59e0b',
          border: 'none',
          bottom: '-5px',
        }}
      />
    </div>
  );
});
