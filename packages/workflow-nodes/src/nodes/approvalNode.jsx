import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { Ban, RefreshCw } from 'lucide-react';
import { Button } from '@jet-admin/ui';

const ERROR_HANDLING_OPTIONS = {
  FAIL_WORKFLOW: 'fail_workflow',
  CONTINUE: 'continue',
  RETRY_THEN_CONTINUE: 'retry_then_continue',
  RETRY_THEN_FAIL: 'retry_then_fail',
};

const ON_TIMEOUT_OPTIONS = {
  EXPIRED: 'expired',
  FAIL: 'fail',
};

// ── Configurator ──────────────────────────────────────────────────────────────

export const ApprovalNodeConfigurator = ({ data, onChange }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    approvers: data?.approvers || '',
    requireComment: data?.requireComment ?? false,
    approveLabel: data?.approveLabel || 'Accept',
    rejectLabel: data?.rejectLabel || 'Reject',
    cancelLabel: data?.cancelLabel || 'Cancel',
    expiryMinutes: data?.expiryMinutes ?? 60,
    onTimeout: data?.onTimeout || ON_TIMEOUT_OPTIONS.EXPIRED,
    outputVariable: data?.outputVariable || 'approval',
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        approvers: data.approvers || '',
        requireComment: data.requireComment ?? false,
        approveLabel: data.approveLabel || 'Accept',
        rejectLabel: data.rejectLabel || 'Reject',
        cancelLabel: data.cancelLabel || 'Cancel',
        expiryMinutes: data.expiryMinutes ?? 60,
        onTimeout: data.onTimeout || ON_TIMEOUT_OPTIONS.EXPIRED,
        outputVariable: data.outputVariable || 'approval',
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false,
      });
    }
  }, [data]);

  const schema = useMemo(() => ({
    type: 'object',
    properties: {
      title: { type: 'string', title: strings.WORKFLOW_EDITOR_APPROVAL_TITLE_LABEL || 'Node Title' },
      description: { type: 'string', title: strings.WORKFLOW_EDITOR_NODE_DESCRIPTION_LABEL || 'Instructions for the approver' },
      approvers: { type: 'string', title: strings.WORKFLOW_EDITOR_APPROVAL_APPROVERS_LABEL || 'Approvers (display only)' },
      requireComment: { type: 'boolean', title: strings.WORKFLOW_EDITOR_APPROVAL_COMMENT_LABEL || 'Require comment', default: false },
      approveLabel: { type: 'string', title: strings.WORKFLOW_EDITOR_APPROVAL_ACCEPT_LABEL || 'Accept button text', default: 'Accept' },
      rejectLabel: { type: 'string', title: strings.WORKFLOW_EDITOR_APPROVAL_REJECT_LABEL || 'Reject button text', default: 'Reject' },
      cancelLabel: { type: 'string', title: strings.WORKFLOW_EDITOR_APPROVAL_CANCEL_LABEL || 'Cancel button text', default: 'Cancel' },
      expiryMinutes: { type: 'integer', title: strings.WORKFLOW_EDITOR_APPROVAL_EXPIRY_LABEL || 'Expiry (minutes, 0 = never)', minimum: 0, maximum: 10080, default: 60 },
      onTimeout: { type: 'string', title: strings.WORKFLOW_EDITOR_APPROVAL_TIMEOUT_LABEL || 'On Timeout', enum: Object.values(ON_TIMEOUT_OPTIONS), default: 'expired' },
      outputVariable: { type: 'string', title: strings.WORKFLOW_EDITOR_OUTPUT_VARIABLE_LABEL || 'Output Variable Name', pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$' },
      errorHandling: { type: 'string', title: strings.WORKFLOW_EDITOR_ERROR_HANDLING_LABEL || 'Error Behavior', enum: Object.values(ERROR_HANDLING_OPTIONS) },
      isDisabled: { type: 'boolean', title: strings.WORKFLOW_EDITOR_IS_DISABLED_LABEL || 'Skip this node', default: false },
    },
    required: [],
  }), [strings]);

  const uischema = useMemo(() => ({
    type: 'Categorization',
    elements: [
      {
        type: 'Category', label: strings.WORKFLOW_EDITOR_TAB_GENERAL || 'General', elements: [
          { type: 'Control', scope: '#/properties/title', options: { placeholder: 'e.g., Approve market alert' } },
          { type: 'Control', scope: '#/properties/description', options: { placeholder: 'What is being approved and why...', multi: true, rows: 2 } },
          { type: 'Control', scope: '#/properties/approvers', options: { placeholder: 'e.g., trading-desk@company.com' } },
          { type: 'Control', scope: '#/properties/requireComment' },
          { type: 'Control', scope: '#/properties/approveLabel' },
          { type: 'Control', scope: '#/properties/rejectLabel' },
          { type: 'Control', scope: '#/properties/cancelLabel' },
        ],
      },
      {
        type: 'Category', label: strings.WORKFLOW_EDITOR_TAB_OUTPUT || 'Output', elements: [
          { type: 'Control', scope: '#/properties/outputVariable', options: { placeholder: 'e.g., approval, tradeApproval' } },
        ],
      },
      {
        type: 'Category', label: strings.WORKFLOW_EDITOR_TAB_ADVANCED || 'Advanced', elements: [
          { type: 'Control', scope: '#/properties/expiryMinutes' },
          {
            type: 'Control', scope: '#/properties/onTimeout', options: {
              enumLabels: { [ON_TIMEOUT_OPTIONS.EXPIRED]: 'Route to expired path', [ON_TIMEOUT_OPTIONS.FAIL]: 'Fail workflow' },
            },
          },
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
  }), [strings]);

  const handleFormChange = useCallback(({ data: newData }) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);

  const handleSave = useCallback(() => { onChange(formData); }, [onChange, formData]);

  return (
    <div className="w-full">
      <JsonForms schema={schema} uischema={uischema} data={formData} renderers={workflowNodeRenderers} onChange={handleFormChange} />

      <div className="px-2">
        <div className="rounded border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
          <div className="font-semibold text-xs text-foreground">📘 Approval</div>
          <div>
            Pauses for a human decision. Resume routes to <code className="bg-brand-dark px-1 rounded border border-border font-mono">approved</code> or{' '}
            <code className="bg-brand-dark px-1 rounded border border-border font-mono">rejected</code>; expiry routes to{' '}
            <code className="bg-brand-dark px-1 rounded border border-border font-mono">expired</code> (or fails, per On Timeout).
          </div>
          <div>
            Result shape: <code className="bg-brand-dark px-1 rounded border border-border font-mono">{'ctx.{outputVariable} = { approved, comment }'}</code>
          </div>
        </div>
      </div>

      <div className="px-2 mt-2">
        <Button type="button" size="sm" onClick={handleSave} className="w-full">
          {strings.WORKFLOW_EDITOR_APPROVAL_SAVE_BUTTON || 'Save'}
        </Button>
      </div>
    </div>
  );
};

// ── Canvas card (approved / rejected / expired / error handles) ───────────────

const OUT_HANDLES = [
  { id: 'approved', label: 'ok', color: '#22c55e' },
  { id: 'rejected', label: 'no', color: '#f59e0b' },
  { id: 'expired', label: 'exp', color: '#94a3b8' },
  { id: 'error', label: 'err', color: '#ef4444' },
];

export const ApprovalNode = memo(({ id, data, isConnectable }) => {
  const { nodeExecutionStatus } = useWorkflowNodes();
  const executionStatus = nodeExecutionStatus?.[id] || 'idle';
  const isDisabled = data?.isDisabled ?? false;
  const isSuspended = executionStatus === 'suspended';

  const handleLeft = (i) => `${(100 / (OUT_HANDLES.length + 1)) * (i + 1)}%`;

  const getStatusStyles = () => {
    switch (executionStatus) {
      case 'running': return 'border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse';
      case 'suspended': return 'border-amber-400 ring-2 ring-amber-300 ring-opacity-60 animate-pulse';
      case 'completed': return 'border-green-400 ring-2 ring-green-300 ring-opacity-50';
      case 'failed': return 'border-red-400 ring-2 ring-red-300 ring-opacity-50';
      case 'skipped': return 'border-orange-300 opacity-60';
      default: return 'border-brand-border hover:border-rose-400 hover:shadow-md';
    }
  };

  const StatusIndicator = () => {
    if (isSuspended) return (
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center animate-pulse z-10" title="Waiting for approval">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
      </div>
    );
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
          className={`flex flex-col items-center justify-center px-3 py-3 border-r ${isDisabled ? 'bg-brand-dark border-brand-border' : isSuspended ? 'bg-amber-100 border-amber-800' : executionStatus === 'running' ? 'bg-blue-950/40 border-blue-800' : executionStatus === 'completed' ? 'bg-green-950/40 border-green-800' : executionStatus === 'failed' ? 'bg-red-950/40 border-red-800' : 'bg-rose-950/40 border-rose-800'}`}>
          <svg width="20" height="20" viewBox="0 0 14 14" className={`${isDisabled ? 'text-brand-text-primary' : isSuspended ? 'text-amber-600' : 'text-rose-500'}`} fill="currentColor">
            <path d="M7 0 L14 7 L7 14 L0 7 Z" />
          </svg>
        </div>
        <div className="flex-1 px-3 py-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold truncate ${isDisabled ? 'text-brand-text-primary line-through' : 'text-brand-text-primary'}`}>{data?.title || 'Approval'}</span>
            {isSuspended && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-800 whitespace-nowrap">
                ⏸ Waiting
              </span>
            )}
            {isDisabled && !isSuspended && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-800">
                <Ban className="w-2.5 h-2.5" />Skip
              </span>
            )}
          </div>
          <div className="text-[10px] truncate mt-0.5 text-brand-text-primary">
            {data?.approvers || 'anyone'} · {data?.expiryMinutes > 0 ? `${data.expiryMinutes}m` : 'no expiry'} → {data?.outputVariable || 'approval'}
          </div>
        </div>
      </div>

      <div className="relative h-5 border-t border-brand-border mt-1">
        {OUT_HANDLES.map((h, idx) => (
          <span key={h.id} className="absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium leading-none text-center" style={{ left: handleLeft(idx), color: h.color }}>
            {h.label}
          </span>
        ))}
      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ width: '10px', height: '10px', backgroundColor: isDisabled ? '#cbd5e1' : '#f43f5e', border: 'none', top: '-5px' }} />
      {OUT_HANDLES.map((h, idx) => (
        <Handle key={h.id} type="source" position={Position.Bottom} id={h.id} isConnectable={isConnectable}
          style={{ left: handleLeft(idx), width: '10px', height: '10px', backgroundColor: isDisabled ? '#cbd5e1' : h.color, border: 'none', bottom: '-5px' }} />
      ))}
    </div>
  );
});
