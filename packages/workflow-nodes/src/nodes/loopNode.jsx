import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { TbRepeat } from 'react-icons/tb';
import { IoMdArrowDropright } from 'react-icons/io';
import { Button } from '@jet-admin/ui';

// ============================================================================
// Error handling options
// ============================================================================
const ERROR_HANDLING_OPTIONS = {
  FAIL_WORKFLOW: 'fail_workflow',
  CONTINUE: 'continue',
  SKIP_ITEM: 'skip_item',
};

// ============================================================================
// LoopNodeConfigurator - JSON Forms based configuration
// ============================================================================
export const LoopNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || 'Loop',
    description: data?.description || '',
    sourceVariable: data?.sourceVariable || '',
    itemVariable: data?.itemVariable || 'item',
    indexVariable: data?.indexVariable || 'index',
    maxIterations: data?.maxIterations ?? 1000,
    batchSize: data?.batchSize ?? 1,
    delayBetweenItems: data?.delayBetweenItems ?? 0,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false,
  });

  // Sync form data when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || 'Loop',
        description: data.description || '',
        sourceVariable: data.sourceVariable || '',
        itemVariable: data.itemVariable || 'item',
        indexVariable: data.indexVariable || 'index',
        maxIterations: data.maxIterations ?? 1000,
        batchSize: data.batchSize ?? 1,
        delayBetweenItems: data.delayBetweenItems ?? 0,
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
        title: {
          type: 'string',
          title: 'Node Title',
        },
        description: {
          type: 'string',
          title: 'Description',
        },
        sourceVariable: {
          type: 'string',
          title: 'Source Array',
          description: 'Variable containing the array to iterate (e.g., ctx.queryResult)',
        },
        itemVariable: {
          type: 'string',
          title: 'Item Variable Name',
          description: 'Variable name for current item (accessible as ctx.{name})',
          pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$',
        },
        indexVariable: {
          type: 'string',
          title: 'Index Variable Name',
          description: 'Variable name for current index (accessible as ctx.{name})',
          pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$',
        },
        maxIterations: {
          type: 'integer',
          title: 'Max Iterations',
          description: 'Safety limit to prevent infinite loops',
          minimum: 1,
          maximum: 100000,
          default: 1000,
        },
        batchSize: {
          type: 'integer',
          title: 'Batch Size',
          description: 'Process items in batches (1 = sequential)',
          minimum: 1,
          maximum: 100,
          default: 1,
        },
        delayBetweenItems: {
          type: 'integer',
          title: 'Delay Between Items (ms)',
          description: 'Wait time between processing each item',
          minimum: 0,
          maximum: 60000,
          default: 0,
        },
        errorHandling: {
          type: 'string',
          title: 'Error Behavior',
          enum: Object.values(ERROR_HANDLING_OPTIONS),
        },
        isDisabled: {
          type: 'boolean',
          title: 'Skip this node',
          default: false,
        },
      },
      required: ['sourceVariable', 'itemVariable'],
    };
  }, []);

  // Build UI schema with tabs
  const uischema = useMemo(() => {
    const contextHint = availableVariables.length > 0
      ? `Available: ${availableVariables.map(v => `ctx.${v.variable}`).join(', ')}`
      : 'No context variables available yet';

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
              options: { placeholder: 'Describe what this loop does...', multi: true, rows: 2 },
            },
          ],
        },
        {
          type: 'Category',
          label: 'Loop Config',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/sourceVariable',
              options: { placeholder: 'ctx.queryResult', hint: contextHint },
            },
            {
              type: 'Control',
              scope: '#/properties/itemVariable',
              options: { placeholder: 'item' },
            },
            {
              type: 'Control',
              scope: '#/properties/indexVariable',
              options: { placeholder: 'index' },
            },
          ],
        },
        {
          type: 'Category',
          label: 'Advanced',
          elements: [
            { type: 'Control', scope: '#/properties/maxIterations' },
            { type: 'Control', scope: '#/properties/batchSize' },
            { type: 'Control', scope: '#/properties/delayBetweenItems' },
            {
              type: 'Control',
              scope: '#/properties/errorHandling',
              options: {
                enumLabels: {
                  [ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW]: 'Fail Workflow',
                  [ERROR_HANDLING_OPTIONS.CONTINUE]: 'Continue to next item',
                  [ERROR_HANDLING_OPTIONS.SKIP_ITEM]: 'Skip failed item',
                },
              },
            },
            { type: 'Control', scope: '#/properties/isDisabled' },
          ],
        },
      ],
    };
  }, [availableVariables]);

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

        {/* Comprehensive instructions */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2">
          <div className="font-semibold text-slate-700 text-xs">📘 Loop Configuration</div>

          <div>
            <span className="font-medium text-slate-700">Source Array Format:</span>
            <div className="ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5">
              <div><code className="bg-white px-1 rounded">{"{{ctx.queryResult}}"}</code> → array from previous node</div>
              <div><code className="bg-white px-1 rounded">{"{{ctx.input.items}}"}</code> → array from input</div>
            </div>
          </div>

          <div>
            <span className="font-medium text-slate-700">Inside Loop Body:</span>
            <div className="ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5">
              <div><code className="bg-white px-1 rounded">ctx.item</code> → current array element</div>
              <div><code className="bg-white px-1 rounded">ctx.index</code> → current iteration index (0-based)</div>
            </div>
          </div>

          <div>
            <span className="font-medium text-slate-700">Handles:</span>
            <div className="ml-3 mt-0.5 text-slate-500">
              <strong>Loop (cyan):</strong> Executes for each item → <strong>Completed (green):</strong> After all iterations
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
        >
          Save
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// LoopNode - Minimalist flat landscape design
// ============================================================================
export const LoopNode = memo(({ data, isConnectable }) => {
  const { strings } = useWorkflowNodes();

  const isDisabled = data?.isDisabled ?? false;
  const sourceVariable = data?.sourceVariable || 'ctx.array';
  const itemVariable = data?.itemVariable || 'item';

  return (
    <div className={`
      bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled
        ? 'border-slate-200 opacity-50'
        : 'border-slate-200 hover:border-cyan-400 hover:shadow-md'
      }
      ${!data.sourceVariable ? '!border-red-400 !bg-red-50' : ''}
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
          ${isDisabled ? 'bg-slate-50 border-slate-100' : 'bg-cyan-50 border-cyan-100'}
        `}>
          <TbRepeat className={`w-5 h-5 ${isDisabled ? 'text-slate-400' : 'text-cyan-500'}`} />
        </div>

        {/* Center: Main info */}
        <div className="flex-1 px-3 py-2 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold truncate ${isDisabled ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {data?.title || 'Loop'}
            </span>
            {isDisabled && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
                <VscDebugDisconnect className="w-2.5 h-2.5" />
                Skip
              </span>
            )}
          </div>

          {/* Loop info */}
          <div className={`text-[10px] font-mono mt-0.5 ${isDisabled ? 'text-slate-300' : 'text-slate-400'}`}>
            for ({itemVariable} in {sourceVariable.length > 20 ? sourceVariable.substring(0, 20) + '...' : sourceVariable})
          </div>
        </div>

        {/* Right: Output indicators */}
        <div className="flex flex-col items-center justify-center px-2 border-l border-slate-100">
          <div className={`w-2 h-2 rounded-full mb-1 ${isDisabled ? 'bg-slate-300' : 'bg-cyan-400'}`} title="Loop Body" />
          <div className={`w-2 h-2 rounded-full ${isDisabled ? 'bg-slate-300' : 'bg-green-400'}`} title="Completed" />
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
          backgroundColor: isDisabled ? '#cbd5e1' : '#06b6d4',
          border: 'none',
          top: '-5px',
        }}
      />

      {/* Loop Body Handle (for each iteration) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="loop"
        isConnectable={isConnectable}
        style={{
          left: '35%',
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#06b6d4',
          border: 'none',
          bottom: '-5px',
        }}
      />

      {/* Completed Handle (after all iterations) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="completed"
        isConnectable={isConnectable}
        style={{
          left: '65%',
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#22c55e',
          border: 'none',
          bottom: '-5px',
        }}
      />
    </div>
  );
});
