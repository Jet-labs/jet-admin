import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowNodes } from '../context';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jet-admin/ui';
import { Ban, RefreshCw } from 'lucide-react';

const ERROR_HANDLING_OPTIONS = {
  FAIL_WORKFLOW: 'fail_workflow',
  CONTINUE: 'continue',
  RETRY_THEN_CONTINUE: 'retry_then_continue',
  RETRY_THEN_FAIL: 'retry_then_fail',
};

// ── Configurator (custom: upstream-variable checkboxes) ───────────────────────

export const JoinNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes, workflowEdges } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    sourceVariables: Array.isArray(data?.sourceVariables) ? data.sourceVariables : [],
    outputVariable: data?.outputVariable || 'joined',
    joinMode: data?.joinMode || 'all',
    requireAll: data?.requireAll ?? true,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS.CONTINUE,
    isDisabled: data?.isDisabled ?? false,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        sourceVariables: Array.isArray(data.sourceVariables) ? data.sourceVariables : [],
        outputVariable: data.outputVariable || 'joined',
        joinMode: data.joinMode || 'all',
        requireAll: data.requireAll ?? true,
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS.CONTINUE,
        isDisabled: data.isDisabled ?? false,
      });
    }
  }, [data]);

  // Upstream nodes (transitive) that produce output variables.
  const upstreamVariables = useMemo(() => {
    if (!nodeId || !workflowEdges?.length) {
      return (workflowNodes || []).filter((n) => n.id !== nodeId && n.data?.outputVariable)
        .map((n) => ({ variable: n.data.outputVariable, title: n.data?.title || n.type }));
    }
    const upstreamIds = new Set();
    const visited = new Set();
    const queue = [nodeId];
    while (queue.length > 0) {
      const id = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      for (const edge of workflowEdges.filter((e) => e.target === id)) {
        if (!visited.has(edge.source)) {
          upstreamIds.add(edge.source);
          queue.push(edge.source);
        }
      }
    }
    return (workflowNodes || [])
      .filter((n) => n.id !== nodeId && upstreamIds.has(n.id) && n.data?.outputVariable)
      .map((n) => ({ variable: n.data.outputVariable, title: n.data?.title || n.type }));
  }, [workflowNodes, workflowEdges, nodeId]);

  const set = useCallback((patch) => setFormData((prev) => ({ ...prev, ...patch })), []);

  const toggleVariable = useCallback((variable) => {
    setFormData((prev) => ({
      ...prev,
      sourceVariables: prev.sourceVariables.includes(variable)
        ? prev.sourceVariables.filter((v) => v !== variable)
        : [...prev.sourceVariables, variable],
    }));
  }, []);

  const handleSave = useCallback(() => { onChange(formData); }, [onChange, formData]);

  return (
    <div className="w-full space-y-3 p-2">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Node Title</label>
        <Input size="sm" value={formData.title} placeholder="Enter node title" onChange={(e) => set({ title: e.target.value })} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Description</label>
        <Input size="sm" value={formData.description} placeholder="What reconverges here..." onChange={(e) => set({ description: e.target.value })} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Barrier Mode</label>
        <Select value={formData.joinMode} onValueChange={(v) => set({ joinMode: v })}>
          <SelectTrigger size="sm" className="w-full text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Wait for all upstream (all)</SelectItem>
            <SelectItem value="any" className="text-xs">Fire on first upstream (any)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Collect Variables</label>
        {upstreamVariables.length === 0 && (
          <p className="text-[10px] text-muted-foreground">No upstream outputs yet — connect branch nodes first.</p>
        )}
        <div className="space-y-1 max-h-40 overflow-y-auto rounded border border-border p-2">
          {upstreamVariables.map(({ variable, title }) => (
            <label key={variable} className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sourceVariables.includes(variable)}
                onChange={() => toggleVariable(variable)}
                className="h-3.5 w-3.5"
              />
              <code className="font-mono">ctx.{variable}</code>
              <span className="text-muted-foreground truncate">({title})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Output Variable Name</label>
        <Input size="sm" value={formData.outputVariable} placeholder="joined" onChange={(e) => set({ outputVariable: e.target.value })} className="font-mono" />
      </div>

      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={!!formData.requireAll} onChange={(e) => set({ requireAll: e.target.checked })} className="h-3.5 w-3.5" />
        Require all variables (missing → error instead of null)
      </label>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Error Behavior</label>
        <Select value={formData.errorHandling} onValueChange={(v) => set({ errorHandling: v })}>
          <SelectTrigger size="sm" className="w-full text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ERROR_HANDLING_OPTIONS.CONTINUE} className="text-xs">Continue (ignore error)</SelectItem>
            <SelectItem value={ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW} className="text-xs">Fail Workflow</SelectItem>
            <SelectItem value={ERROR_HANDLING_OPTIONS.RETRY_THEN_CONTINUE} className="text-xs">Retry, then Continue</SelectItem>
            <SelectItem value={ERROR_HANDLING_OPTIONS.RETRY_THEN_FAIL} className="text-xs">Retry, then Fail</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">📘 Join</span>
        <div className="mt-1">Barrier + merge: waits per mode, then collects the checked variables into <code className="font-mono">ctx.{'{outputVariable}'}</code>.</div>
      </div>

      <Button type="button" size="sm" onClick={handleSave} className="w-full">
        {strings?.WORKFLOW_EDITOR_JAVASCRIPT_NODE_SAVE_BUTTON || 'Save'}
      </Button>
    </div>
  );
};

// ── Canvas card ───────────────────────────────────────────────────────────────

export const JoinNode = memo(({ id, data, isConnectable }) => {
  const { nodeExecutionStatus } = useWorkflowNodes();
  const executionStatus = nodeExecutionStatus?.[id] || 'idle';
  const isDisabled = data?.isDisabled ?? false;
  const sources = Array.isArray(data?.sourceVariables) ? data.sourceVariables.filter(Boolean) : [];

  const getStatusStyles = () => {
    switch (executionStatus) {
      case 'running': return 'border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse';
      case 'completed': return 'border-green-400 ring-2 ring-green-300 ring-opacity-50';
      case 'failed': return 'border-red-400 ring-2 ring-red-300 ring-opacity-50';
      case 'skipped': return 'border-orange-300 opacity-60';
      default: return 'border-brand-border hover:border-lime-400 hover:shadow-md';
    }
  };

  const StatusIndicator = () => {
    if (executionStatus === 'running') return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-spin z-10">
        <RefreshCw className="w-3 h-3 text-foreground" />
      </div>
    );
    if (executionStatus === 'completed') return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10">
        <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
    if (executionStatus === 'failed') return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10">
        <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
    return null;
  };

  return (
    <div className={`relative bg-brand-black border rounded min-w-[280px] max-w-[350px] transition-all duration-150 ${isDisabled ? 'border-brand-border opacity-50' : getStatusStyles()}`}>
      <StatusIndicator />
      <div className="flex items-stretch">
        <div style={{ borderTopLeftRadius: '0.25rem', borderBottomLeftRadius: '0.25rem' }}
          className={`flex flex-col items-center justify-center px-3 py-3 border-r ${isDisabled ? 'bg-brand-dark border-brand-border' : executionStatus === 'running' ? 'bg-blue-950/40 border-blue-800' : executionStatus === 'completed' ? 'bg-green-950/40 border-green-800' : executionStatus === 'failed' ? 'bg-red-950/40 border-red-800' : 'bg-lime-950/40 border-lime-800'}`}>
          <svg width="20" height="20" viewBox="0 0 14 14" className={`${isDisabled ? 'text-brand-text-primary' : 'text-lime-500'}`} fill="currentColor">
            <path d="M7 0 L14 7 L7 14 L0 7 Z" />
          </svg>
        </div>
        <div className="flex-1 px-3 py-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold truncate ${isDisabled ? 'text-brand-text-primary line-through' : 'text-brand-text-primary'}`}>{data?.title || 'Join'}</span>
            {isDisabled && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-800">
                <Ban className="w-2.5 h-2.5" />Skip
              </span>
            )}
          </div>
          <div className="text-[10px] font-mono truncate mt-0.5 text-brand-text-primary">
            {data?.joinMode === 'any' ? 'any' : 'all'} → {data?.outputVariable || 'joined'} ({sources.length})
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-2 border-l border-brand-border">
          <div className={`w-2 h-2 rounded-full mb-1 ${isDisabled ? 'bg-brand-black' : 'bg-green-400'}`} title="Output" />
          <div className={`w-2 h-2 rounded-full ${isDisabled ? 'bg-brand-black' : 'bg-red-400'}`} title="Error" />
        </div>
      </div>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ width: '10px', height: '10px', backgroundColor: isDisabled ? '#cbd5e1' : '#84cc16', border: 'none', top: '-5px' }} />
      <Handle type="source" position={Position.Bottom} id="output" isConnectable={isConnectable} style={{ left: '35%', width: '10px', height: '10px', backgroundColor: isDisabled ? '#cbd5e1' : '#22c55e', border: 'none', bottom: '-5px' }} />
      <Handle type="source" position={Position.Bottom} id="error" isConnectable={isConnectable} style={{ left: '65%', width: '10px', height: '10px', backgroundColor: isDisabled ? '#cbd5e1' : '#ef4444', border: 'none', bottom: '-5px' }} />
    </div>
  );
});
