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

const OPERATORS = [
  { value: 'equals', label: 'Equals (=)' },
  { value: 'not_equals', label: 'Not Equals (≠)' },
  { value: 'contains', label: 'Contains (⊃)' },
  { value: 'greater_than', label: 'Greater Than (>)' },
  { value: 'less_than', label: 'Less Than (<)' },
  { value: 'expression', label: 'JS Expression ({ })' },
];

const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const makeCase = (label = 'Case') => ({ id: uid('case'), label, operator: 'equals', matchValue: '' });

// ── Configurator ──────────────────────────────────────────────────────────────

export const SwitchNodeConfigurator = ({ data, onChange }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    switchValue: data?.switchValue || '',
    cases: Array.isArray(data?.cases) && data.cases.length > 0 ? data.cases : [makeCase('Case 1'), makeCase('Case 2')],
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS.CONTINUE,
    isDisabled: data?.isDisabled ?? false,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        switchValue: data.switchValue || '',
        cases: Array.isArray(data.cases) && data.cases.length > 0 ? data.cases : [makeCase('Case 1'), makeCase('Case 2')],
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS.CONTINUE,
        isDisabled: data.isDisabled ?? false,
      });
    }
  }, [data]);

  const set = useCallback((patch) => setFormData((prev) => ({ ...prev, ...patch })), []);

  const updateCase = useCallback((id, patch) => {
    setFormData((prev) => ({ ...prev, cases: prev.cases.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }, []);

  const addCase = useCallback(() => {
    setFormData((prev) => ({ ...prev, cases: [...prev.cases, makeCase(`Case ${prev.cases.length + 1}`)] }));
  }, []);

  const removeCase = useCallback((id) => {
    setFormData((prev) => ({ ...prev, cases: prev.cases.filter((c) => c.id !== id) }));
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
        <Input size="sm" value={formData.description} placeholder="What does this switch route on..." onChange={(e) => set({ description: e.target.value })} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Switch Value</label>
        <Input size="sm" value={formData.switchValue} placeholder="{{ctx.status}} or {{ctx.score}}" onChange={(e) => set({ switchValue: e.target.value })} className="font-mono" />
        <p className="text-[10px] text-muted-foreground">Template or literal compared against each case. <code className="font-mono">expression</code> cases run raw JS with <code className="font-mono">ctx</code> in scope.</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Cases (first match wins, else default)</label>
          <Button type="button" variant="outline" size="sm" onClick={addCase} className="flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {formData.cases.map((c) => (
          <div key={c.id} className="rounded border border-border p-2 space-y-2">
            <div className="flex items-center gap-2">
              <Input size="sm" value={c.label || ''} placeholder="Case label" onChange={(e) => updateCase(c.id, { label: e.target.value })} className="flex-1" />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeCase(c.id)} title="Remove case">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select value={c.operator || 'equals'} onValueChange={(v) => updateCase(c.id, { operator: v })}>
                <SelectTrigger size="sm" className="w-[150px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {c.operator !== 'expression' && (
                <Input size="sm" value={c.matchValue || ''} placeholder="match value ({{ctx.*}} ok)" onChange={(e) => updateCase(c.id, { matchValue: e.target.value })} className="flex-1 font-mono" />
              )}
            </div>
            {c.operator === 'expression' && (
              <Input size="sm" value={c.matchValue || ''} placeholder="ctx.score > 80" onChange={(e) => updateCase(c.id, { matchValue: e.target.value })} className="font-mono" />
            )}
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
        <span className="font-semibold text-foreground">📘 Switch</span>
        <div className="mt-1">Routes on one value across many cases. Unmatched values follow <code className="font-mono">default</code>; evaluation errors follow <code className="font-mono">error</code>.</div>
      </div>

      <Button type="button" size="sm" onClick={handleSave} className="w-full">
        {strings?.WORKFLOW_EDITOR_JAVASCRIPT_NODE_SAVE_BUTTON || 'Save'}
      </Button>
    </div>
  );
};

// ── Canvas card (dynamic handles per case + default + error) ──────────────────

export const SwitchNode = memo(({ id, data, isConnectable }) => {
  const { nodeExecutionStatus } = useWorkflowNodes();
  const executionStatus = nodeExecutionStatus?.[id] || 'idle';
  const isDisabled = data?.isDisabled ?? false;
  const cases = useMemo(() => (Array.isArray(data?.cases) ? data.cases.filter((c) => c && c.id) : []), [data?.cases]);

  const totalSlots = cases.length + 2;
  const handleLeft = (i) => `${(100 / (totalSlots + 1)) * (i + 1)}%`;

  const getStatusStyles = () => {
    switch (executionStatus) {
      case 'running': return 'border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse';
      case 'completed': return 'border-green-400 ring-2 ring-green-300 ring-opacity-50';
      case 'failed': return 'border-red-400 ring-2 ring-red-300 ring-opacity-50';
      case 'skipped': return 'border-orange-300 opacity-60';
      default: return 'border-brand-border hover:border-teal-400 hover:shadow-md';
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
      <div className={`flex items-center gap-2.5 px-3 py-2.5 border-b rounded-t ${isDisabled ? 'bg-brand-dark border-brand-border' : executionStatus === 'running' ? 'bg-blue-950/40 border-blue-800' : executionStatus === 'completed' ? 'bg-green-950/40 border-green-800' : executionStatus === 'failed' ? 'bg-red-950/40 border-red-800' : 'bg-teal-950/40 border-teal-800'}`}>
        <svg width="14" height="14" viewBox="0 0 14 14" className={`shrink-0 ${isDisabled ? 'text-brand-text-primary' : 'text-teal-500'}`} fill="currentColor">
          <path d="M7 0 L14 7 L7 14 L0 7 Z" />
        </svg>
        <span className="text-xs font-semibold truncate flex-1 text-brand-text-primary">{data?.title || 'Switch'}</span>
        {isDisabled && (
          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-800 shrink-0">
            <Ban className="w-2.5 h-2.5" />Skip
          </span>
        )}
      </div>

      <div className="px-3 py-2 space-y-1">
        <div className="text-[10px] font-mono truncate text-brand-text-primary">{data?.switchValue || 'no switch value'}</div>
        {cases.slice(0, 6).map((c, idx) => (
          <div key={c.id} className="flex items-start gap-2 text-xs">
            <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${isDisabled ? 'bg-brand-black' : 'bg-teal-400'}`} />
            <span className="font-semibold shrink-0 text-brand-text-primary">{c.label || `Case ${idx + 1}`}</span>
            <span className="truncate font-mono text-brand-text-primary">{c.operator === 'expression' ? (c.matchValue || '') : `${c.operator || 'equals'} ${c.matchValue || ''}`}</span>
          </div>
        ))}
        {cases.length > 6 && <div className="text-[9px] text-brand-text-primary pl-3.5">+{cases.length - 6} more cases</div>}
        <div className="flex items-center gap-2 text-xs pt-1.5 mt-0.5 border-t border-brand-border">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-black shrink-0" />
          <span className="font-semibold text-brand-text-primary">default</span>
          <span className="text-brand-text-primary">unmatched path</span>
        </div>
      </div>

      <div className="relative h-5 border-t border-brand-border mt-1">
        {cases.map((c, idx) => (
          <span key={c.id} className={`absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium leading-none truncate max-w-[44px] text-center ${isDisabled ? 'text-brand-text-primary' : 'text-teal-400'}`} style={{ left: handleLeft(idx) }}>
            {(c.label || '').slice(0, 6)}
          </span>
        ))}
        <span className="absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium text-brand-text-primary leading-none" style={{ left: handleLeft(cases.length) }}>default</span>
        <span className="absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium text-red-300 leading-none" style={{ left: handleLeft(cases.length + 1) }}>error</span>
      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable}
        style={{ width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#14b8a6', border: '2px solid white', top: -5 }} />
      {cases.map((c, idx) => (
        <Handle key={c.id} type="source" position={Position.Bottom} id={c.id} isConnectable={isConnectable}
          style={{ left: handleLeft(idx), width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#14b8a6', border: '2px solid white', bottom: -5 }} />
      ))}
      <Handle type="source" position={Position.Bottom} id="default" isConnectable={isConnectable}
        style={{ left: handleLeft(cases.length), width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#94a3b8', border: '2px solid white', bottom: -5 }} />
      <Handle type="source" position={Position.Bottom} id="error" isConnectable={isConnectable}
        style={{ left: handleLeft(cases.length + 1), width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#ef4444', border: '2px solid white', bottom: -5 }} />
    </div>
  );
});
