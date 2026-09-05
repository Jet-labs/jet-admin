import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { Layers, RefreshCw, Ban } from 'lucide-react';
import { Button } from '@jet-admin/ui';

const ERROR_HANDLING_OPTIONS = {
  FAIL_WORKFLOW: 'fail_workflow',
  CONTINUE: 'continue',
  RETRY_THEN_CONTINUE: 'retry_then_continue',
  RETRY_THEN_FAIL: 'retry_then_fail',
};

export const SubWorkflowNodeConfigurator = ({ data, onChange, nodeId }) => {
  const {
    workflows,
    currentWorkflowID,
    workflowSearch,
    setWorkflowSearch,
    strings,
    workflowNodes,
    workflowEdges,
    workflowInputDefinitions,
  } = useWorkflowNodes();

  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    childWorkflowID: data?.childWorkflowID || '',
    inputMapping: data?.inputMapping || {},
    outputVariable: data?.outputVariable || 'subResult',
    ctxMode: data?.ctxMode || 'isolated',
    mergeOutputs: data?.mergeOutputs ?? false,
    maxDepth: data?.maxDepth ?? 5,
    timeoutSeconds: data?.timeoutSeconds ?? 300,
    retryLimit: data?.retryLimit ?? 0,
    retryDelaySeconds: data?.retryDelaySeconds ?? 5,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        childWorkflowID: data.childWorkflowID || '',
        inputMapping: data.inputMapping || {},
        outputVariable: data.outputVariable || 'subResult',
        ctxMode: data.ctxMode || 'isolated',
        mergeOutputs: data.mergeOutputs ?? false,
        maxDepth: data.maxDepth ?? 5,
        timeoutSeconds: data.timeoutSeconds ?? 300,
        retryLimit: data.retryLimit ?? 0,
        retryDelaySeconds: data.retryDelaySeconds ?? 5,
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false,
      });
    }
  }, [data]);

  // Child picker excludes the workflow being edited (no self-reference).
  const workflowOptions = useMemo(() => {
    return (workflows || [])
      .filter((w) => String(w.workflowID) !== String(currentWorkflowID))
      .map((w) => ({ value: String(w.workflowID), label: w.title || 'Untitled workflow' }));
  }, [workflows, currentWorkflowID]);

  const selectedChild = useMemo(() => {
    return (workflows || []).find((w) => String(w.workflowID) === String(formData.childWorkflowID)) || null;
  }, [workflows, formData.childWorkflowID]);

  // Guided mapping: the child's declared inputs become the mapping keys.
  const childInputDefinitions = useMemo(() => {
    const defs = selectedChild?.workflowOptions?.inputDefinitions;
    return Array.isArray(defs) ? defs.filter((d) => d && d.key) : [];
  }, [selectedChild]);

  // Upstream context tree for {{ctx.*}} template assistance.
  const upstreamStateTree = useMemo(() => {
    const tree = { ctx: { input: {} } };
    if (workflowInputDefinitions && workflowInputDefinitions.length > 0) {
      workflowInputDefinitions.forEach((inputDef) => {
        if (inputDef.key) tree.ctx.input[inputDef.key] = '';
      });
    }
    if (nodeId && workflowEdges && workflowEdges.length > 0) {
      const upstreamIds = new Set();
      const visited = new Set();
      const queue = [nodeId];
      while (queue.length > 0) {
        const id = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        const incomingEdges = workflowEdges.filter((e) => e.target === id);
        for (const edge of incomingEdges) {
          if (!visited.has(edge.source)) {
            upstreamIds.add(edge.source);
            queue.push(edge.source);
          }
        }
      }
      workflowNodes?.forEach((node) => {
        if (node.id !== nodeId && upstreamIds.has(node.id) && node.data?.outputVariable) {
          tree.ctx[node.data.outputVariable] = {};
        }
      });
    }
    return tree;
  }, [workflowNodes, workflowEdges, workflowInputDefinitions, nodeId]);

  const schema = useMemo(() => ({
    type: 'object',
    properties: {
      title: { type: 'string', title: strings.WORKFLOW_EDITOR_SUBWORKFLOW_TITLE_LABEL || 'Node Title' },
      description: { type: 'string', title: strings.WORKFLOW_EDITOR_NODE_DESCRIPTION_LABEL || 'Description' },
      childWorkflowID: { type: 'string', title: strings.WORKFLOW_EDITOR_SUBWORKFLOW_CHILD_LABEL || 'Child Workflow' },
      inputMapping: { type: 'object', title: strings.WORKFLOW_EDITOR_SUBWORKFLOW_INPUTS_LABEL || 'Child Inputs' },
      outputVariable: { type: 'string', title: strings.WORKFLOW_EDITOR_OUTPUT_VARIABLE_LABEL || 'Output Variable Name', pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$' },
      mergeOutputs: { type: 'boolean', title: strings.WORKFLOW_EDITOR_SUBWORKFLOW_MERGE_LABEL || 'Merge child outputs into parent context', default: false },
      maxDepth: { type: 'integer', title: strings.WORKFLOW_EDITOR_SUBWORKFLOW_MAXDEPTH_LABEL || 'Max Nesting Depth', minimum: 1, maximum: 10, default: 5 },
      timeoutSeconds: { type: 'integer', title: strings.WORKFLOW_EDITOR_TIMEOUT_LABEL || 'Timeout (seconds)', minimum: 1, maximum: 3600, default: 300 },
      retryLimit: { type: 'integer', title: strings.WORKFLOW_EDITOR_RETRY_LIMIT_LABEL || 'Retry Attempts', minimum: 0, maximum: 10, default: 0 },
      retryDelaySeconds: { type: 'integer', title: strings.WORKFLOW_EDITOR_RETRY_DELAY_LABEL || 'Retry Delay (seconds)', minimum: 1, maximum: 300, default: 5 },
      errorHandling: { type: 'string', title: strings.WORKFLOW_EDITOR_ERROR_HANDLING_LABEL || 'Error Behavior', enum: Object.values(ERROR_HANDLING_OPTIONS) },
      isDisabled: { type: 'boolean', title: strings.WORKFLOW_EDITOR_IS_DISABLED_LABEL || 'Skip this node', default: false },
    },
    required: ['childWorkflowID'],
  }), [strings]);

  const uischema = useMemo(() => {
    const generalElements = [
      { type: 'Control', scope: '#/properties/title', options: { placeholder: 'Enter node title' } },
      { type: 'Control', scope: '#/properties/description', options: { placeholder: 'Describe what the child workflow does...', multi: true, rows: 2 } },
      {
        type: 'Control',
        scope: '#/properties/childWorkflowID',
        options: {
          isSearchSelect: true,
          placeholder: 'Select a child workflow…',
          options: workflowOptions,
          onSearchChange: setWorkflowSearch,
        },
      },
    ];
    if (childInputDefinitions.length > 0) {
      generalElements.push({
        type: 'Control', scope: '#/properties/inputMapping',
        options: { isDynamicKeyValueInput: true, keys: childInputDefinitions, stateTree: upstreamStateTree },
      });
    } else if (formData.childWorkflowID) {
      generalElements.push({
        type: 'Control', scope: '#/properties/inputMapping',
        options: { isDynamicKeyValueInput: true, keys: [], stateTree: upstreamStateTree, hint: 'Child declares no inputs — mapping is optional.' },
      });
    }
    return {
      type: 'Categorization',
      elements: [
        { type: 'Category', label: strings.WORKFLOW_EDITOR_TAB_GENERAL || 'General', elements: generalElements },
        {
          type: 'Category', label: strings.WORKFLOW_EDITOR_TAB_OUTPUT || 'Output', elements: [
            { type: 'Control', scope: '#/properties/outputVariable', options: { placeholder: 'e.g., subResult, childReport' } },
            { type: 'Control', scope: '#/properties/mergeOutputs' },
          ],
        },
        {
          type: 'Category', label: strings.WORKFLOW_EDITOR_TAB_ADVANCED || 'Advanced', elements: [
            { type: 'Control', scope: '#/properties/maxDepth' },
            { type: 'Control', scope: '#/properties/timeoutSeconds' },
            { type: 'Control', scope: '#/properties/retryLimit' },
            { type: 'Control', scope: '#/properties/retryDelaySeconds' },
            {
              type: 'Control', scope: '#/properties/errorHandling', options: {
                enumLabels: {
                  [ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW]: 'Fail Workflow',
                  [ERROR_HANDLING_OPTIONS.CONTINUE]: 'Continue (ignore error)',
                  [ERROR_HANDLING_OPTIONS.RETRY_THEN_CONTINUE]: 'Retry, then Continue',
                  [ERROR_HANDLING_OPTIONS.RETRY_THEN_FAIL]: 'Retry, then Fail',
                },
              },
            },
            { type: 'Control', scope: '#/properties/isDisabled' },
          ],
        },
      ],
    };
  }, [strings, workflowOptions, selectedChild, childInputDefinitions, upstreamStateTree, formData.childWorkflowID, setWorkflowSearch]);

  const handleFormChange = useCallback(({ data: newData }) => {
    setFormData((prev) => {
      if (prev.childWorkflowID !== newData.childWorkflowID) {
        return { ...newData, inputMapping: {} };
      }
      return newData;
    });
  }, []);

  const handleSave = useCallback(() => { onChange(formData); }, [onChange, formData]);

  return (
    <div className="w-full">
      <JsonForms schema={schema} uischema={uischema} data={formData} renderers={workflowNodeRenderers} onChange={handleFormChange} />

      <div className="px-2">
        <div className="rounded border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
          <div className="font-semibold text-xs text-foreground">📘 Sub-Workflow (isolated)</div>
          <div>
            The child sees <span className="font-medium text-foreground">only</span> the mapped inputs as its{' '}
            <code className="bg-brand-dark px-1 rounded border border-border font-mono">{'ctx.input'}</code>.
            Its result lands in <code className="bg-brand-dark px-1 rounded border border-border font-mono">{'ctx.{outputVariable}'}</code> with{' '}
            <code className="bg-brand-dark px-1 rounded border border-border font-mono">childInstanceID</code> for audit.
          </div>
          <div>
            <span className="font-medium text-foreground">Mapping format:</span>
            <div className="ml-3 mt-0.5 font-mono text-[9px] space-y-0.5">
              <div><code className="bg-brand-dark px-1 rounded border border-border">{'{{ctx.input.vs}}'}</code> → forward parent input</div>
              <div><code className="bg-brand-dark px-1 rounded border border-border">{'{{ctx.marketSummary}}'}</code> → from previous node</div>
            </div>
          </div>
          <div className="text-amber-600 bg-amber-50 border border-amber-800 rounded p-1.5 mt-2">
            <strong>⚠️ Note:</strong> the parent waits for the child (sync). Keep the node timeout above the child's expected duration.
          </div>
        </div>
      </div>

      <div className="px-2 mt-2">
        <Button type="button" size="sm" onClick={handleSave} className="w-full">
          {strings.WORKFLOW_EDITOR_SUBWORKFLOW_SAVE_BUTTON || 'Save'}
        </Button>
      </div>
    </div>
  );
};

// ── Canvas card ───────────────────────────────────────────────────────────────

export const SubWorkflowNode = memo(({ id, data, isConnectable }) => {
  const { workflows, nodeExecutionStatus } = useWorkflowNodes();
  const [childTitle, setChildTitle] = useState('Select Workflow');
  const executionStatus = nodeExecutionStatus?.[id] || 'idle';

  useEffect(() => {
    if (data.childWorkflowID && workflows) {
      const child = workflows.find((w) => String(w.workflowID) === String(data.childWorkflowID));
      setChildTitle(child?.title || 'Unknown Workflow');
    } else {
      setChildTitle('Select Workflow');
    }
  }, [data.childWorkflowID, workflows]);

  const isDisabled = data?.isDisabled ?? false;

  const getStatusStyles = () => {
    switch (executionStatus) {
      case 'running': return 'border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse';
      case 'completed': return 'border-green-400 ring-2 ring-green-300 ring-opacity-50';
      case 'failed': return 'border-red-400 ring-2 ring-red-300 ring-opacity-50';
      case 'skipped': return 'border-orange-300 opacity-60';
      default: return 'border-brand-border hover:border-fuchsia-400 hover:shadow-md';
    }
  };

  const StatusIndicator = () => {
    if (executionStatus === 'running') return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-spin">
        <RefreshCw className="w-3 h-3 text-foreground" />
      </div>
    );
    if (executionStatus === 'completed') return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
    if (executionStatus === 'failed') return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
    return null;
  };

  return (
    <div className={`relative bg-brand-black border rounded min-w-[280px] max-w-[350px] transition-all duration-150 ${isDisabled ? 'border-brand-border opacity-50' : getStatusStyles()} ${!data.childWorkflowID ? '!border-red-400 !bg-red-950/40' : ''}`}>
      <StatusIndicator />
      <div className="flex items-stretch">
        <div style={{ borderTopLeftRadius: '0.25rem', borderBottomLeftRadius: '0.25rem' }}
          className={`flex flex-col items-center justify-center px-3 py-3 border-r ${isDisabled ? 'bg-brand-dark border-brand-border' :
            executionStatus === 'running' ? 'bg-blue-950/40 border-blue-800' :
              executionStatus === 'completed' ? 'bg-green-950/40 border-green-800' :
                executionStatus === 'failed' ? 'bg-red-950/40 border-red-800' :
                  'bg-fuchsia-950/40 border-fuchsia-800'
            }`}
        >
          <Layers className={`w-5 h-5 ${isDisabled ? 'text-brand-text-primary' : executionStatus === 'running' ? 'text-blue-600' : executionStatus === 'completed' ? 'text-green-600' : executionStatus === 'failed' ? 'text-red-600' : 'text-fuchsia-500'}`} />
        </div>
        <div className="flex-1 px-3 py-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold truncate ${isDisabled ? 'text-brand-text-primary line-through' : 'text-brand-text-primary'}`}>{data?.title || 'Untitled'}</span>
            {isDisabled && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-800">
                <Ban className="w-2.5 h-2.5" />Skip
              </span>
            )}
          </div>
          <div className={`text-sm truncate mt-0.5 ${isDisabled ? 'text-brand-text-primary' : 'text-brand-text-primary'}`}>
            {childTitle.length > 20 ? `${String(childTitle).substring(0, 20)}...` : childTitle}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-2 border-l border-brand-border">
          <div className={`w-2 h-2 rounded-full mb-1 ${isDisabled ? 'bg-brand-black' : 'bg-green-400'}`} title="Success" />
          <div className={`w-2 h-2 rounded-full ${isDisabled ? 'bg-brand-black' : 'bg-red-400'}`} title="Error" />
        </div>
      </div>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ width: '10px', height: '10px', backgroundColor: isDisabled ? '#cbd5e1' : '#d946ef', border: 'none', top: '-5px' }} />
      <Handle type="source" position={Position.Bottom} id="success" isConnectable={isConnectable} style={{ left: '35%', width: '10px', height: '10px', backgroundColor: isDisabled ? '#cbd5e1' : '#22c55e', border: 'none', bottom: '-5px' }} />
      <Handle type="source" position={Position.Bottom} id="error" isConnectable={isConnectable} style={{ left: '65%', width: '10px', height: '10px', backgroundColor: isDisabled ? '#cbd5e1' : '#ef4444', border: 'none', bottom: '-5px' }} />
    </div>
  );
});
