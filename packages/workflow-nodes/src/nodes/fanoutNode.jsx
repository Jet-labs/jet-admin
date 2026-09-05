import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowNodes } from '../context';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jet-admin/ui';
import { Plus, Trash2, Ban, RefreshCw } from 'lucide-react';

const ERROR_HANDLING_OPTIONS = {
  FAIL_WORKFLOW: 'fail_workflow',
  CONTINUE: 'continue',
  RETRY_THEN_CONTINUE: 'retry_then_continue',
  RETRY_THEN_FAIL: 'retry_then_fail',
};

const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const makeBranch = (name = 'Branch') => ({ id: uid('branch'), name });

// ── Configurator ──────────────────────────────────────────────────────────────

export const FanoutNodeConfigurator = ({ data, onChange }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    branches: Array.isArray(data?.branches) && data.branches.length > 0 ? data.branches : [makeBranch('Branch A'), makeBranch('Branch B')],
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS.CONTINUE,
    isDisabled: data?.isDisabled ?? false,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        branches: Array.isArray(data.branches) && data.branches.length > 0 ? data.branches : [makeBranch('Branch A'), makeBranch('Branch B')],
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS.CONTINUE,
        isDisabled: data.isDisabled ?? false,
      });
    }
  }, [data]);

  const set = useCallback((patch) => setFormData((prev) => ({ ...prev, ...patch })), []);

  const updateBranch = useCallback((id, patch) => {
    setFormData((prev) => ({ ...prev, branches: prev.branches.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  }, []);

  const addBranch = useCallback(() => {
    setFormData((prev) => ({ ...prev, branches: [...prev.branches, makeBranch(`Branch ${String.fromCharCode(65 + prev.branches.length)}`)] }));
  }, []);

  const removeBranch = useCallback((id) => {
    setFormData((prev) => ({ ...prev, branches: prev.branches.filter((b) => b.id !== id) }));
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
        <Input size="sm" value={formData.description} placeholder="What splits here..." onChange={(e) => set({ description: e.target.value })} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Branches (all fire)</label>
          <Button type="button" variant="outline" size="sm" onClick={addBranch} className="flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {formData.branches.map((b) => (
          <div key={b.id} className="flex items-center gap-2">
            <Input size="sm" value={b.name || ''} placeholder="Branch name" onChange={(e) => updateBranch(b.id, { name: e.target.value })} className="flex-1" />
            <Button type="button" variant="ghost" size="sm" onClick={() => removeBranch(b.id)} title="Remove branch">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

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
        <span className="font-semibold text-foreground">📘 Fan-out</span>
        <div className="mt-1">Fires <span className="font-medium text-foreground">every</span> connected branch. Pair with a <span className="font-medium text-foreground">Join</span> node to reconverge. Branches run sequentially in order (deterministic — path parallelism, not threads).</div>
      </div>

      <Button type="button" size="sm" onClick={handleSave} className="w-full">
        {strings?.WORKFLOW_EDITOR_JAVASCRIPT_NODE_SAVE_BUTTON || 'Save'}
      </Button>
    </div>
  );
};

// ── Canvas card ───────────────────────────────────────────────────────────────

export const FanoutNode = memo(({ id, data, isConnectable }) => {
  const { nodeExecutionStatus } = useWorkflowNodes();
  const executionStatus = nodeExecutionStatus?.[id] || 'idle';
  const isDisabled = data?.isDisabled ?? false;
  const branches = useMemo(() => (Array.isArray(data?.branches) ? data.branches.filter((b) => b && b.id) : []), [data?.branches]);

  const totalSlots = branches.length + 1;
  const handleLeft = (i) => `${(100 / (totalSlots + 1)) * (i + 1)}%`;

  const getStatusStyles = () => {
    switch (executionStatus) {
      case 'running': return 'border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse';
      case 'completed': return 'border-green-400 ring-2 ring-green-300 ring-opacity-50';
      case 'failed': return 'border-red-400 ring-2 ring-red-300 ring-opacity-50';
      case 'skipped': return 'border-orange-300 opacity-60';
      default: return 'border-brand-border hover:border-sky-400 hover:shadow-md';
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
    <div className={`relative bg-brand-black rounded border shadow-sm min-w-[260px] max-w-[340px] transition-all duration-150 ${isDisabled ? 'border-brand-border opacity-50' : getStatusStyles()}`}>
      <StatusIndicator />
      <div className={`flex items-center gap-2.5 px-3 py-2.5 border-b rounded-t ${isDisabled ? 'bg-brand-dark border-brand-border' : executionStatus === 'running' ? 'bg-blue-950/40 border-blue-800' : executionStatus === 'completed' ? 'bg-green-950/40 border-green-800' : executionStatus === 'failed' ? 'bg-red-950/40 border-red-800' : 'bg-sky-950/40 border-sky-800'}`}>
        <svg width="14" height="14" viewBox="0 0 14 14" className={`shrink-0 ${isDisabled ? 'text-brand-text-primary' : 'text-sky-500'}`} fill="currentColor">
          <path d="M7 0 L14 7 L7 14 L0 7 Z" />
        </svg>
        <span className="text-xs font-semibold truncate flex-1 text-brand-text-primary">{data?.title || 'Fan-out'}</span>
        {isDisabled && (
          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-800 shrink-0">
            <Ban className="w-2.5 h-2.5" />Skip
          </span>
        )}
      </div>

      <div className="px-3 py-2 space-y-1">
        {branches.slice(0, 6).map((b, idx) => (
          <div key={b.id} className="flex items-start gap-2 text-xs">
            <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${isDisabled ? 'bg-brand-black' : 'bg-sky-400'}`} />
            <span className="font-semibold shrink-0 text-brand-text-primary">{b.name || `Branch ${idx + 1}`}</span>
            <span className="text-brand-text-primary">always fires</span>
          </div>
        ))}
        {branches.length > 6 && <div className="text-[9px] text-brand-text-primary pl-3.5">+{branches.length - 6} more branches</div>}
      </div>

      <div className="relative h-5 border-t border-brand-border mt-1">
        {branches.map((b, idx) => (
          <span key={b.id} className={`absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium leading-none truncate max-w-[44px] text-center ${isDisabled ? 'text-brand-text-primary' : 'text-sky-400'}`} style={{ left: handleLeft(idx) }}>
            {(b.name || '').slice(0, 6)}
          </span>
        ))}
        <span className="absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium text-red-300 leading-none" style={{ left: handleLeft(branches.length) }}>error</span>
      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable}
        style={{ width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#0ea5e9', border: '2px solid white', top: -5 }} />
      {branches.map((b, idx) => (
        <Handle key={b.id} type="source" position={Position.Bottom} id={b.id} isConnectable={isConnectable}
          style={{ left: handleLeft(idx), width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#0ea5e9', border: '2px solid white', bottom: -5 }} />
      ))}
      <Handle type="source" position={Position.Bottom} id="error" isConnectable={isConnectable}
        style={{ left: handleLeft(branches.length), width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#ef4444', border: '2px solid white', bottom: -5 }} />
    </div>
  );
});
