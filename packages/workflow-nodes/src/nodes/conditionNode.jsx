/**
 * Condition Node — XSOAR-style structured condition builder
 *
 * Syntax convention
 * ─────────────────
 * Structured condition fields (leftValue / rightValue) use mustache:
 *   {{ctx.severity}}   {{ctx.input.status}}   {{ctx.queryResult.count}}
 *
 * The "JS Expression" operator is the only exception — it executes raw JS
 * in a vm2 sandbox where `ctx` is a plain variable:
 *   ctx.score > 80 && ctx.active === true
 */

import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowNodes } from '../context';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jet-admin/ui';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { VscDebugDisconnect } from 'react-icons/vsc';

// ─── Operators ─────────────────────────────────────────────────────────────────

const OPERATORS = [
  { value: 'equals', label: 'Equals', symbol: '=', needsRight: true },
  { value: 'not_equals', label: 'Not Equals', symbol: '≠', needsRight: true },
  { value: 'contains', label: 'Contains', symbol: '⊃', needsRight: true },
  { value: 'not_contains', label: "Doesn't Contain", symbol: '⊄', needsRight: true },
  { value: 'starts_with', label: 'Starts With', symbol: '↦', needsRight: true },
  { value: 'ends_with', label: 'Ends With', symbol: '↤', needsRight: true },
  { value: 'greater_than', label: 'Greater Than', symbol: '>', needsRight: true },
  { value: 'less_than', label: 'Less Than', symbol: '<', needsRight: true },
  { value: 'greater_or_equal', label: '≥ Or Equal', symbol: '≥', needsRight: true },
  { value: 'less_or_equal', label: '≤ Or Equal', symbol: '≤', needsRight: true },
  { value: 'is_empty', label: 'Is Empty', symbol: '∅', needsRight: false },
  { value: 'is_not_empty', label: 'Is Not Empty', symbol: '≠∅', needsRight: false },
  { value: 'matches_regex', label: 'Matches Regex', symbol: '~', needsRight: true },
  { value: 'expression', label: 'JS Expression', symbol: '{ }', needsRight: false, isExpression: true },
];

const OP_MAP = Object.fromEntries(OPERATORS.map(o => [o.value, o]));

// ─── Factories ─────────────────────────────────────────────────────────────────

const uid = (prefix = 'id') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const makeCondition = () => ({
  id: uid('c'),
  leftValue: '',
  operator: 'equals',
  rightValue: '',
});

const makeBranch = (label = 'Branch') => ({
  id: uid('b'),
  label,
  conditionLogic: 'AND',
  conditions: [makeCondition()],
});

// ─── Migration (old → new format) ────────────────────────────────────────────

function migrateBranches(raw = []) {
  if (!raw.length) return [makeBranch('Yes'), makeBranch('No')];
  return raw.map(b => {
    if (Array.isArray(b.conditions)) return b;
    const expr =
      b.condition ||
      b.expression ||
      (b.conditionType !== 'expression' && b.leftOperand
        ? buildLegacyExpr(b)
        : null) ||
      'true';
    return {
      id: b.id || uid('b'),
      label: b.name || b.label || 'Branch',
      conditionLogic: 'AND',
      conditions: [{ id: uid('c'), leftValue: expr, operator: 'expression', rightValue: '' }],
    };
  });
}

function buildLegacyExpr(b) {
  const L = b.leftOperand || '?';
  const R = JSON.stringify(b.rightOperand ?? '');
  switch (b.conditionType) {
    case 'equals': return `String(${L}) === String(${R})`;
    case 'not_equals': return `String(${L}) !== String(${R})`;
    case 'contains': return `String(${L}).includes(${R})`;
    case 'greater_than': return `Number(${L}) > Number(${R})`;
    case 'less_than': return `Number(${L}) < Number(${R})`;
    case 'is_empty': return `(${L} == null || ${L} === '')`;
    case 'is_not_empty': return `!(${L} == null || ${L} === '')`;
    case 'regex': return `new RegExp(${R}).test(String(${L}))`;
    default: return 'true';
  }
}

// ─── Canvas summary ───────────────────────────────────────────────────────────

function conditionSummary(cond) {
  if (!cond) return '';
  if (cond.operator === 'expression') {
    const expr = cond.leftValue || '';
    return expr.length > 24 ? expr.slice(0, 24) + '…' : expr;
  }
  const op = OP_MAP[cond.operator];
  const left = (cond.leftValue || '?').replace(/^\{\{|\}\}$/g, '');
  const right = (cond.rightValue || '').replace(/^\{\{|\}\}$/g, '');
  const sym = op?.symbol || '=';
  const str = op?.needsRight === false ? `${left} ${sym}` : `${left} ${sym} ${right}`;
  return str.length > 28 ? str.slice(0, 28) + '…' : str;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function ConditionRow({ condition, onChange, onDelete, canDelete }) {
  const op = OP_MAP[condition.operator] || OP_MAP['equals'];
  const update = (patch) => onChange({ ...condition, ...patch });

  return (
    <div className="flex items-center gap-1.5">
      {op.isExpression ? (
        <Input
          value={condition.leftValue}
          onChange={e => update({ leftValue: e.target.value })}
          placeholder="ctx.score > 80 && ctx.status === 'active'"
          className="flex-1 h-7 text-xs font-mono px-2"
          title="Raw JavaScript — use ctx.variable (no curly braces)"
        />
      ) : (
          <>
          <Input
            value={condition.leftValue}
            onChange={e => update({ leftValue: e.target.value })}
            placeholder="{{ctx.field}}"
            className="flex-1 min-w-0 h-7 text-xs font-mono px-2"
          />
            <Select value={condition.operator} onValueChange={val => update({ operator: val, rightValue: '' })}>
              <SelectTrigger className="w-[136px] h-7 text-xs shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map(o => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                  <span className="font-mono text-muted-foreground mr-1.5 text-[10px]">{o.symbol}</span>
                  {o.label}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
            {op.needsRight !== false && (
              <Input
                value={condition.rightValue}
                onChange={e => update({ rightValue: e.target.value })}
                placeholder="value or {{ctx.x}}"
                className="flex-1 min-w-0 h-7 text-xs px-2"
              />
            )}
          </>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={!canDelete}
        className="h-7 w-7 shrink-0 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 disabled:opacity-20 transition-colors"
        title="Remove condition"
      >
        <FaTrash className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

function AndOrDivider({ logic, onToggle }) {
  return (
    <div className="flex items-center gap-2 my-0.5">
      <div className="h-px flex-1 bg-border" />
      <button
        type="button"
        onClick={onToggle}
        title={`Click to switch to ${logic === 'AND' ? 'OR' : 'AND'}`}
        className={`
          text-[9px] font-bold px-2 py-0.5 rounded border tracking-wider
          transition-colors select-none
          ${logic === 'AND'
          ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/15'
          : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
          }
        `}
      >
        {logic}
      </button>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function BranchEditor({ branch, onChange }) {
  const updateField = (patch) => onChange({ ...branch, ...patch });

  const updateCondition = (idx, updated) => {
    const conditions = [...branch.conditions];
    conditions[idx] = updated;
    onChange({ ...branch, conditions });
  };

  const deleteCondition = (idx) => {
    onChange({ ...branch, conditions: branch.conditions.filter((_, i) => i !== idx) });
  };

  const addCondition = () => {
    onChange({ ...branch, conditions: [...branch.conditions, makeCondition()] });
  };

  const toggleLogic = () =>
    updateField({ conditionLogic: branch.conditionLogic === 'AND' ? 'OR' : 'AND' });

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-muted-foreground w-10 shrink-0">Label</span>
        <Input
          value={branch.label}
          onChange={e => updateField({ label: e.target.value })}
          placeholder="Yes / No / Match…"
          className="flex-1 h-7 text-xs"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Conditions
        </span>
        {branch.conditions.length > 1 && (
          <button
            type="button"
            onClick={toggleLogic}
            className={`
              text-[9px] font-bold px-2 py-0.5 rounded border transition-colors
              ${branch.conditionLogic === 'AND'
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-amber-50 text-amber-600 border-amber-200'
              }
            `}
          >
            {branch.conditionLogic}
          </button>
        )}
      </div>

      <div className="space-y-1">
        {branch.conditions.map((cond, idx) => (
          <React.Fragment key={cond.id}>
            <ConditionRow
              condition={cond}
              onChange={updated => updateCondition(idx, updated)}
              onDelete={() => deleteCondition(idx)}
              canDelete={branch.conditions.length > 1}
            />
            {idx < branch.conditions.length - 1 && (
              <AndOrDivider logic={branch.conditionLogic} onToggle={toggleLogic} />
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        type="button"
        onClick={addCondition}
        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
      >
        <FaPlus className="w-2.5 h-2.5" />
        Add condition
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ConditionNodeConfigurator
// ═══════════════════════════════════════════════════════════════════════════════

export const ConditionNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings } = useWorkflowNodes();

  const [title, setTitle] = useState(data?.title || 'Condition');
  const [description, setDescription] = useState(data?.description || '');
  const [branches, setBranches] = useState(() => migrateBranches(data?.branches));
  const [activeIdx, setActiveIdx] = useState(0);
  const [errorHandling, setErrorHandling] = useState(data?.errorHandling || 'fail_workflow');

  useEffect(() => {
    if (!data) return;
    setTitle(data.title || 'Condition');
    setDescription(data.description || '');
    setBranches(migrateBranches(data.branches));
    setActiveIdx(0);
    setErrorHandling(data.errorHandling || 'fail_workflow');
  }, [data]);

  const addBranch = useCallback(() => {
    const label = branches.length === 0 ? 'Yes' : branches.length === 1 ? 'No' : `Branch ${branches.length + 1}`;
    const next = [...branches, makeBranch(label)];
    setBranches(next);
    setActiveIdx(next.length - 1);
  }, [branches]);

  const removeBranch = useCallback((idx) => {
    if (branches.length <= 1) return;
    const next = branches.filter((_, i) => i !== idx);
    setBranches(next);
    setActiveIdx(prev => Math.min(prev, next.length - 1));
  }, [branches]);

  const updateBranch = useCallback((idx, updated) => {
    setBranches(prev => {
      const copy = [...prev];
      copy[idx] = updated;
      return copy;
    });
  }, []);

  const handleSave = useCallback(() => {
    onChange({ title, description, branches, errorHandling });
  }, [onChange, title, description, branches, errorHandling]);

  const activeBranch = branches[activeIdx];

  return (
    <div className="w-full space-y-4">

      {/* Title */}
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Task Name
        </p>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Is Severity High?"
          className="h-8 text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Description
        </p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          placeholder="What does this condition check?"
          className="w-full text-xs text-foreground border border-border rounded-md px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background transition-colors"
        />
      </div>

      {/* Branch panel */}
      <div className="rounded-lg border border-border overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center bg-muted/50 border-b border-border overflow-x-auto">
          {branches.map((branch, idx) => (
            <div
              key={branch.id}
              className={`
                group flex items-center gap-1.5 px-3 py-2.5 cursor-pointer
                text-xs font-medium border-r border-border
                whitespace-nowrap transition-all select-none
                ${activeIdx === idx
                ? 'bg-background text-primary shadow-[inset_0_-2px_0_hsl(var(--primary))]'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }
              `}
              onClick={() => setActiveIdx(idx)}
            >
              <span
                className={`
                  w-4 h-4 rounded-full flex items-center justify-center
                  text-[9px] font-bold shrink-0 transition-colors
                  ${activeIdx === idx
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                  }
                `}
              >
                {idx + 1}
              </span>
              <span className="truncate max-w-[80px]">
                {branch.label || `Branch ${idx + 1}`}
              </span>
              {branches.length > 1 && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeBranch(idx); }}
                  className="ml-0.5 w-3.5 h-3.5 flex items-center justify-center text-muted-foreground/30 hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addBranch}
            className="px-3 py-2.5 text-xs text-primary hover:text-primary/80 hover:bg-background/60 transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <FaPlus className="w-2.5 h-2.5" />
            Add branch
          </button>
        </div>

        {activeBranch
          ? (
            <BranchEditor
              key={activeBranch.id}
              branch={activeBranch}
              onChange={updated => updateBranch(activeIdx, updated)}
            />
          ) : (
            <div className="p-4 text-xs text-muted-foreground text-center">
              No branches yet — click <strong>Add branch</strong> above.
            </div>
          )
        }
      </div>

      {/* else indicator */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-muted/30 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
          ∅
        </span>
        <span>
          <span className="font-semibold text-foreground">else</span>
          {' '}— taken when none of the branches above match
        </span>
      </div>

      {/* Error handling */}
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          On Error
        </p>
        <Select value={errorHandling} onValueChange={setErrorHandling}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fail_workflow" className="text-xs">Fail Workflow</SelectItem>
            <SelectItem value="continue" className="text-xs">Continue to Default Branch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Help callout */}
      <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-[10px] text-primary/80 space-y-1.5">
        <div className="font-semibold text-xs text-primary">💡 Writing Conditions</div>
        <div>
          Use <code className="bg-background px-1 rounded border border-border font-mono">{'{{ctx.field}}'}</code> in
          left and right inputs — e.g.{' '}
          <code className="bg-background px-1 rounded border border-border font-mono">{'{{ctx.input.severity}}'}</code>.
        </div>
        <div>
          The right side can also be a plain literal like{' '}
          <code className="bg-background px-1 rounded border border-border font-mono">High</code> or{' '}
          <code className="bg-background px-1 rounded border border-border font-mono">3</code>.
        </div>
        <div>
          For complex logic, use <strong>JS Expression</strong> — raw JS where{' '}
          <code className="bg-background px-1 rounded border border-border font-mono">ctx.field</code> is a direct variable (no braces).
        </div>
        <div>Branches are evaluated <strong>top → bottom</strong>; first match wins.</div>
      </div>

      {/* ✅ Correct: Button variant="default", no raw color overrides */}
      <Button type="button" onClick={handleSave} className="w-full">
        {strings?.WORKFLOW_EDITOR_CONDITION_NODE_SAVE_BUTTON || 'Save Condition'}
      </Button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ConditionNode — canvas card (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

export const ConditionNode = memo(({ data, isConnectable }) => {
  const isDisabled = data?.isDisabled ?? false;
  const branches = useMemo(() => migrateBranches(data?.branches || []), [data?.branches]);

  const totalSlots = branches.length + 2;
  const handleLeft = (i) => `${(100 / (totalSlots + 1)) * (i + 1)}%`;

  return (
    <div
      className={`
        bg-white rounded border shadow-sm
        min-w-[260px] max-w-[340px]
        transition-all duration-150
        ${isDisabled
          ? 'border-slate-200 opacity-50'
        : 'border-slate-200 hover:border-indigo-400 hover:shadow-md'
        }
      `}
    >
      <div
        className={`
          flex items-center gap-2.5 px-3 py-2.5 border-b rounded-t
          ${isDisabled ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50 border-indigo-100'}
        `}
      >
        <svg
          width="14" height="14" viewBox="0 0 14 14"
          className={`shrink-0 ${isDisabled ? 'text-slate-400' : 'text-indigo-500'}`}
          fill="currentColor"
        >
          <path d="M7 0 L14 7 L7 14 L0 7 Z" />
        </svg>
        <span className={`text-xs font-semibold truncate flex-1 ${isDisabled ? 'text-slate-400 line-through' : 'text-indigo-900'}`}>
          {data?.title || 'Condition'}
        </span>
        {isDisabled && (
          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200 shrink-0">
            <VscDebugDisconnect className="w-2.5 h-2.5" />
            Skip
          </span>
        )}
      </div>

      <div className="px-3 py-2 space-y-1.5">
        {branches.slice(0, 6).map((branch, idx) => {
          const firstCond = branch.conditions?.[0];
          const extra = (branch.conditions?.length ?? 0) - 1;
          const summary = firstCond ? conditionSummary(firstCond) : '';
          return (
            <div key={branch.id} className="flex items-start gap-2 text-[10px]">
              <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${isDisabled ? 'bg-slate-300' : 'bg-indigo-400'}`} />
              <span className={`font-semibold shrink-0 ${isDisabled ? 'text-slate-400' : 'text-slate-700'}`}>
                {branch.label || `Branch ${idx + 1}`}
              </span>
              <span className={`truncate font-mono ${isDisabled ? 'text-slate-300' : 'text-slate-400'}`}>
                {summary}
                {extra > 0 && <span className="ml-1 text-slate-300 font-sans">+{extra}</span>}
              </span>
            </div>
          );
        })}
        {branches.length > 6 && (
          <div className="text-[9px] text-slate-400 pl-3.5">+{branches.length - 6} more branches</div>
        )}
        <div className="flex items-center gap-2 text-[10px] pt-1.5 mt-0.5 border-t border-slate-100">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
          <span className="font-semibold text-slate-400">else</span>
          <span className="text-slate-300">default path</span>
        </div>
      </div>

      <div className="relative h-5 border-t border-slate-100 mt-1">
        {branches.map((branch, idx) => (
          <span
            key={branch.id}
            className={`absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium leading-none truncate max-w-[44px] text-center ${isDisabled ? 'text-slate-300' : 'text-indigo-400'}`}
            style={{ left: handleLeft(idx) }}
          >
            {(branch.label || '').slice(0, 6)}
          </span>
        ))}
        <span className="absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium text-slate-300 leading-none" style={{ left: handleLeft(branches.length) }}>else</span>
        <span className="absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium text-red-300 leading-none" style={{ left: handleLeft(branches.length + 1) }}>error</span>
      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable}
        style={{ width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#6366f1', border: '2px solid white', top: -5 }} />
      {branches.map((branch, idx) => (
        <Handle key={branch.id} type="source" position={Position.Bottom} id={branch.id} isConnectable={isConnectable}
          style={{ left: handleLeft(idx), width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#6366f1', border: '2px solid white', bottom: -5 }} />
      ))}
      <Handle type="source" position={Position.Bottom} id="default" isConnectable={isConnectable}
        style={{ left: handleLeft(branches.length), width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#94a3b8', border: '2px solid white', bottom: -5 }} />
      <Handle type="source" position={Position.Bottom} id="error" isConnectable={isConnectable}
        style={{ left: handleLeft(branches.length + 1), width: 10, height: 10, backgroundColor: isDisabled ? '#cbd5e1' : '#ef4444', border: '2px solid white', bottom: -5 }} />
    </div>
  );
});