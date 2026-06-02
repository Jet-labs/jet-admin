// src/nodes/conditionNode.jsx
import React2, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { Handle, Position } from "reactflow";

// src/context.jsx
import React, { createContext, useContext } from "react";

// src/constants.js
var ERROR_HANDLING = {
  CONTINUE: "continue",
  // Continue workflow via error handle
  FAIL_WORKFLOW: "fail_workflow"
  // Stop entire workflow on error
};
var ERROR_HANDLING_OPTIONS = [
  { value: ERROR_HANDLING.FAIL_WORKFLOW, label: "Fail Workflow" },
  { value: ERROR_HANDLING.CONTINUE, label: "Continue on Error Path" }
];
var HANDLE_TYPE = {
  SUCCESS: "success",
  ERROR: "error",
  DEFAULT: "default",
  TRUE: "true",
  FALSE: "false",
  LOOP: "loop",
  DONE: "completed",
  OUTPUT: "output"
};
var NODE_EXECUTION_STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  SKIPPED: "skipped"
};

// src/context.jsx
var WorkflowNodesContext = createContext(null);
var WorkflowNodesProvider = ({
  children,
  dataQueries,
  strings = {},
  onRefreshDataQueries,
  workflowNodes = [],
  workflowEdges = [],
  // Edges for DAG traversal
  workflowInputArgs = [],
  // Declared workflow input parameters [{key, type, ...}]
  nodeExecutionStatus = {},
  // Map of nodeId -> status
  workflowContext = {},
  // The actual execution context (ctx)
  tenantID = null,
  // Tenant ID for API calls
  onQueryTest = null
  // Callback for testing queries: (dataQueryID, argValues) => Promise<result>
}) => {
  return /* @__PURE__ */ React.createElement(WorkflowNodesContext.Provider, { value: {
    dataQueries,
    strings,
    onRefreshDataQueries,
    workflowNodes,
    workflowEdges,
    workflowInputArgs,
    nodeExecutionStatus,
    workflowContext,
    tenantID,
    onQueryTest
  } }, children);
};
var useWorkflowNodes = () => {
  const context = useContext(WorkflowNodesContext);
  if (!context) {
    throw new Error("useWorkflowNodes must be used within a WorkflowNodesProvider");
  }
  return context;
};
var useNodeExecutionStatus = (nodeId) => {
  const { nodeExecutionStatus } = useWorkflowNodes();
  return nodeExecutionStatus[nodeId] || NODE_EXECUTION_STATUS.IDLE;
};

// src/nodes/conditionNode.jsx
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from "@jet-admin/ui";
import { Plus, Trash2, Ban } from "lucide-react";
var OPERATORS = [
  { value: "equals", label: "Equals", symbol: "=", needsRight: true },
  { value: "not_equals", label: "Not Equals", symbol: "\u2260", needsRight: true },
  { value: "contains", label: "Contains", symbol: "\u2283", needsRight: true },
  { value: "not_contains", label: "Doesn't Contain", symbol: "\u2284", needsRight: true },
  { value: "starts_with", label: "Starts With", symbol: "\u21A6", needsRight: true },
  { value: "ends_with", label: "Ends With", symbol: "\u21A4", needsRight: true },
  { value: "greater_than", label: "Greater Than", symbol: ">", needsRight: true },
  { value: "less_than", label: "Less Than", symbol: "<", needsRight: true },
  { value: "greater_or_equal", label: "\u2265 Or Equal", symbol: "\u2265", needsRight: true },
  { value: "less_or_equal", label: "\u2264 Or Equal", symbol: "\u2264", needsRight: true },
  { value: "is_empty", label: "Is Empty", symbol: "\u2205", needsRight: false },
  { value: "is_not_empty", label: "Is Not Empty", symbol: "\u2260\u2205", needsRight: false },
  { value: "matches_regex", label: "Matches Regex", symbol: "~", needsRight: true },
  { value: "expression", label: "JS Expression", symbol: "{ }", needsRight: false, isExpression: true }
];
var OP_MAP = Object.fromEntries(OPERATORS.map((o) => [o.value, o]));
var uid = (prefix = "id") => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
var makeCondition = () => ({
  id: uid("c"),
  leftValue: "",
  operator: "equals",
  rightValue: ""
});
var makeBranch = (label = "Branch") => ({
  id: uid("b"),
  label,
  conditionLogic: "AND",
  conditions: [makeCondition()]
});
function migrateBranches(raw = []) {
  if (!raw.length) return [makeBranch("Yes"), makeBranch("No")];
  return raw.map((b) => {
    if (Array.isArray(b.conditions)) return b;
    const expr = b.condition || b.expression || (b.conditionType !== "expression" && b.leftOperand ? buildLegacyExpr(b) : null) || "true";
    return {
      id: b.id || uid("b"),
      label: b.name || b.label || "Branch",
      conditionLogic: "AND",
      conditions: [{ id: uid("c"), leftValue: expr, operator: "expression", rightValue: "" }]
    };
  });
}
function buildLegacyExpr(b) {
  const L = b.leftOperand || "?";
  const R = JSON.stringify(b.rightOperand ?? "");
  switch (b.conditionType) {
    case "equals":
      return `String(${L}) === String(${R})`;
    case "not_equals":
      return `String(${L}) !== String(${R})`;
    case "contains":
      return `String(${L}).includes(${R})`;
    case "greater_than":
      return `Number(${L}) > Number(${R})`;
    case "less_than":
      return `Number(${L}) < Number(${R})`;
    case "is_empty":
      return `(${L} == null || ${L} === '')`;
    case "is_not_empty":
      return `!(${L} == null || ${L} === '')`;
    case "regex":
      return `new RegExp(${R}).test(String(${L}))`;
    default:
      return "true";
  }
}
function conditionSummary(cond) {
  if (!cond) return "";
  if (cond.operator === "expression") {
    const expr = cond.leftValue || "";
    return expr.length > 24 ? expr.slice(0, 24) + "\u2026" : expr;
  }
  const op = OP_MAP[cond.operator];
  const left = (cond.leftValue || "?").replace(/^\{\{|\}\}$/g, "");
  const right = (cond.rightValue || "").replace(/^\{\{|\}\}$/g, "");
  const sym = op?.symbol || "=";
  const str = op?.needsRight === false ? `${left} ${sym}` : `${left} ${sym} ${right}`;
  return str.length > 28 ? str.slice(0, 28) + "\u2026" : str;
}
function ConditionRow({ condition, onChange, onDelete, canDelete }) {
  const op = OP_MAP[condition.operator] || OP_MAP["equals"];
  const update = (patch) => onChange({ ...condition, ...patch });
  return /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-2" }, op.isExpression ? /* @__PURE__ */ React2.createElement(
    Input,
    {
      value: condition.leftValue,
      onChange: (e) => update({ leftValue: e.target.value }),
      placeholder: "ctx.score > 80 && ctx.status === 'active'",
      className: "flex-1 h-7 text-xs font-mono px-2",
      title: "Raw JavaScript \u2014 use ctx.variable (no curly braces)"
    }
  ) : /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
    Input,
    {
      value: condition.leftValue,
      onChange: (e) => update({ leftValue: e.target.value }),
      placeholder: "{{ctx.field}}",
      className: "flex-1 min-w-0 h-7 text-xs font-mono px-2"
    }
  ), /* @__PURE__ */ React2.createElement(Select, { value: condition.operator, onValueChange: (val) => update({ operator: val, rightValue: "" }) }, /* @__PURE__ */ React2.createElement(SelectTrigger, { className: "w-[136px] h-7 text-xs shrink-0" }, /* @__PURE__ */ React2.createElement(SelectValue, null)), /* @__PURE__ */ React2.createElement(SelectContent, null, OPERATORS.map((o) => /* @__PURE__ */ React2.createElement(SelectItem, { key: o.value, value: o.value, className: "text-xs" }, /* @__PURE__ */ React2.createElement("span", { className: "font-mono text-muted-foreground mr-1.5 text-[10px]" }, o.symbol), o.label)))), op.needsRight !== false && /* @__PURE__ */ React2.createElement(
    Input,
    {
      value: condition.rightValue,
      onChange: (e) => update({ rightValue: e.target.value }),
      placeholder: "value or {{ctx.x}}",
      className: "flex-1 min-w-0 h-7 text-xs px-2"
    }
  )), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: onDelete,
      disabled: !canDelete,
      className: "h-7 w-7",
      title: "Remove condition"
    },
    /* @__PURE__ */ React2.createElement(Trash2, { className: "w-2.5 h-2.5" })
  ));
}
function AndOrDivider({ logic, onToggle }) {
  return /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-2 my-0.5" }, /* @__PURE__ */ React2.createElement("div", { className: "h-px flex-1 bg-border" }), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: onToggle,
      title: `Click to switch to ${logic === "AND" ? "OR" : "AND"}`,
      className: `
          h-auto text-[9px] font-bold px-2 py-0.5 rounded-sm border tracking-wider
          transition-colors select-none
          ${logic === "AND" ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15" : "bg-amber-950/40 text-amber-600 border-amber-800 hover:bg-amber-100"}
        `
    },
    logic
  ), /* @__PURE__ */ React2.createElement("div", { className: "h-px flex-1 bg-border" }));
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
  const toggleLogic = () => updateField({ conditionLogic: branch.conditionLogic === "AND" ? "OR" : "AND" });
  return /* @__PURE__ */ React2.createElement("div", { className: "space-y-3 p-3" }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React2.createElement("span", { className: "text-[10px] font-medium text-muted-foreground w-10 shrink-0" }, "Label"), /* @__PURE__ */ React2.createElement(
    Input,
    {
      value: branch.label,
      onChange: (e) => updateField({ label: e.target.value }),
      placeholder: "Yes / No / Match\u2026",
      className: "flex-1 h-7 text-xs"
    }
  )), /* @__PURE__ */ React2.createElement("div", { className: "flex items-center justify-between pt-1" }, /* @__PURE__ */ React2.createElement("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-widest" }, "Conditions"), branch.conditions.length > 1 && /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      onClick: toggleLogic,
      className: `
              h-auto text-[9px] font-bold px-2 py-0.5 rounded-sm border transition-colors
              ${branch.conditionLogic === "AND" ? "bg-primary/10 text-primary border-primary/30" : "bg-amber-950/40 text-amber-600 border-amber-800"}
            `
    },
    branch.conditionLogic
  )), /* @__PURE__ */ React2.createElement("div", { className: "space-y-1" }, branch.conditions.map((cond, idx) => /* @__PURE__ */ React2.createElement(React2.Fragment, { key: cond.id }, /* @__PURE__ */ React2.createElement(
    ConditionRow,
    {
      condition: cond,
      onChange: (updated) => updateCondition(idx, updated),
      onDelete: () => deleteCondition(idx),
      canDelete: branch.conditions.length > 1
    }
  ), idx < branch.conditions.length - 1 && /* @__PURE__ */ React2.createElement(AndOrDivider, { logic: branch.conditionLogic, onToggle: toggleLogic })))), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      variant: "ghost",
      size: "sm",
      onClick: addCondition,
      className: "flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors h-auto py-1"
    },
    /* @__PURE__ */ React2.createElement(Plus, { className: "w-2.5 h-2.5" }),
    "Add condition"
  ));
}
var ConditionNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings } = useWorkflowNodes();
  const [title, setTitle] = useState(data?.title || "Condition");
  const [description, setDescription] = useState(data?.description || "");
  const [branches, setBranches] = useState(() => migrateBranches(data?.branches));
  const [activeIdx, setActiveIdx] = useState(0);
  const [errorHandling, setErrorHandling] = useState(data?.errorHandling || "fail_workflow");
  useEffect(() => {
    if (!data) return;
    setTitle(data.title || "Condition");
    setDescription(data.description || "");
    setBranches(migrateBranches(data.branches));
    setActiveIdx(0);
    setErrorHandling(data.errorHandling || "fail_workflow");
  }, [data]);
  const addBranch = useCallback(() => {
    const label = branches.length === 0 ? "Yes" : branches.length === 1 ? "No" : `Branch ${branches.length + 1}`;
    const next = [...branches, makeBranch(label)];
    setBranches(next);
    setActiveIdx(next.length - 1);
  }, [branches]);
  const removeBranch = useCallback((idx) => {
    if (branches.length <= 1) return;
    const next = branches.filter((_, i) => i !== idx);
    setBranches(next);
    setActiveIdx((prev) => Math.min(prev, next.length - 1));
  }, [branches]);
  const updateBranch = useCallback((idx, updated) => {
    setBranches((prev) => {
      const copy = [...prev];
      copy[idx] = updated;
      return copy;
    });
  }, []);
  const handleSave = useCallback(() => {
    onChange({ title, description, branches, errorHandling });
  }, [onChange, title, description, branches, errorHandling]);
  const activeBranch = branches[activeIdx];
  return /* @__PURE__ */ React2.createElement("div", { className: "w-full space-y-4" }, /* @__PURE__ */ React2.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React2.createElement("p", { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" }, "Task Name"), /* @__PURE__ */ React2.createElement(
    Input,
    {
      value: title,
      onChange: (e) => setTitle(e.target.value),
      placeholder: "e.g. Is Severity High?",
      className: "h-8 text-sm"
    }
  )), /* @__PURE__ */ React2.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React2.createElement("p", { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" }, "Description"), /* @__PURE__ */ React2.createElement(
    Textarea,
    {
      value: description,
      onChange: (e) => setDescription(e.target.value),
      rows: 2,
      placeholder: "What does this condition check?",
      className: "w-full text-xs text-foreground border border-border rounded-md px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-brand-dark transition-colors"
    }
  )), /* @__PURE__ */ React2.createElement("div", { className: "rounded-md border border-border overflow-hidden" }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-center bg-muted/50 border-b border-border overflow-x-auto" }, branches.map((branch, idx) => /* @__PURE__ */ React2.createElement(
    "div",
    {
      key: branch.id,
      className: `
                group flex items-center gap-1.5 px-3 py-2.5 cursor-pointer
                text-xs font-medium border-r border-border
                whitespace-nowrap transition-all select-none
                ${activeIdx === idx ? "bg-brand-dark text-primary shadow-[inset_0_-2px_0_hsl(var(--primary))]" : "text-muted-foreground hover:text-foreground hover:bg-brand-dark/60"}
              `,
      onClick: () => setActiveIdx(idx)
    },
    /* @__PURE__ */ React2.createElement(
      "span",
      {
        className: `
                  w-4 h-4 rounded-full flex items-center justify-center
                  text-[9px] font-bold shrink-0 transition-colors
                  ${activeIdx === idx ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-muted/80"}
                `
      },
      idx + 1
    ),
    /* @__PURE__ */ React2.createElement("span", { className: "truncate max-w-[80px]" }, branch.label || `Branch ${idx + 1}`),
    branches.length > 1 && /* @__PURE__ */ React2.createElement(
      Button,
      {
        type: "button",
        variant: "ghost",
        size: "icon",
        onClick: (e) => {
          e.stopPropagation();
          removeBranch(idx);
        },
        className: "ml-0.5 w-3.5 h-3.5 text-muted-foreground/30 hover:text-destructive rounded-sm opacity-0 group-hover:opacity-100 transition-all"
      },
      "\xD7"
    )
  )), /* @__PURE__ */ React2.createElement(
    Button,
    {
      type: "button",
      variant: "ghost",
      onClick: addBranch,
      className: "px-3 py-2.5 text-xs text-primary hover:text-primary/80 hover:bg-brand-dark/60 transition-colors flex items-center gap-1 whitespace-nowrap h-auto"
    },
    /* @__PURE__ */ React2.createElement(Plus, { className: "w-2.5 h-2.5" }),
    "Add branch"
  )), activeBranch ? /* @__PURE__ */ React2.createElement(
    BranchEditor,
    {
      key: activeBranch.id,
      branch: activeBranch,
      onChange: (updated) => updateBranch(activeIdx, updated)
    }
  ) : /* @__PURE__ */ React2.createElement("div", { className: "p-4 text-xs text-muted-foreground text-center" }, "No branches yet \u2014 click ", /* @__PURE__ */ React2.createElement("strong", null, "Add branch"), " above.")), /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-2.5 px-3 py-2 bg-muted/30 border border-dashed border-border rounded-md text-xs text-muted-foreground" }, /* @__PURE__ */ React2.createElement("span", { className: "w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0" }, "\u2205"), /* @__PURE__ */ React2.createElement("span", null, /* @__PURE__ */ React2.createElement("span", { className: "font-semibold text-foreground" }, "else"), " ", "\u2014 taken when none of the branches above match")), /* @__PURE__ */ React2.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React2.createElement("p", { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" }, "On Error"), /* @__PURE__ */ React2.createElement(Select, { value: errorHandling, onValueChange: setErrorHandling }, /* @__PURE__ */ React2.createElement(SelectTrigger, { className: "h-8 text-xs" }, /* @__PURE__ */ React2.createElement(SelectValue, null)), /* @__PURE__ */ React2.createElement(SelectContent, null, /* @__PURE__ */ React2.createElement(SelectItem, { value: "fail_workflow", className: "text-xs" }, "Fail Workflow"), /* @__PURE__ */ React2.createElement(SelectItem, { value: "continue", className: "text-xs" }, "Continue to Default Branch")))), /* @__PURE__ */ React2.createElement("div", { className: "p-3 rounded-md border border-primary/20 bg-primary/5 text-[10px] text-primary/80 space-y-1.5" }, /* @__PURE__ */ React2.createElement("div", { className: "font-semibold text-xs text-primary" }, "\u{1F4A1} Writing Conditions"), /* @__PURE__ */ React2.createElement("div", null, "Use ", /* @__PURE__ */ React2.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border font-mono" }, "{{ctx.field}}"), " in left and right inputs \u2014 e.g.", " ", /* @__PURE__ */ React2.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border font-mono" }, "{{ctx.input.severity}}"), "."), /* @__PURE__ */ React2.createElement("div", null, "The right side can also be a plain literal like", " ", /* @__PURE__ */ React2.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border font-mono" }, "High"), " or", " ", /* @__PURE__ */ React2.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border font-mono" }, "3"), "."), /* @__PURE__ */ React2.createElement("div", null, "For complex logic, use ", /* @__PURE__ */ React2.createElement("strong", null, "JS Expression"), " \u2014 raw JS where", " ", /* @__PURE__ */ React2.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border font-mono" }, "ctx.field"), " is a direct variable (no braces)."), /* @__PURE__ */ React2.createElement("div", null, "Branches are evaluated ", /* @__PURE__ */ React2.createElement("strong", null, "top \u2192 bottom"), "; first match wins.")), /* @__PURE__ */ React2.createElement(Button, { type: "button", onClick: handleSave, className: "w-full", size: "sm" }, strings?.WORKFLOW_EDITOR_CONDITION_NODE_SAVE_BUTTON || "Save Condition"));
};
var ConditionNode = memo(({ data, isConnectable }) => {
  const isDisabled = data?.isDisabled ?? false;
  const branches = useMemo(() => migrateBranches(data?.branches || []), [data?.branches]);
  const totalSlots = branches.length + 2;
  const handleLeft = (i) => `${100 / (totalSlots + 1) * (i + 1)}%`;
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: `
        bg-brand-black rounded-sm border shadow-sm
        min-w-[260px] max-w-[340px]
        transition-all duration-150
        ${isDisabled ? "border-brand-border opacity-50" : "border-brand-border hover:border-indigo-400 hover:shadow-md"}
      `
    },
    /* @__PURE__ */ React2.createElement(
      "div",
      {
        className: `
          flex items-center gap-2.5 px-3 py-2.5 border-b rounded-t
          ${isDisabled ? "bg-brand-dark border-brand-border" : "bg-indigo-950/40 border-indigo-800"}
        `
      },
      /* @__PURE__ */ React2.createElement(
        "svg",
        {
          width: "14",
          height: "14",
          viewBox: "0 0 14 14",
          className: `shrink-0 ${isDisabled ? "text-brand-text-primary" : "text-indigo-500"}`,
          fill: "currentColor"
        },
        /* @__PURE__ */ React2.createElement("path", { d: "M7 0 L14 7 L7 14 L0 7 Z" })
      ),
      /* @__PURE__ */ React2.createElement("span", { className: `text-xs font-semibold truncate flex-1 ${isDisabled ? "text-brand-text-primary line-through" : "text-indigo-300"}` }, data?.title || "Condition"),
      isDisabled && /* @__PURE__ */ React2.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm border border-orange-800 shrink-0" }, /* @__PURE__ */ React2.createElement(Ban, { className: "w-2.5 h-2.5" }), "Skip")
    ),
    /* @__PURE__ */ React2.createElement("div", { className: "px-3 py-2 space-y-1.5" }, branches.slice(0, 6).map((branch, idx) => {
      const firstCond = branch.conditions?.[0];
      const extra = (branch.conditions?.length ?? 0) - 1;
      const summary = firstCond ? conditionSummary(firstCond) : "";
      return /* @__PURE__ */ React2.createElement("div", { key: branch.id, className: "flex items-start gap-2 text-[10px]" }, /* @__PURE__ */ React2.createElement("div", { className: `mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${isDisabled ? "bg-brand-black" : "bg-indigo-400"}` }), /* @__PURE__ */ React2.createElement("span", { className: `font-semibold shrink-0 ${isDisabled ? "text-brand-text-primary" : "text-brand-text-primary"}` }, branch.label || `Branch ${idx + 1}`), /* @__PURE__ */ React2.createElement("span", { className: `truncate font-mono ${isDisabled ? "text-brand-text-primary" : "text-brand-text-primary"}` }, summary, extra > 0 && /* @__PURE__ */ React2.createElement("span", { className: "ml-1 text-brand-text-primary font-sans" }, "+", extra)));
    }), branches.length > 6 && /* @__PURE__ */ React2.createElement("div", { className: "text-[9px] text-brand-text-primary pl-3.5" }, "+", branches.length - 6, " more branches"), /* @__PURE__ */ React2.createElement("div", { className: "flex items-center gap-2 text-[10px] pt-1.5 mt-0.5 border-t border-brand-border" }, /* @__PURE__ */ React2.createElement("div", { className: "w-1.5 h-1.5 rounded-full bg-brand-black shrink-0" }), /* @__PURE__ */ React2.createElement("span", { className: "font-semibold text-brand-text-primary" }, "else"), /* @__PURE__ */ React2.createElement("span", { className: "text-brand-text-primary" }, "default path"))),
    /* @__PURE__ */ React2.createElement("div", { className: "relative h-5 border-t border-brand-border mt-1" }, branches.map((branch, idx) => /* @__PURE__ */ React2.createElement(
      "span",
      {
        key: branch.id,
        className: `absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium leading-none truncate max-w-[44px] text-center ${isDisabled ? "text-brand-text-primary" : "text-indigo-400"}`,
        style: { left: handleLeft(idx) }
      },
      (branch.label || "").slice(0, 6)
    )), /* @__PURE__ */ React2.createElement("span", { className: "absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium text-brand-text-primary leading-none", style: { left: handleLeft(branches.length) } }, "else"), /* @__PURE__ */ React2.createElement("span", { className: "absolute bottom-1 transform -translate-x-1/2 text-[8px] font-medium text-red-300 leading-none", style: { left: handleLeft(branches.length + 1) } }, "error")),
    /* @__PURE__ */ React2.createElement(
      Handle,
      {
        type: "target",
        position: Position.Top,
        isConnectable,
        style: { width: 10, height: 10, backgroundColor: isDisabled ? "#cbd5e1" : "#6366f1", border: "2px solid white", top: -5 }
      }
    ),
    branches.map((branch, idx) => /* @__PURE__ */ React2.createElement(
      Handle,
      {
        key: branch.id,
        type: "source",
        position: Position.Bottom,
        id: branch.id,
        isConnectable,
        style: { left: handleLeft(idx), width: 10, height: 10, backgroundColor: isDisabled ? "#cbd5e1" : "#6366f1", border: "2px solid white", bottom: -5 }
      }
    )),
    /* @__PURE__ */ React2.createElement(
      Handle,
      {
        type: "source",
        position: Position.Bottom,
        id: "default",
        isConnectable,
        style: { left: handleLeft(branches.length), width: 10, height: 10, backgroundColor: isDisabled ? "#cbd5e1" : "#94a3b8", border: "2px solid white", bottom: -5 }
      }
    ),
    /* @__PURE__ */ React2.createElement(
      Handle,
      {
        type: "source",
        position: Position.Bottom,
        id: "error",
        isConnectable,
        style: { left: handleLeft(branches.length + 1), width: 10, height: 10, backgroundColor: isDisabled ? "#cbd5e1" : "#ef4444", border: "2px solid white", bottom: -5 }
      }
    )
  );
});

// src/nodes/dataQueryNode.jsx
import React3, { memo as memo2, useState as useState2, useEffect as useEffect2, useMemo as useMemo2, useCallback as useCallback2 } from "react";
import { Handle as Handle2, Position as Position2 } from "reactflow";
import { JsonForms } from "@jsonforms/react";

// src/jsonFormsRenderers.jsx
import { jetFormsRenderers } from "@jet-admin/json-forms-renderers";
import {
  JetTextControl,
  JetSelectControl,
  JetDynamicArgsControl,
  JetNumberControl,
  JetCheckboxControl,
  JetVerticalLayout,
  JetGroupLayout,
  JetTabLayout,
  textInputTester,
  selectInputTester,
  dynamicArgsTester,
  verticalLayoutTester,
  groupLayoutTester,
  tabRendererTester,
  numberInputTester,
  checkboxTester,
  jetFormsRenderers as jetFormsRenderers2,
  jetFormsBaseRenderers
} from "@jet-admin/json-forms-renderers";

// src/nodes/dataQueryNode.jsx
import { Zap, RefreshCw, Ban as Ban2, Play } from "lucide-react";
import { Button as Button2 } from "@jet-admin/ui";
var ERROR_HANDLING_OPTIONS2 = {
  FAIL_WORKFLOW: "fail_workflow",
  CONTINUE: "continue",
  RETRY_THEN_CONTINUE: "retry_then_continue",
  RETRY_THEN_FAIL: "retry_then_fail"
};
var DataQueryNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { dataQueries, strings, onRefreshDataQueries, workflowNodes, workflowEdges, workflowInputArgs, onQueryTest } = useWorkflowNodes();
  const [formData, setFormData] = useState2({
    title: data?.title || "",
    description: data?.description || "",
    dataQueryID: data?.dataQueryID || "",
    args: data?.args || {},
    outputVariable: data?.outputVariable || "queryResult",
    timeoutSeconds: data?.timeoutSeconds ?? 300,
    retryLimit: data?.retryLimit ?? 0,
    retryDelaySeconds: data?.retryDelaySeconds ?? 5,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS2.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false
  });
  useEffect2(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        description: data.description || "",
        dataQueryID: data.dataQueryID || "",
        args: data.args || {},
        outputVariable: data.outputVariable || "queryResult",
        timeoutSeconds: data.timeoutSeconds ?? 300,
        retryLimit: data.retryLimit ?? 0,
        retryDelaySeconds: data.retryDelaySeconds ?? 5,
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS2.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false
      });
    }
  }, [data]);
  const selectedQuery = useMemo2(() => {
    return dataQueries?.find((q) => q.dataQueryID == formData.dataQueryID) || null;
  }, [dataQueries, formData.dataQueryID]);
  const schema = useMemo2(() => {
    const queryEnums = dataQueries?.map((q) => String(q.dataQueryID)) || [""];
    return {
      type: "object",
      properties: {
        title: { type: "string", title: strings.WORKFLOW_EDITOR_DATA_QUERY_TITLE_LABEL || "Node Title" },
        description: { type: "string", title: strings.WORKFLOW_EDITOR_NODE_DESCRIPTION_LABEL || "Description" },
        dataQueryID: { type: "string", title: strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_LABEL || "Data Query", enum: queryEnums.length > 0 ? queryEnums : [""] },
        args: { type: "object", title: strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_ARGUMENTS_LABEL || "Arguments" },
        outputVariable: { type: "string", title: strings.WORKFLOW_EDITOR_OUTPUT_VARIABLE_LABEL || "Output Variable Name", pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$" },
        timeoutSeconds: { type: "integer", title: strings.WORKFLOW_EDITOR_TIMEOUT_LABEL || "Timeout (seconds)", minimum: 1, maximum: 3600, default: 300 },
        retryLimit: { type: "integer", title: strings.WORKFLOW_EDITOR_RETRY_LIMIT_LABEL || "Retry Attempts", minimum: 0, maximum: 10, default: 0 },
        retryDelaySeconds: { type: "integer", title: strings.WORKFLOW_EDITOR_RETRY_DELAY_LABEL || "Retry Delay (seconds)", minimum: 1, maximum: 300, default: 5 },
        errorHandling: { type: "string", title: strings.WORKFLOW_EDITOR_ERROR_HANDLING_LABEL || "Error Behavior", enum: Object.values(ERROR_HANDLING_OPTIONS2) },
        isDisabled: { type: "boolean", title: strings.WORKFLOW_EDITOR_IS_DISABLED_LABEL || "Skip this node", default: false }
      },
      required: ["dataQueryID"]
    };
  }, [dataQueries, strings]);
  const uischema = useMemo2(() => {
    const generalElements = [
      { type: "Control", scope: "#/properties/title", options: { placeholder: strings.WORKFLOW_EDITOR_DATA_QUERY_TITLE_PLACEHOLDER || "Enter node title" } },
      { type: "Control", scope: "#/properties/description", options: { placeholder: strings.WORKFLOW_EDITOR_NODE_DESCRIPTION_PLACEHOLDER || "Describe what this node does...", multi: true, rows: 2 } },
      {
        type: "Control",
        scope: "#/properties/dataQueryID",
        options: {
          placeholder: strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_SELECT_LABEL || "Select a query",
          enumLabels: dataQueries?.reduce((acc, q) => {
            acc[String(q.dataQueryID)] = q.dataQueryTitle;
            return acc;
          }, {}) || {},
          showRefreshButton: !!onRefreshDataQueries,
          onRefresh: onRefreshDataQueries
        }
      }
    ];
    if (selectedQuery?.dataQueryOptions?.args?.length > 0) {
      generalElements.push({
        type: "Control",
        scope: "#/properties/args",
        options: { isDynamicArgs: true, args: selectedQuery.dataQueryOptions.args, workflowNodes, workflowEdges, workflowInputArgs, currentNodeId: nodeId }
      });
    }
    return {
      type: "Categorization",
      elements: [
        { type: "Category", label: strings.WORKFLOW_EDITOR_TAB_GENERAL || "General", elements: generalElements },
        { type: "Category", label: strings.WORKFLOW_EDITOR_TAB_OUTPUT || "Output", elements: [{ type: "Control", scope: "#/properties/outputVariable", options: { placeholder: "e.g., queryResult, userData, orderList" } }] },
        {
          type: "Category",
          label: strings.WORKFLOW_EDITOR_TAB_ADVANCED || "Advanced",
          elements: [
            { type: "Control", scope: "#/properties/timeoutSeconds" },
            { type: "Control", scope: "#/properties/retryLimit" },
            { type: "Control", scope: "#/properties/retryDelaySeconds" },
            {
              type: "Control",
              scope: "#/properties/errorHandling",
              options: {
                enumLabels: {
                  [ERROR_HANDLING_OPTIONS2.FAIL_WORKFLOW]: "Fail Workflow",
                  [ERROR_HANDLING_OPTIONS2.CONTINUE]: "Continue (ignore error)",
                  [ERROR_HANDLING_OPTIONS2.RETRY_THEN_CONTINUE]: "Retry, then Continue",
                  [ERROR_HANDLING_OPTIONS2.RETRY_THEN_FAIL]: "Retry, then Fail"
                }
              }
            },
            { type: "Control", scope: "#/properties/isDisabled" }
          ]
        }
      ]
    };
  }, [dataQueries, strings, selectedQuery, workflowNodes, workflowEdges, workflowInputArgs, nodeId, onRefreshDataQueries]);
  const handleFormChange = useCallback2(({ data: newData }) => {
    setFormData(newData);
  }, []);
  const handleSave = useCallback2(() => {
    onChange(formData);
  }, [onChange, formData]);
  const handleOpenTest = useCallback2(() => {
    if (onQueryTest && formData.dataQueryID) onQueryTest(formData.dataQueryID);
  }, [onQueryTest, formData.dataQueryID]);
  return /* @__PURE__ */ React3.createElement("div", { className: "w-full space-y-3" }, /* @__PURE__ */ React3.createElement(JsonForms, { schema, uischema, data: formData, renderers: jetFormsRenderers, onChange: handleFormChange }), /* @__PURE__ */ React3.createElement("div", { className: "rounded-md border border-border bg-muted/30 p-3 text-[10px] text-muted-foreground space-y-2" }, /* @__PURE__ */ React3.createElement("div", { className: "font-semibold text-xs text-foreground" }, "\u{1F4D8} Query Arguments"), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "font-medium text-foreground" }, "Argument Format:"), /* @__PURE__ */ React3.createElement("div", { className: "ml-3 mt-0.5 font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border" }, "{{ctx.input.userId}}"), " \u2192 pass input value"), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border" }, "{{ctx.queryResult.id}}"), " \u2192 from previous query"), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border" }, "id_{{ctx.input.id}}"), " \u2192 string interpolation"))), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "font-medium text-foreground" }, "Access Result:"), /* @__PURE__ */ React3.createElement("div", { className: "ml-3 mt-0.5" }, "Stored in ", /* @__PURE__ */ React3.createElement("code", { className: "bg-brand-dark px-1 py-0.5 rounded-sm border border-border font-mono" }, "ctx.{outputVariable}"), " for use in next nodes."))), /* @__PURE__ */ React3.createElement("div", { className: "flex items-center gap-2" }, onQueryTest && formData.dataQueryID && /* @__PURE__ */ React3.createElement(Button2, { type: "button", variant: "outline", size: "sm", onClick: handleOpenTest, className: "flex items-center gap-1.5" }, /* @__PURE__ */ React3.createElement(Play, { className: "h-3 w-3" }), "Test Query"), /* @__PURE__ */ React3.createElement(Button2, { type: "button", size: "sm", onClick: handleSave, className: "flex-1" }, strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_SAVE_BUTTON || "Save")));
};
var DataQueryNode = memo2(({ id, data, isConnectable }) => {
  const { dataQueries, nodeExecutionStatus } = useWorkflowNodes();
  const [selectedQueryTitle, setSelectedQueryTitle] = useState2("Select Query");
  const executionStatus = nodeExecutionStatus?.[id] || "idle";
  useEffect2(() => {
    if (data.dataQueryID && dataQueries) {
      const query = dataQueries.find((q) => q.dataQueryID === data.dataQueryID);
      setSelectedQueryTitle(query?.dataQueryTitle || "Unknown Query");
    } else {
      setSelectedQueryTitle("Select Query");
    }
  }, [data.dataQueryID, dataQueries]);
  const isDisabled = data?.isDisabled ?? false;
  const getStatusStyles2 = () => {
    switch (executionStatus) {
      case "running":
        return "border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse";
      case "completed":
        return "border-green-400 ring-2 ring-green-300 ring-opacity-50";
      case "failed":
        return "border-red-400 ring-2 ring-red-300 ring-opacity-50";
      case "skipped":
        return "border-orange-300 opacity-60";
      default:
        return "border-brand-border hover:border-blue-400 hover:shadow-md";
    }
  };
  const StatusIndicator2 = () => {
    if (executionStatus === "running") return /* @__PURE__ */ React3.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin" }, /* @__PURE__ */ React3.createElement(RefreshCw, { className: "w-3 h-3 text-white" }));
    if (executionStatus === "completed") return /* @__PURE__ */ React3.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ React3.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React3.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    if (executionStatus === "failed") return /* @__PURE__ */ React3.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ React3.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React3.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    return null;
  };
  return /* @__PURE__ */ React3.createElement("div", { className: `relative bg-brand-black border rounded-sm min-w-[280px] max-w-[350px] transition-all duration-150 ${isDisabled ? "border-brand-border opacity-50" : getStatusStyles2()} ${!data.dataQueryID ? "!border-red-400 !bg-red-950/40" : ""}` }, /* @__PURE__ */ React3.createElement(StatusIndicator2, null), /* @__PURE__ */ React3.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React3.createElement(
    "div",
    {
      style: { borderTopLeftRadius: "0.25rem", borderBottomLeftRadius: "0.25rem" },
      className: `flex flex-col items-center justify-center px-3 py-3 border-r ${isDisabled ? "bg-brand-dark border-brand-border" : executionStatus === "running" ? "bg-blue-950/40 border-blue-800" : executionStatus === "completed" ? "bg-green-950/40 border-green-800" : executionStatus === "failed" ? "bg-red-950/40 border-red-800" : "bg-blue-950/40 border-blue-800"}`
    },
    /* @__PURE__ */ React3.createElement(Zap, { className: `w-5 h-5 ${isDisabled ? "text-brand-text-primary" : executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-blue-500"}` })
  ), /* @__PURE__ */ React3.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React3.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React3.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-brand-text-primary line-through" : "text-brand-text-primary"}` }, data?.title || "Untitled"), isDisabled && /* @__PURE__ */ React3.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm border border-orange-800" }, /* @__PURE__ */ React3.createElement(Ban2, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ React3.createElement("div", { className: `text-sm truncate mt-0.5 ${isDisabled ? "text-brand-text-primary" : "text-brand-text-primary"}` }, selectedQueryTitle.length > 20 ? `${String(selectedQueryTitle).substring(0, 20)}...` : selectedQueryTitle)), /* @__PURE__ */ React3.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-brand-border" }, /* @__PURE__ */ React3.createElement("div", { className: `w-2 h-2 rounded-full mb-1 ${isDisabled ? "bg-brand-black" : "bg-green-400"}`, title: "Success" }), /* @__PURE__ */ React3.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-brand-black" : "bg-red-400"}`, title: "Error" }))), /* @__PURE__ */ React3.createElement(Handle2, { type: "target", position: Position2.Top, isConnectable, style: { width: "10px", height: "10px", backgroundColor: isDisabled ? "#cbd5e1" : "#3b82f6", border: "none", top: "-5px" } }), /* @__PURE__ */ React3.createElement(Handle2, { type: "source", position: Position2.Bottom, id: "success", isConnectable, style: { left: "35%", width: "10px", height: "10px", backgroundColor: isDisabled ? "#cbd5e1" : "#22c55e", border: "none", bottom: "-5px" } }), /* @__PURE__ */ React3.createElement(Handle2, { type: "source", position: Position2.Bottom, id: "error", isConnectable, style: { left: "65%", width: "10px", height: "10px", backgroundColor: isDisabled ? "#cbd5e1" : "#ef4444", border: "none", bottom: "-5px" } }));
});

// src/nodes/javascriptNode.jsx
import React4, { memo as memo3, useState as useState3, useEffect as useEffect3, useMemo as useMemo3, useCallback as useCallback3 } from "react";
import { Handle as Handle3, Position as Position3 } from "reactflow";
import { JsonForms as JsonForms2 } from "@jsonforms/react";
import { Button as Button3 } from "@jet-admin/ui";
import { Ban as Ban3, Clock, RefreshCw as RefreshCw2, AlertCircle, FileCode } from "lucide-react";
var ERROR_HANDLING_OPTIONS3 = {
  FAIL_WORKFLOW: "fail_workflow",
  CONTINUE: "continue",
  RETRY_THEN_CONTINUE: "retry_then_continue",
  RETRY_THEN_FAIL: "retry_then_fail"
};
var JavascriptNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes, workflowInputArgs, workflowContext } = useWorkflowNodes();
  const [formData, setFormData] = useState3({
    title: data?.title || "",
    description: data?.description || "",
    code: data?.code || "return true;",
    outputVariable: data?.outputVariable || "scriptResult",
    timeoutSeconds: data?.timeoutSeconds ?? 30,
    retryLimit: data?.retryLimit ?? 0,
    retryDelaySeconds: data?.retryDelaySeconds ?? 5,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS3.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false
  });
  useEffect3(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        description: data.description || "",
        code: data.code || "return true;",
        outputVariable: data.outputVariable || "scriptResult",
        timeoutSeconds: data.timeoutSeconds ?? 30,
        retryLimit: data.retryLimit ?? 0,
        retryDelaySeconds: data.retryDelaySeconds ?? 5,
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS3.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false
      });
    }
  }, [data]);
  const availableVariables = useMemo3(() => {
    if (!workflowNodes) return [];
    return workflowNodes.filter((n) => n.id !== nodeId && n.data?.outputVariable).map((n) => ({
      nodeId: n.id,
      nodeTitle: n.data?.title || n.type,
      variable: n.data.outputVariable
    }));
  }, [workflowNodes, nodeId]);
  const intellisenseFeed = useMemo3(() => {
    const feed = [];
    feed.push({ parentPath: "", label: "ctx", kind: "Variable", insertText: "ctx", detail: "Workflow context object" });
    feed.push({ parentPath: "ctx", label: "input", kind: "Property", insertText: "input", detail: "Workflow Input Parameters" });
    feed.push({ parentPath: "ctx", label: "item", kind: "Property", insertText: "item", detail: "Current loop item (if inside loop)" });
    if (workflowInputArgs && workflowInputArgs.length > 0) {
      workflowInputArgs.forEach((arg) => {
        feed.push({
          parentPath: "ctx.input",
          label: arg.key,
          kind: "Field",
          insertText: arg.key,
          detail: arg.type ? `Input arg (${arg.type})` : "Workflow Input Parameter"
        });
      });
    }
    if (workflowNodes) {
      workflowNodes.filter((n) => n.id !== nodeId && n.data?.outputVariable).forEach((n) => {
        feed.push({
          parentPath: "ctx",
          label: n.data.outputVariable,
          kind: "Variable",
          insertText: n.data.outputVariable,
          detail: n.data?.title || n.type ? `From: ${n.data?.title || n.type}` : "Context variable"
        });
      });
    }
    const traverse = (obj, currentPath, depth = 0) => {
      if (depth > 4 || obj === null || obj === void 0) return;
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === "object" && obj[0] !== null) {
          Object.entries(obj[0]).forEach(([key, value]) => {
            const type = Array.isArray(value) ? "Array" : typeof value;
            feed.push({
              parentPath: currentPath,
              label: key,
              kind: type === "object" || type === "Array" ? "Property" : "Field",
              insertText: key,
              detail: `${type} (from array item)`
            });
            if (type === "object" || type === "Array") {
              traverse(value, `${currentPath}.${key}`, depth + 1);
            }
          });
        }
      } else if (typeof obj === "object") {
        Object.entries(obj).forEach(([key, value]) => {
          const type = Array.isArray(value) ? "Array" : typeof value;
          feed.push({
            parentPath: currentPath,
            label: key,
            kind: type === "object" || type === "Array" ? "Property" : "Field",
            insertText: key,
            detail: type
          });
          if (type === "object" || type === "Array") {
            traverse(value, `${currentPath}.${key}`, depth + 1);
          }
        });
      }
    };
    if (workflowContext && Object.keys(workflowContext).length > 0) {
      traverse(workflowContext, "ctx", 0);
    }
    const uniqueFeed = [];
    const seen = /* @__PURE__ */ new Set();
    feed.forEach((item) => {
      const key = `${item.parentPath}.${item.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueFeed.push(item);
      }
    });
    return uniqueFeed;
  }, [workflowNodes, nodeId, workflowInputArgs, workflowContext]);
  const schema = useMemo3(() => {
    return {
      type: "object",
      properties: {
        // General Tab
        title: {
          type: "string",
          title: strings?.WORKFLOW_EDITOR_JAVASCRIPT_TITLE_LABEL || "Node Title"
        },
        description: {
          type: "string",
          title: strings?.WORKFLOW_EDITOR_NODE_DESCRIPTION_LABEL || "Description"
        },
        code: {
          type: "string",
          format: "code-javascript",
          title: strings?.WORKFLOW_EDITOR_JAVASCRIPT_CODE_LABEL || "JavaScript Code"
        },
        // Output Tab
        outputVariable: {
          type: "string",
          title: strings?.WORKFLOW_EDITOR_OUTPUT_VARIABLE_LABEL || "Output Variable Name",
          description: "Variable name to store result (accessible as ctx.{name})",
          pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        // Execution Settings Tab
        timeoutSeconds: {
          type: "integer",
          title: strings?.WORKFLOW_EDITOR_TIMEOUT_LABEL || "Timeout (seconds)",
          minimum: 1,
          maximum: 300,
          default: 30
        },
        retryLimit: {
          type: "integer",
          title: strings?.WORKFLOW_EDITOR_RETRY_LIMIT_LABEL || "Retry Attempts",
          minimum: 0,
          maximum: 10,
          default: 0
        },
        retryDelaySeconds: {
          type: "integer",
          title: strings?.WORKFLOW_EDITOR_RETRY_DELAY_LABEL || "Retry Delay (seconds)",
          minimum: 1,
          maximum: 300,
          default: 5
        },
        errorHandling: {
          type: "string",
          title: strings?.WORKFLOW_EDITOR_ERROR_HANDLING_LABEL || "Error Behavior",
          enum: Object.values(ERROR_HANDLING_OPTIONS3)
        },
        isDisabled: {
          type: "boolean",
          title: strings?.WORKFLOW_EDITOR_IS_DISABLED_LABEL || "Skip this node",
          default: false
        }
      },
      required: ["code"]
    };
  }, [strings]);
  const uischema = useMemo3(() => {
    const contextHint = availableVariables.length > 0 ? `Available: ${availableVariables.map((v) => `ctx.${v.variable}`).join(", ")}` : "No context variables available yet";
    return {
      type: "Categorization",
      elements: [
        {
          type: "Category",
          label: strings?.WORKFLOW_EDITOR_TAB_GENERAL || "General",
          elements: [
            {
              type: "Control",
              scope: "#/properties/title",
              options: {
                placeholder: strings?.WORKFLOW_EDITOR_JAVASCRIPT_TITLE_PLACEHOLDER || "Enter node title"
              }
            },
            {
              type: "Control",
              scope: "#/properties/description",
              options: {
                placeholder: strings?.WORKFLOW_EDITOR_NODE_DESCRIPTION_PLACEHOLDER || "Describe what this script does...",
                multi: true,
                rows: 2
              }
            },
            {
              type: "Control",
              scope: "#/properties/code",
              options: {
                format: "code-javascript",
                multi: true,
                rows: 12,
                placeholder: "// Your JavaScript code here\n// Access context: ctx.variableName\n// Return a value to store in outputVariable\nreturn true;",
                hint: contextHint,
                intellisenseFeed,
                showHeader: true
              }
            }
          ]
        },
        {
          type: "Category",
          label: strings?.WORKFLOW_EDITOR_TAB_OUTPUT || "Output",
          elements: [
            {
              type: "Control",
              scope: "#/properties/outputVariable",
              options: {
                placeholder: "e.g., scriptResult, processedData, isValid"
              }
            }
          ]
        },
        {
          type: "Category",
          label: strings?.WORKFLOW_EDITOR_TAB_ADVANCED || "Advanced",
          elements: [
            {
              type: "Control",
              scope: "#/properties/timeoutSeconds"
            },
            {
              type: "Control",
              scope: "#/properties/retryLimit"
            },
            {
              type: "Control",
              scope: "#/properties/retryDelaySeconds"
            },
            {
              type: "Control",
              scope: "#/properties/errorHandling",
              options: {
                enumLabels: {
                  [ERROR_HANDLING_OPTIONS3.FAIL_WORKFLOW]: "Fail Workflow",
                  [ERROR_HANDLING_OPTIONS3.CONTINUE]: "Continue (ignore error)",
                  [ERROR_HANDLING_OPTIONS3.RETRY_THEN_CONTINUE]: "Retry, then Continue",
                  [ERROR_HANDLING_OPTIONS3.RETRY_THEN_FAIL]: "Retry, then Fail"
                }
              }
            },
            {
              type: "Control",
              scope: "#/properties/isDisabled"
            }
          ]
        }
      ]
    };
  }, [strings, availableVariables]);
  const handleFormChange = useCallback3(({ data: newData }) => {
    setFormData(newData);
  }, []);
  const handleSave = useCallback3(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ React4.createElement("div", { className: "w-full" }, /* @__PURE__ */ React4.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React4.createElement(
    JsonForms2,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React4.createElement("div", { className: "p-2.5 bg-brand-dark border border-brand-border rounded-sm text-[10px] text-brand-text-primary space-y-2" }, /* @__PURE__ */ React4.createElement("div", { className: "font-semibold text-brand-text-primary text-xs" }, "\u{1F4D8} Writing JavaScript Code"), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("span", { className: "font-medium text-brand-text-primary" }, "Access Context:"), /* @__PURE__ */ React4.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("code", { className: "bg-brand-black px-1 rounded-sm" }, "ctx.input.paramName"), " \u2192 workflow input"), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("code", { className: "bg-brand-black px-1 rounded-sm" }, "ctx.queryResult"), " \u2192 previous node output"), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("code", { className: "bg-brand-black px-1 rounded-sm" }, "ctx.item"), " \u2192 current loop item"))), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("span", { className: "font-medium text-brand-text-primary" }, "Return Value:"), /* @__PURE__ */ React4.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary" }, "Use ", /* @__PURE__ */ React4.createElement("code", { className: "bg-brand-black px-1 py-0.5 rounded-sm font-mono" }, "return yourValue;"), " to store result in output variable.")), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("span", { className: "font-medium text-brand-text-primary" }, "Available Globals:"), /* @__PURE__ */ React4.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary" }, /* @__PURE__ */ React4.createElement("code", { className: "bg-brand-black px-1 rounded-sm font-mono text-[9px]" }, "JSON, Math, Date, Array, Object, String, Number, Boolean, parseInt, parseFloat"))), /* @__PURE__ */ React4.createElement("div", { className: "text-amber-600 bg-amber-50 border border-amber-800 rounded-sm p-1.5 mt-2" }, /* @__PURE__ */ React4.createElement("strong", null, "\u26A0\uFE0F Note:"), " Code runs in a sandbox. No network access, filesystem, or require().")), /* @__PURE__ */ React4.createElement(
    Button3,
    {
      type: "button",
      size: "sm",
      onClick: handleSave,
      className: "w-full"
    },
    strings?.WORKFLOW_EDITOR_JAVASCRIPT_NODE_SAVE_BUTTON || "Save"
  )));
};
var JavascriptNode = memo3(({ id, data, isConnectable }) => {
  const { strings, nodeExecutionStatus } = useWorkflowNodes();
  const executionStatus = nodeExecutionStatus?.[id] || "idle";
  const isDisabled = data?.isDisabled ?? false;
  const hasRetry = (data?.retryLimit ?? 0) > 0;
  const hasCustomTimeout = (data?.timeoutSeconds ?? 30) !== 30;
  const outputVar = data.outputVariable || "scriptResult";
  const codePreview = data.code ? data.code.trim().split("\n")[0].substring(0, 25) + (data.code.length > 25 ? "..." : "") : "// No code";
  const getStatusStyles2 = () => {
    switch (executionStatus) {
      case "running":
        return "border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse";
      case "completed":
        return "border-green-400 ring-2 ring-green-300 ring-opacity-50";
      case "failed":
        return "border-red-400 ring-2 ring-red-300 ring-opacity-50";
      case "skipped":
        return "border-orange-300 opacity-60";
      default:
        return "border-brand-border hover:border-yellow-400 hover:shadow-md";
    }
  };
  const StatusIndicator2 = () => {
    if (executionStatus === "running") {
      return /* @__PURE__ */ React4.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin" }, /* @__PURE__ */ React4.createElement(RefreshCw2, { className: "w-3 h-3 text-white" }));
    }
    if (executionStatus === "completed") {
      return /* @__PURE__ */ React4.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ React4.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React4.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    }
    if (executionStatus === "failed") {
      return /* @__PURE__ */ React4.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ React4.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React4.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    }
    return null;
  };
  return /* @__PURE__ */ React4.createElement("div", { className: `
      relative bg-brand-black border rounded
      min-w-[340px] max-w-[400px]
      transition-all duration-150
      ${isDisabled ? "border-brand-border opacity-50" : getStatusStyles2()}
      ${!data.code ? "!border-red-400 !bg-red-950/40" : ""}
    ` }, /* @__PURE__ */ React4.createElement(StatusIndicator2, null), /* @__PURE__ */ React4.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React4.createElement(
    "div",
    {
      style: {
        borderTopLeftRadius: "0.25rem",
        borderBottomLeftRadius: "0.25rem"
      },
      className: `
          flex flex-col items-center justify-center px-3 py-3 border-r
          ${isDisabled ? "bg-brand-dark border-brand-border" : executionStatus === "running" ? "bg-blue-950/40 border-blue-800" : executionStatus === "completed" ? "bg-green-950/40 border-green-800" : executionStatus === "failed" ? "bg-red-950/40 border-red-800" : "bg-yellow-950/40 border-yellow-800"}
        `
    },
    /* @__PURE__ */ React4.createElement(FileCode, { className: `w-5 h-5 ${isDisabled ? "text-brand-text-primary" : executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-yellow-500"}` })
  ), /* @__PURE__ */ React4.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React4.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React4.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-brand-text-primary line-through" : "text-brand-text-primary"}` }, data?.title || "Untitled Script"), isDisabled && /* @__PURE__ */ React4.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm border border-orange-800" }, /* @__PURE__ */ React4.createElement(Ban3, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ React4.createElement("div", { className: `text-[10px] font-mono truncate mt-0.5 ${isDisabled ? "text-brand-text-primary" : "text-brand-text-primary"}` }, codePreview)), /* @__PURE__ */ React4.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-brand-border" }, /* @__PURE__ */ React4.createElement("div", { className: `w-2 h-2 rounded-full mb-1 ${isDisabled ? "bg-brand-black" : "bg-green-400"}`, title: "Success" }), /* @__PURE__ */ React4.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-brand-black" : "bg-red-400"}`, title: "Error" }))), /* @__PURE__ */ React4.createElement(
    Handle3,
    {
      type: "target",
      position: Position3.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#eab308",
        border: "none",
        top: "-5px"
      }
    }
  ), /* @__PURE__ */ React4.createElement(
    Handle3,
    {
      type: "source",
      position: Position3.Bottom,
      id: "success",
      isConnectable,
      style: {
        left: "35%",
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#22c55e",
        border: "none",
        bottom: "-5px"
      }
    }
  ), /* @__PURE__ */ React4.createElement(
    Handle3,
    {
      type: "source",
      position: Position3.Bottom,
      id: "error",
      isConnectable,
      style: {
        left: "65%",
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#ef4444",
        border: "none",
        bottom: "-5px"
      }
    }
  ));
});

// src/nodes/startNode.jsx
import React5, { memo as memo4, useState as useState4, useEffect as useEffect4, useMemo as useMemo4, useCallback as useCallback4 } from "react";
import { Handle as Handle4, Position as Position4 } from "reactflow";
import { JsonForms as JsonForms3 } from "@jsonforms/react";
import { Button as Button4 } from "@jet-admin/ui";
import { Play as Play2 } from "lucide-react";
var StartNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = useState4({
    title: data?.title || "Start",
    description: data?.description || ""
  });
  useEffect4(() => {
    if (data) {
      setFormData({
        title: data.title || "Start",
        description: data.description || ""
      });
    }
  }, [data]);
  const schema = useMemo4(() => ({
    type: "object",
    properties: {
      title: { type: "string", title: "Node Title" },
      description: { type: "string", title: "Description" }
    }
  }), []);
  const uischema = useMemo4(() => ({
    type: "VerticalLayout",
    elements: [
      { type: "Control", scope: "#/properties/title", options: { placeholder: "Enter node title" } },
      { type: "Control", scope: "#/properties/description", options: { placeholder: "Describe this workflow...", multi: true, rows: 2 } }
    ]
  }), []);
  const handleFormChange = useCallback4(({ data: newData }) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);
  const handleSave = useCallback4(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ React5.createElement("div", { className: "w-full space-y-4" }, /* @__PURE__ */ React5.createElement(
    JsonForms3,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React5.createElement("div", { className: "rounded-md border border-border bg-muted/30 p-3 text-[10px] text-muted-foreground space-y-2" }, /* @__PURE__ */ React5.createElement("div", { className: "font-semibold text-xs text-foreground" }, "\u{1F4D8} How This Works"), /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement("span", { className: "font-medium text-foreground" }, "Triggers:"), /* @__PURE__ */ React5.createElement("ul", { className: "ml-3 mt-0.5 space-y-0.5 list-disc list-inside text-muted-foreground" }, /* @__PURE__ */ React5.createElement("li", null, 'Manual: Click "Test Workflow" button'), /* @__PURE__ */ React5.createElement("li", null, "API: POST /api/v1/workflows/:id/run"), /* @__PURE__ */ React5.createElement("li", null, "Widget: Link workflow to a widget"))), /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement("span", { className: "font-medium text-foreground" }, "Input Parameters:"), /* @__PURE__ */ React5.createElement("div", { className: "ml-3 mt-0.5 text-muted-foreground" }, "Define inputs in the ", /* @__PURE__ */ React5.createElement("strong", null, '"Input Parameters"'), " panel (right side). Access them using:", " ", /* @__PURE__ */ React5.createElement("code", { className: "bg-brand-dark px-1 py-0.5 rounded-sm border border-border font-mono" }, "{{ctx.input.paramName}}"))), /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement("span", { className: "font-medium text-foreground" }, "Variable Format:"), /* @__PURE__ */ React5.createElement("div", { className: "ml-3 mt-0.5 font-mono text-[9px] space-y-0.5 text-muted-foreground" }, /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border" }, "{{ctx.input.userId}}"), " \u2192 input parameter"), /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border" }, "{{ctx.queryResult}}"), " \u2192 previous node output"), /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border" }, "id_{{ctx.input.id}}"), " \u2192 string interpolation")))), /* @__PURE__ */ React5.createElement(Button4, { type: "button", size: "sm", onClick: handleSave, className: "w-full" }, "Save"));
};
var StartNode = memo4(({ id, data, isConnectable }) => {
  const { nodeExecutionStatus } = useWorkflowNodes();
  const executionStatus = nodeExecutionStatus?.[id] || "idle";
  const getStatusStyles2 = () => {
    switch (executionStatus) {
      case "running":
        return "border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse";
      case "completed":
        return "border-green-400 ring-2 ring-green-300 ring-opacity-50";
      case "failed":
        return "border-red-400 ring-2 ring-red-300 ring-opacity-50";
      case "skipped":
        return "border-orange-300 opacity-60";
      default:
        return "border-brand-border hover:border-green-400 hover:shadow-md";
    }
  };
  const StatusIndicator2 = () => {
    if (executionStatus === "running") return /* @__PURE__ */ React5.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10" }, /* @__PURE__ */ React5.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React5.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" })));
    if (executionStatus === "completed") return /* @__PURE__ */ React5.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React5.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React5.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    if (executionStatus === "failed") return /* @__PURE__ */ React5.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React5.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React5.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    return null;
  };
  return /* @__PURE__ */ React5.createElement("div", { className: `relative bg-brand-black border rounded-sm min-w-[280px] max-w-[350px] transition-all duration-150 ${getStatusStyles2()}` }, /* @__PURE__ */ React5.createElement(StatusIndicator2, null), /* @__PURE__ */ React5.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React5.createElement(
    "div",
    {
      style: { borderTopLeftRadius: "0.25rem", borderBottomLeftRadius: "0.25rem" },
      className: `flex flex-col items-center justify-center px-3 py-3 border-r ${executionStatus === "running" ? "bg-blue-950/40 border-blue-800" : executionStatus === "completed" ? "bg-green-950/40 border-green-800" : executionStatus === "failed" ? "bg-red-950/40 border-red-800" : "bg-green-950/40 border-green-800"}`
    },
    /* @__PURE__ */ React5.createElement(Play2, { className: `w-5 h-5 ${executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-green-500"}` })
  ), /* @__PURE__ */ React5.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React5.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React5.createElement("span", { className: "text-xs font-semibold truncate text-brand-text-primary" }, data?.title || "Start")), /* @__PURE__ */ React5.createElement("div", { className: "text-[10px] mt-0.5 text-brand-text-primary" }, "Workflow entry point")), /* @__PURE__ */ React5.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-brand-border" }, /* @__PURE__ */ React5.createElement("div", { className: "w-2 h-2 rounded-full bg-green-400", title: "Output" }))), /* @__PURE__ */ React5.createElement(
    Handle4,
    {
      type: "source",
      position: Position4.Bottom,
      id: "output",
      isConnectable,
      style: { width: "10px", height: "10px", backgroundColor: "#22c55e", border: "none", bottom: "-5px" }
    }
  ));
});

// src/nodes/loopNode.jsx
import React6, { memo as memo5, useState as useState5, useEffect as useEffect5, useMemo as useMemo5, useCallback as useCallback5 } from "react";
import { Handle as Handle5, Position as Position5 } from "reactflow";
import { JsonForms as JsonForms4 } from "@jsonforms/react";
import { Button as Button5 } from "@jet-admin/ui";
import { Repeat, Ban as Ban4, ChevronRight } from "lucide-react";
var ERROR_HANDLING_OPTIONS4 = {
  FAIL_WORKFLOW: "fail_workflow",
  CONTINUE: "continue",
  SKIP_ITEM: "skip_item"
};
var LoopNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
  const [formData, setFormData] = useState5({
    title: data?.title || "Loop",
    description: data?.description || "",
    sourceVariable: data?.sourceVariable || "",
    itemVariable: data?.itemVariable || "item",
    indexVariable: data?.indexVariable || "index",
    maxIterations: data?.maxIterations ?? 1e3,
    delayBetweenItems: data?.delayBetweenItems ?? 0,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS4.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false
  });
  useEffect5(() => {
    if (data) {
      setFormData({
        title: data.title || "Loop",
        description: data.description || "",
        sourceVariable: data.sourceVariable || "",
        itemVariable: data.itemVariable || "item",
        indexVariable: data.indexVariable || "index",
        maxIterations: data.maxIterations ?? 1e3,
        delayBetweenItems: data.delayBetweenItems ?? 0,
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS4.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false
      });
    }
  }, [data]);
  const availableVariables = useMemo5(() => {
    if (!workflowNodes) return [];
    return workflowNodes.filter((n) => n.id !== nodeId && n.data?.outputVariable).map((n) => ({
      nodeId: n.id,
      nodeTitle: n.data?.title || n.type,
      variable: n.data.outputVariable
    }));
  }, [workflowNodes, nodeId]);
  const schema = useMemo5(() => {
    return {
      type: "object",
      properties: {
        title: {
          type: "string",
          title: "Node Title"
        },
        description: {
          type: "string",
          title: "Description"
        },
        sourceVariable: {
          type: "string",
          title: "Source Array",
          description: "Template resolving to the array to iterate (e.g., {{ctx.queryResult}})"
        },
        itemVariable: {
          type: "string",
          title: "Item Variable Name",
          description: "Variable name for current item (accessible as ctx.{name})",
          pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        indexVariable: {
          type: "string",
          title: "Index Variable Name",
          description: "Variable name for current index (accessible as ctx.{name})",
          pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        maxIterations: {
          type: "integer",
          title: "Max Iterations",
          description: "Safety limit to prevent infinite loops",
          minimum: 1,
          maximum: 1e5,
          default: 1e3
        },
        delayBetweenItems: {
          type: "integer",
          title: "Delay Between Items (ms)",
          description: "Wait time between processing each item",
          minimum: 0,
          maximum: 6e4,
          default: 0
        },
        errorHandling: {
          type: "string",
          title: "Error Behavior",
          enum: Object.values(ERROR_HANDLING_OPTIONS4)
        },
        isDisabled: {
          type: "boolean",
          title: "Skip this node",
          default: false
        }
      },
      required: ["sourceVariable", "itemVariable"]
    };
  }, []);
  const uischema = useMemo5(() => {
    const contextHint = availableVariables.length > 0 ? `Available: ${availableVariables.map((v) => `ctx.${v.variable}`).join(", ")}` : "No context variables available yet";
    return {
      type: "Categorization",
      elements: [
        {
          type: "Category",
          label: "General",
          elements: [
            {
              type: "Control",
              scope: "#/properties/title",
              options: { placeholder: "Enter node title" }
            },
            {
              type: "Control",
              scope: "#/properties/description",
              options: { placeholder: "Describe what this loop does...", multi: true, rows: 2 }
            }
          ]
        },
        {
          type: "Category",
          label: "Loop Config",
          elements: [
            {
              type: "Control",
              scope: "#/properties/sourceVariable",
              options: { placeholder: "{{ctx.queryResult}}", hint: contextHint }
            },
            {
              type: "Control",
              scope: "#/properties/itemVariable",
              options: { placeholder: "item" }
            },
            {
              type: "Control",
              scope: "#/properties/indexVariable",
              options: { placeholder: "index" }
            }
          ]
        },
        {
          type: "Category",
          label: "Advanced",
          elements: [
            { type: "Control", scope: "#/properties/maxIterations" },
            { type: "Control", scope: "#/properties/delayBetweenItems" },
            {
              type: "Control",
              scope: "#/properties/errorHandling",
              options: {
                enumLabels: {
                  [ERROR_HANDLING_OPTIONS4.FAIL_WORKFLOW]: "Fail Workflow",
                  [ERROR_HANDLING_OPTIONS4.CONTINUE]: "Continue to next item",
                  [ERROR_HANDLING_OPTIONS4.SKIP_ITEM]: "Skip failed item"
                }
              }
            },
            { type: "Control", scope: "#/properties/isDisabled" }
          ]
        }
      ]
    };
  }, [availableVariables]);
  const handleFormChange = useCallback5(({ data: newData }) => {
    setFormData(newData);
  }, []);
  const handleSave = useCallback5(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ React6.createElement("div", { className: "w-full" }, /* @__PURE__ */ React6.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React6.createElement(
    JsonForms4,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React6.createElement("div", { className: "p-2.5 bg-brand-dark border border-brand-border rounded-sm text-[10px] text-brand-text-primary space-y-2" }, /* @__PURE__ */ React6.createElement("div", { className: "font-semibold text-brand-text-primary text-xs" }, "\u{1F4D8} Loop Configuration"), /* @__PURE__ */ React6.createElement("div", null, /* @__PURE__ */ React6.createElement("span", { className: "font-medium text-brand-text-primary" }, "Source Array Format:"), /* @__PURE__ */ React6.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ React6.createElement("div", null, /* @__PURE__ */ React6.createElement("code", { className: "bg-brand-black px-1 rounded-sm" }, "{{ctx.queryResult}}"), " \u2192 array from previous node"), /* @__PURE__ */ React6.createElement("div", null, /* @__PURE__ */ React6.createElement("code", { className: "bg-brand-black px-1 rounded-sm" }, "{{ctx.input.items}}"), " \u2192 array from input"))), /* @__PURE__ */ React6.createElement("div", null, /* @__PURE__ */ React6.createElement("span", { className: "font-medium text-brand-text-primary" }, "Inside Loop Body:"), /* @__PURE__ */ React6.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ React6.createElement("div", null, /* @__PURE__ */ React6.createElement("code", { className: "bg-brand-black px-1 rounded-sm" }, "ctx.item"), " \u2192 current array element"), /* @__PURE__ */ React6.createElement("div", null, /* @__PURE__ */ React6.createElement("code", { className: "bg-brand-black px-1 rounded-sm" }, "ctx.index"), " \u2192 current iteration index (0-based)"))), /* @__PURE__ */ React6.createElement("div", null, /* @__PURE__ */ React6.createElement("span", { className: "font-medium text-brand-text-primary" }, "Handles:"), /* @__PURE__ */ React6.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary" }, /* @__PURE__ */ React6.createElement("strong", null, "Loop (cyan):"), " Executes for each item \u2192 ", /* @__PURE__ */ React6.createElement("strong", null, "Completed (green):"), " After all iterations"))), /* @__PURE__ */ React6.createElement(
    Button5,
    {
      type: "button",
      size: "sm",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded-sm hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    "Save"
  )));
};
var LoopNode = memo5(({ id, data, isConnectable }) => {
  const { strings, nodeExecutionStatus } = useWorkflowNodes();
  const executionStatus = nodeExecutionStatus?.[id] || "idle";
  const isDisabled = data?.isDisabled ?? false;
  const sourceVariable = data?.sourceVariable || "{{ctx.array}}";
  const itemVariable = data?.itemVariable || "item";
  const getStatusStyles2 = () => {
    switch (executionStatus) {
      case "running":
        return "border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse";
      case "completed":
        return "border-green-400 ring-2 ring-green-300 ring-opacity-50";
      case "failed":
        return "border-red-400 ring-2 ring-red-300 ring-opacity-50";
      case "skipped":
        return "border-orange-300 opacity-60";
      default:
        return "border-brand-border hover:border-cyan-400 hover:shadow-md";
    }
  };
  const StatusIndicator2 = () => {
    if (executionStatus === "running") return /* @__PURE__ */ React6.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10" }, /* @__PURE__ */ React6.createElement(Repeat, { className: "w-3 h-3 text-white" }));
    if (executionStatus === "completed") return /* @__PURE__ */ React6.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React6.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React6.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    if (executionStatus === "failed") return /* @__PURE__ */ React6.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React6.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React6.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    return null;
  };
  return /* @__PURE__ */ React6.createElement("div", { className: `
      relative bg-brand-black border rounded-sm
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled ? "border-brand-border opacity-50" : getStatusStyles2()}
      ${!data.sourceVariable ? "!border-red-400 !bg-red-950/40" : ""}
    ` }, /* @__PURE__ */ React6.createElement(StatusIndicator2, null), /* @__PURE__ */ React6.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React6.createElement(
    "div",
    {
      style: {
        borderTopLeftRadius: "0.25rem",
        borderBottomLeftRadius: "0.25rem"
      },
      className: `
            flex flex-col items-center justify-center px-3 py-3 border-r
            ${isDisabled ? "bg-brand-dark border-brand-border" : executionStatus === "running" ? "bg-blue-950/40 border-blue-800" : executionStatus === "completed" ? "bg-green-950/40 border-green-800" : executionStatus === "failed" ? "bg-red-950/40 border-red-800" : "bg-cyan-950/40 border-cyan-800"}
          `
    },
    /* @__PURE__ */ React6.createElement(Repeat, { className: `w-5 h-5 ${isDisabled ? "text-brand-text-primary" : executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-cyan-500"}` })
  ), /* @__PURE__ */ React6.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React6.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React6.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-brand-text-primary line-through" : "text-brand-text-primary"}` }, data?.title || "Loop"), isDisabled && /* @__PURE__ */ React6.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm border border-orange-800" }, /* @__PURE__ */ React6.createElement(Ban4, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ React6.createElement("div", { className: `text-[10px] font-mono mt-0.5 ${isDisabled ? "text-brand-text-primary" : "text-brand-text-primary"}` }, "for (", itemVariable, " in ", sourceVariable.length > 20 ? sourceVariable.substring(0, 20) + "..." : sourceVariable, ")")), /* @__PURE__ */ React6.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-brand-border" }, /* @__PURE__ */ React6.createElement("div", { className: `w-2 h-2 rounded-full mb-1 ${isDisabled ? "bg-brand-black" : "bg-cyan-400"}`, title: "Loop Body" }), /* @__PURE__ */ React6.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-brand-black" : "bg-green-400"}`, title: "Completed" }))), /* @__PURE__ */ React6.createElement(
    Handle5,
    {
      type: "target",
      position: Position5.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#06b6d4",
        border: "none",
        top: "-5px"
      }
    }
  ), /* @__PURE__ */ React6.createElement(
    Handle5,
    {
      type: "source",
      position: Position5.Bottom,
      id: "loop",
      isConnectable,
      style: {
        left: "35%",
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#06b6d4",
        border: "none",
        bottom: "-5px"
      }
    }
  ), /* @__PURE__ */ React6.createElement(
    Handle5,
    {
      type: "source",
      position: Position5.Bottom,
      id: "completed",
      isConnectable,
      style: {
        left: "65%",
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#22c55e",
        border: "none",
        bottom: "-5px"
      }
    }
  ));
});

// src/nodes/delayNode.jsx
import React7, { memo as memo6, useState as useState6, useEffect as useEffect6, useMemo as useMemo6, useCallback as useCallback6 } from "react";
import { Handle as Handle6, Position as Position6 } from "reactflow";
import { JsonForms as JsonForms5 } from "@jsonforms/react";
import { Ban as Ban5, Clock as Clock2 } from "lucide-react";
import { Button as Button6 } from "@jet-admin/ui";
var DelayNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = useState6({
    title: data?.title || "Delay",
    description: data?.description || "",
    delayType: data?.delayType || "fixed",
    delayMs: data?.delayMs ?? 1e3,
    delaySeconds: data?.delaySeconds ?? 0,
    delayMinutes: data?.delayMinutes ?? 0,
    // For dynamic delay
    delayVariable: data?.delayVariable || "",
    // For until time
    untilTime: data?.untilTime || "",
    isDisabled: data?.isDisabled ?? false
  });
  useEffect6(() => {
    if (data) {
      setFormData({
        title: data.title || "Delay",
        description: data.description || "",
        delayType: data.delayType || "fixed",
        delayMs: data.delayMs ?? 1e3,
        delaySeconds: data.delaySeconds ?? 0,
        delayMinutes: data.delayMinutes ?? 0,
        delayVariable: data.delayVariable || "",
        untilTime: data.untilTime || "",
        isDisabled: data.isDisabled ?? false
      });
    }
  }, [data]);
  const schema = useMemo6(() => {
    return {
      type: "object",
      properties: {
        title: {
          type: "string",
          title: "Node Title"
        },
        description: {
          type: "string",
          title: "Description"
        },
        delayType: {
          type: "string",
          title: "Delay Type",
          enum: ["fixed", "dynamic", "until"]
        },
        delayMs: {
          type: "integer",
          title: "Milliseconds",
          minimum: 0,
          maximum: 999,
          default: 0
        },
        delaySeconds: {
          type: "integer",
          title: "Seconds",
          minimum: 0,
          maximum: 59,
          default: 1
        },
        delayMinutes: {
          type: "integer",
          title: "Minutes",
          minimum: 0,
          maximum: 1440,
          default: 0
        },
        delayVariable: {
          type: "string",
          title: "Delay Variable",
          description: "Template resolving to delay in ms (e.g., {{ctx.waitTime}})"
        },
        untilTime: {
          type: "string",
          title: "Until Time",
          description: "Wait until this time (ISO string or template like {{ctx.targetTime}})"
        },
        isDisabled: {
          type: "boolean",
          title: "Skip this node",
          default: false
        }
      }
    };
  }, []);
  const uischema = useMemo6(() => {
    const delayElements = [
      {
        type: "Control",
        scope: "#/properties/delayType",
        options: {
          enumLabels: {
            "fixed": "Fixed Duration",
            "dynamic": "From Variable",
            "until": "Until Time"
          }
        }
      }
    ];
    if (formData.delayType === "fixed") {
      delayElements.push(
        { type: "Control", scope: "#/properties/delayMinutes" },
        { type: "Control", scope: "#/properties/delaySeconds" },
        { type: "Control", scope: "#/properties/delayMs" }
      );
    } else if (formData.delayType === "dynamic") {
      delayElements.push({
        type: "Control",
        scope: "#/properties/delayVariable",
        options: { placeholder: "{{ctx.waitTime}} (in milliseconds)" }
      });
    } else if (formData.delayType === "until") {
      delayElements.push({
        type: "Control",
        scope: "#/properties/untilTime",
        options: { placeholder: "2024-12-31T23:59:59Z or {{ctx.targetTime}}" }
      });
    }
    return {
      type: "Categorization",
      elements: [
        {
          type: "Category",
          label: "General",
          elements: [
            {
              type: "Control",
              scope: "#/properties/title",
              options: { placeholder: "Enter node title" }
            },
            {
              type: "Control",
              scope: "#/properties/description",
              options: { placeholder: "Describe this delay...", multi: true, rows: 2 }
            }
          ]
        },
        {
          type: "Category",
          label: "Delay Config",
          elements: delayElements
        },
        {
          type: "Category",
          label: "Advanced",
          elements: [
            { type: "Control", scope: "#/properties/isDisabled" }
          ]
        }
      ]
    };
  }, [formData.delayType]);
  const handleFormChange = useCallback6(({ data: newData }) => {
    setFormData(newData);
  }, []);
  const handleSave = useCallback6(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ React7.createElement("div", { className: "w-full" }, /* @__PURE__ */ React7.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React7.createElement(
    JsonForms5,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React7.createElement("div", { className: "p-2.5 bg-brand-dark border border-brand-border rounded-sm text-[10px] text-brand-text-primary space-y-2" }, /* @__PURE__ */ React7.createElement("div", { className: "font-semibold text-brand-text-primary text-xs" }, "\u{1F4D8} Delay Types"), /* @__PURE__ */ React7.createElement("div", null, /* @__PURE__ */ React7.createElement("span", { className: "font-medium text-brand-text-primary" }, "Fixed Duration:"), /* @__PURE__ */ React7.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary" }, "Set exact wait time using minutes, seconds, and milliseconds.")), /* @__PURE__ */ React7.createElement("div", null, /* @__PURE__ */ React7.createElement("span", { className: "font-medium text-brand-text-primary" }, "From Variable:"), /* @__PURE__ */ React7.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary font-mono text-[9px]" }, /* @__PURE__ */ React7.createElement("code", { className: "bg-brand-black px-1 rounded-sm" }, "{{ctx.waitTime}}"), " \u2192 value in milliseconds")), /* @__PURE__ */ React7.createElement("div", { className: "text-green-600 bg-green-50 border border-green-800 rounded-sm p-1.5 mt-2" }, /* @__PURE__ */ React7.createElement("strong", null, "\u2713 Non-blocking:"), " Delay uses queue scheduling. Workflow resources are released during wait.")), /* @__PURE__ */ React7.createElement(
    Button6,
    {
      type: "button",
      size: "sm",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded-sm hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    "Save"
  )));
};
var DelayNode = memo6(({ data, isConnectable }) => {
  const { strings } = useWorkflowNodes();
  const isDisabled = data?.isDisabled ?? false;
  const delayType = data?.delayType || "fixed";
  const getDelayDisplay = () => {
    if (delayType === "dynamic") {
      return data?.delayVariable || "{{ctx.delay}}";
    }
    if (delayType === "until") {
      const time = data?.untilTime || "";
      return time.length > 20 ? time.substring(0, 20) + "..." : time || "until time";
    }
    const mins = data?.delayMinutes || 0;
    const secs = data?.delaySeconds || 0;
    const ms = data?.delayMs || 0;
    const parts = [];
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0) parts.push(`${secs}s`);
    if (ms > 0) parts.push(`${ms}ms`);
    return parts.length > 0 ? parts.join(" ") : "0s";
  };
  return /* @__PURE__ */ React7.createElement("div", { className: `
      bg-brand-black border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled ? "border-brand-border opacity-50" : "border-brand-border hover:border-amber-400 hover:shadow-md"}
    ` }, /* @__PURE__ */ React7.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React7.createElement(
    "div",
    {
      style: {
        borderTopLeftRadius: "0.25rem",
        borderBottomLeftRadius: "0.25rem"
      },
      className: `
          flex flex-col items-center justify-center px-3 py-3 border-r
          ${isDisabled ? "bg-brand-dark border-brand-border" : "bg-amber-950/40 border-amber-100"}
        `
    },
    /* @__PURE__ */ React7.createElement(Clock2, { className: `w-5 h-5 ${isDisabled ? "text-brand-text-primary" : "text-amber-500"}` })
  ), /* @__PURE__ */ React7.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React7.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React7.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-brand-text-primary line-through" : "text-brand-text-primary"}` }, data?.title || "Delay"), isDisabled && /* @__PURE__ */ React7.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm border border-orange-800" }, /* @__PURE__ */ React7.createElement(Ban5, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ React7.createElement("div", { className: `text-[10px] font-mono mt-0.5 ${isDisabled ? "text-brand-text-primary" : "text-brand-text-primary"}` }, "wait ", getDelayDisplay())), /* @__PURE__ */ React7.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-brand-border" }, /* @__PURE__ */ React7.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-brand-black" : "bg-amber-400"}`, title: "After Delay" }))), /* @__PURE__ */ React7.createElement(
    Handle6,
    {
      type: "target",
      position: Position6.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#f59e0b",
        border: "none",
        top: "-5px"
      }
    }
  ), /* @__PURE__ */ React7.createElement(
    Handle6,
    {
      type: "source",
      position: Position6.Bottom,
      id: "output",
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#f59e0b",
        border: "none",
        bottom: "-5px"
      }
    }
  ));
});

// src/nodes/endNode.jsx
import React8, { memo as memo7, useState as useState7, useEffect as useEffect7, useMemo as useMemo7, useCallback as useCallback7 } from "react";
import { Handle as Handle7, Position as Position7 } from "reactflow";
import { JsonForms as JsonForms6 } from "@jsonforms/react";
import { Button as Button7, Input as Input2 } from "@jet-admin/ui";
import { Square, Check, X, AlertTriangle, Plus as Plus2, Trash2 as Trash22, ChevronLeft } from "lucide-react";
var END_STATUS = {
  SUCCESS: "success",
  FAILURE: "failure",
  CANCELLED: "cancelled"
};
var OutputParameterEditor = ({ parameters, onChange, availableVariables }) => {
  const addParameter = () => {
    const newParam = {
      id: `output_${Date.now()}`,
      name: `output${parameters.length + 1}`,
      sourceVariable: "",
      description: ""
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
  return /* @__PURE__ */ React8.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React8.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React8.createElement("label", { className: "text-xs font-medium text-brand-text-primary" }, "Output Parameters"), /* @__PURE__ */ React8.createElement(
    Button7,
    {
      type: "button",
      onClick: addParameter,
      className: "flex items-center gap-1 px-2 py-1 text-xs bg-brand-black text-[#646cff] hover:bg-[#646cff]/10 rounded-sm transition-colors border border-brand-border"
    },
    /* @__PURE__ */ React8.createElement(Plus2, { className: "w-2.5 h-2.5" }),
    "Add Output"
  )), /* @__PURE__ */ React8.createElement("p", { className: "text-[10px] text-brand-text-primary" }, "Define outputs that will be returned when the workflow completes."), parameters.length === 0 ? /* @__PURE__ */ React8.createElement("div", { className: "text-xs text-brand-text-primary italic py-3 text-center border border-dashed border-brand-border rounded-sm" }, "No output parameters defined. Workflow will complete with no output.") : /* @__PURE__ */ React8.createElement("div", { className: "space-y-2" }, parameters.map((param, index) => /* @__PURE__ */ React8.createElement(
    "div",
    {
      key: param.id,
      className: "border border-brand-border rounded-sm p-2 bg-brand-dark"
    },
    /* @__PURE__ */ React8.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React8.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React8.createElement(ChevronLeft, { className: "w-3 h-3 text-red-500" }), /* @__PURE__ */ React8.createElement(
      Input2,
      {
        type: "text",
        value: param.name,
        onChange: (e) => updateParameter(index, "name", e.target.value.replace(/[^a-zA-Z0-9_]/g, "")),
        className: "text-xs font-mono font-medium text-brand-text-primary bg-brand-black border border-brand-border rounded-sm px-2 py-1 w-28 focus:outline-none focus:border-[#646cff]",
        placeholder: "outputName"
      }
    )), /* @__PURE__ */ React8.createElement(
      Button7,
      {
        type: "button",
        onClick: () => removeParameter(index),
        className: "p-1 bg-brand-black text-brand-text-primary hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors",
        title: "Remove output"
      },
      /* @__PURE__ */ React8.createElement(Trash22, { className: "w-3 h-3" })
    )),
    /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("label", { className: "text-[10px] text-brand-text-primary" }, "Source Variable"), /* @__PURE__ */ React8.createElement(
      Input2,
      {
        type: "text",
        value: param.sourceVariable,
        onChange: (e) => updateParameter(index, "sourceVariable", e.target.value),
        placeholder: "{{ctx.result}} or a literal value",
        className: "w-full text-xs text-brand-text-primary p-1.5 border border-brand-border rounded-sm font-mono bg-brand-black focus:outline-none focus:border-[#646cff]"
      }
    ), availableVariables.length > 0 && /* @__PURE__ */ React8.createElement("p", { className: "text-[9px] text-brand-text-primary mt-0.5" }, "Available: ", availableVariables.slice(0, 5).map((v) => `ctx.${v.variable}`).join(", "), availableVariables.length > 5 && "...")),
    /* @__PURE__ */ React8.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React8.createElement("label", { className: "text-[10px] text-brand-text-primary" }, "Description"), /* @__PURE__ */ React8.createElement(
      Input2,
      {
        type: "text",
        value: param.description,
        onChange: (e) => updateParameter(index, "description", e.target.value),
        placeholder: "What this output represents",
        className: "w-full text-xs text-brand-text-primary p-1.5 border border-brand-border rounded-sm bg-brand-black focus:outline-none focus:border-[#646cff]"
      }
    ))
  ))));
};
var EndNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
  const [formData, setFormData] = useState7({
    title: data?.title || "End",
    description: data?.description || "",
    status: data?.status || END_STATUS.SUCCESS,
    outputParameters: data?.outputParameters || []
  });
  useEffect7(() => {
    if (data) {
      setFormData({
        title: data.title || "End",
        description: data.description || "",
        status: data.status || END_STATUS.SUCCESS,
        outputParameters: data.outputParameters || []
      });
    }
  }, [data]);
  const availableVariables = useMemo7(() => {
    if (!workflowNodes) return [];
    return workflowNodes.filter((n) => n.id !== nodeId && n.data?.outputVariable).map((n) => ({
      nodeId: n.id,
      nodeTitle: n.data?.title || n.type,
      variable: n.data.outputVariable
    }));
  }, [workflowNodes, nodeId]);
  const schema = useMemo7(() => {
    return {
      type: "object",
      properties: {
        title: {
          type: "string",
          title: "Node Title"
        },
        description: {
          type: "string",
          title: "Description"
        },
        status: {
          type: "string",
          title: "Completion Status",
          enum: Object.values(END_STATUS)
        }
      }
    };
  }, []);
  const uischema = useMemo7(() => {
    return {
      type: "VerticalLayout",
      elements: [
        {
          type: "Control",
          scope: "#/properties/title",
          options: { placeholder: "Enter node title" }
        },
        {
          type: "Control",
          scope: "#/properties/description",
          options: { placeholder: "Describe this end point...", multi: true, rows: 2 }
        },
        {
          type: "Control",
          scope: "#/properties/status",
          options: {
            enumLabels: {
              [END_STATUS.SUCCESS]: "\u2713 Success",
              [END_STATUS.FAILURE]: "\u2717 Failure",
              [END_STATUS.CANCELLED]: "\u26A0 Cancelled"
            }
          }
        }
      ]
    };
  }, []);
  const handleFormChange = useCallback7(({ data: newData }) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);
  const handleParametersChange = useCallback7((newParams) => {
    setFormData((prev) => ({ ...prev, outputParameters: newParams }));
  }, []);
  const handleSave = useCallback7(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ React8.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ React8.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React8.createElement(
    JsonForms6,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React8.createElement("div", { className: "border-t border-brand-border pt-4" }, /* @__PURE__ */ React8.createElement(
    OutputParameterEditor,
    {
      parameters: formData.outputParameters,
      onChange: handleParametersChange,
      availableVariables
    }
  )), /* @__PURE__ */ React8.createElement("div", { className: "p-2.5 bg-brand-dark border border-brand-border rounded-sm text-[10px] text-brand-text-primary space-y-2" }, /* @__PURE__ */ React8.createElement("div", { className: "font-semibold text-brand-text-primary text-xs" }, "\u{1F4D8} Workflow Output"), /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("span", { className: "font-medium text-brand-text-primary" }, "Source Variable Format:"), /* @__PURE__ */ React8.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("code", { className: "bg-brand-black px-1 rounded-sm" }, "{{ctx.queryResult}}"), " \u2192 from previous node"), /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("code", { className: "bg-brand-black px-1 rounded-sm" }, "{{ctx.processedData}}"), " \u2192 from script node"))), /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("span", { className: "font-medium text-brand-text-primary" }, "Completion Status:"), /* @__PURE__ */ React8.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary" }, /* @__PURE__ */ React8.createElement("strong", null, "Success:"), " Normal completion \u2022 ", /* @__PURE__ */ React8.createElement("strong", null, "Failure:"), " Ended with error \u2022 ", /* @__PURE__ */ React8.createElement("strong", null, "Cancelled:"), " Manual stop")), /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("span", { className: "font-medium text-brand-text-primary" }, "Multiple End Nodes:"), /* @__PURE__ */ React8.createElement("div", { className: "ml-3 mt-0.5 text-brand-text-primary" }, "You can have multiple End nodes for different outcomes (e.g., success/failure branches)."))), /* @__PURE__ */ React8.createElement(
    Button7,
    {
      type: "button",
      size: "sm",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded-sm hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    "Save"
  )));
};
var EndNode = memo7(({ id, data, isConnectable }) => {
  const { strings, nodeExecutionStatus } = useWorkflowNodes();
  const executionStatus = nodeExecutionStatus?.[id] || "idle";
  const status = data?.status || END_STATUS.SUCCESS;
  const outputParams = data?.outputParameters || [];
  const outputCount = outputParams.length;
  const getStatusConfig = () => {
    switch (status) {
      case END_STATUS.SUCCESS:
        return {
          color: "green",
          bgColor: "bg-green-950/40",
          borderColor: "border-green-800",
          textColor: "text-green-500",
          hoverBorder: "hover:border-green-400",
          handleColor: "#22c55e",
          icon: Check,
          label: "Success"
        };
      case END_STATUS.FAILURE:
        return {
          color: "red",
          bgColor: "bg-red-950/40",
          borderColor: "border-red-800",
          textColor: "text-red-500",
          hoverBorder: "hover:border-red-400",
          handleColor: "#ef4444",
          icon: X,
          label: "Failure"
        };
      case END_STATUS.CANCELLED:
        return {
          color: "amber",
          bgColor: "bg-amber-950/40",
          borderColor: "border-amber-100",
          textColor: "text-amber-500",
          hoverBorder: "hover:border-amber-400",
          handleColor: "#f59e0b",
          icon: AlertTriangle,
          label: "Cancelled"
        };
      default:
        return {
          color: "slate",
          bgColor: "bg-brand-dark",
          borderColor: "border-brand-border",
          textColor: "text-brand-text-primary",
          hoverBorder: "hover:border-brand-border",
          handleColor: "#94a3b8",
          icon: Square,
          label: "End"
        };
    }
  };
  const getExecutionStatusStyles = () => {
    switch (executionStatus) {
      case "running":
        return "border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse";
      case "completed":
        return "border-green-400 ring-2 ring-green-300 ring-opacity-50";
      case "failed":
        return "border-red-400 ring-2 ring-red-300 ring-opacity-50";
      case "skipped":
        return "border-orange-300 opacity-60";
      default:
        return "border-brand-border";
    }
  };
  const ExecutionIndicator = () => {
    if (executionStatus === "running") {
      return /* @__PURE__ */ React8.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10" }, /* @__PURE__ */ React8.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React8.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" })));
    }
    if (executionStatus === "completed") {
      return /* @__PURE__ */ React8.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React8.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React8.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    }
    if (executionStatus === "failed") {
      return /* @__PURE__ */ React8.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React8.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React8.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    }
    return null;
  };
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  return /* @__PURE__ */ React8.createElement("div", { className: `
      relative bg-brand-black border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${getExecutionStatusStyles()} ${statusConfig.hoverBorder} hover:shadow-md
    ` }, /* @__PURE__ */ React8.createElement(ExecutionIndicator, null), /* @__PURE__ */ React8.createElement(
    Handle7,
    {
      type: "target",
      position: Position7.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: statusConfig.handleColor,
        border: "none",
        top: "-5px"
      }
    }
  ), /* @__PURE__ */ React8.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React8.createElement(
    "div",
    {
      style: {
        borderTopLeftRadius: "0.25rem",
        borderBottomLeftRadius: "0.25rem"
      },
      className: `
            flex flex-col items-center justify-center px-3 py-3 border-r
            ${executionStatus === "running" ? "bg-blue-950/40 border-blue-800" : executionStatus === "completed" ? "bg-green-950/40 border-green-800" : executionStatus === "failed" ? "bg-red-950/40 border-red-800" : `${statusConfig.bgColor} ${statusConfig.borderColor}`}
          `
    },
    /* @__PURE__ */ React8.createElement(StatusIcon, { className: `w-5 h-5 ${executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : statusConfig.textColor}` })
  ), /* @__PURE__ */ React8.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React8.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React8.createElement("span", { className: "text-xs font-semibold truncate text-brand-text-primary" }, data?.title || "End"), /* @__PURE__ */ React8.createElement("span", { className: `text-xs font-medium px-1.5 py-0.5 rounded-sm border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}` }, statusConfig.label)), /* @__PURE__ */ React8.createElement("div", { className: "text-[10px] mt-0.5 text-brand-text-primary" }, outputCount === 0 ? "No outputs defined" : `${outputCount} output${outputCount !== 1 ? "s" : ""}: ${outputParams.slice(0, 3).map((p) => p.name).join(", ")}${outputCount > 3 ? "..." : ""}`)), /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-brand-border" }, /* @__PURE__ */ React8.createElement("div", { className: `w-2 h-2 rounded-full`, style: { backgroundColor: statusConfig.handleColor }, title: statusConfig.label }))));
});

// src/map.js
import React11 from "react";

// src/nodes/dataCollectionNode.jsx
import React10, { memo as memo8, useState as useState8, useEffect as useEffect8, useCallback as useCallback8, useMemo as useMemo8 } from "react";
import { Handle as Handle8, Position as Position8 } from "reactflow";
import { v4 as uuidv4 } from "uuid";

// src/StatusIndicator.jsx
import React9 from "react";
import { RefreshCw as RefreshCw3 } from "lucide-react";
var StatusIndicator = ({ executionStatus }) => {
  if (executionStatus === "running") {
    return /* @__PURE__ */ React9.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10" }, /* @__PURE__ */ React9.createElement(RefreshCw3, { className: "w-3 h-3 text-white" }));
  }
  if (executionStatus === "completed") {
    return /* @__PURE__ */ React9.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React9.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React9.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
  }
  if (executionStatus === "failed") {
    return /* @__PURE__ */ React9.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React9.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React9.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
  }
  return null;
};
var getStatusStyles = (executionStatus, defaultHoverColor = "blue-400") => {
  switch (executionStatus) {
    case "running":
      return "border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse";
    case "completed":
      return "border-green-400 ring-2 ring-green-300 ring-opacity-50";
    case "failed":
      return "border-red-400 ring-2 ring-red-300 ring-opacity-50";
    case "skipped":
      return "border-orange-300 opacity-60";
    default:
      return `border-brand-border hover:border-${defaultHoverColor} hover:shadow-md`;
  }
};
var getIconColor = (executionStatus, defaultColor) => {
  switch (executionStatus) {
    case "running":
      return "text-blue-600";
    case "completed":
      return "text-green-600";
    case "failed":
      return "text-red-600";
    default:
      return defaultColor;
  }
};
var getStatusBgColor = (executionStatus, defaultBg) => {
  switch (executionStatus) {
    case "running":
      return "bg-blue-950/40 border-blue-800";
    case "completed":
      return "bg-green-950/40 border-green-800";
    case "failed":
      return "bg-red-950/40 border-red-800";
    default:
      return defaultBg;
  }
};

// src/nodes/dataCollectionNode.jsx
import { FileText, Plus as Plus3, Trash2 as Trash23, ArrowRightToLine, Ban as Ban6 } from "lucide-react";
import {
  Button as Button8,
  Input as Input3,
  Select as Select2,
  SelectContent as SelectContent2,
  SelectItem as SelectItem2,
  SelectTrigger as SelectTrigger2,
  SelectValue as SelectValue2,
  Checkbox,
  Label,
  Textarea as Textarea2
} from "@jet-admin/ui";
var FIELD_TYPES = [
  { value: "text", label: "Text", schemaType: "string" },
  { value: "textarea", label: "Long text", schemaType: "string" },
  { value: "number", label: "Number", schemaType: "number" },
  { value: "boolean", label: "Checkbox", schemaType: "boolean" },
  { value: "select", label: "Dropdown", schemaType: "string" }
];
var COLLECTION_TYPES = [
  { value: "form", label: "UI Form" },
  { value: "api", label: "API call (coming soon)", disabled: true }
];
function buildSchemas(fields) {
  const properties = {};
  const required = [];
  const elements = [];
  for (const f of fields) {
    if (!f.key) continue;
    const ft = FIELD_TYPES.find((t) => t.value === f.fieldType) || FIELD_TYPES[0];
    const schemaProp = { type: ft.schemaType, title: f.label || f.key };
    if (f.fieldType === "select" && f.options) {
      schemaProp.enum = f.options.split(",").map((o) => o.trim()).filter(Boolean);
    }
    properties[f.key] = schemaProp;
    if (f.required) required.push(f.key);
    const uiControl = { type: "Control", scope: `#/properties/${f.key}` };
    if (f.fieldType === "textarea") uiControl.options = { multi: true, rows: 3 };
    if (f.placeholder) uiControl.options = { ...uiControl.options ?? {}, placeholder: f.placeholder };
    elements.push(uiControl);
  }
  return {
    formSchema: {
      type: "object",
      properties,
      ...required.length ? { required } : {}
    },
    formUischema: { type: "VerticalLayout", elements }
  };
}
var makeField = () => ({
  id: uuidv4(),
  key: "",
  label: "",
  fieldType: "text",
  required: false,
  placeholder: "",
  options: ""
  // comma-separated, for select type only
});
var DataCollectionNodeConfigurator = ({ data, onChange, nodeId }) => {
  const [title, setTitle] = useState8(data?.title ?? "Input required");
  const [description, setDescription] = useState8(data?.description ?? "");
  const [collectionType, setCollectionType] = useState8(data?.collectionType ?? "form");
  const [fields, setFields] = useState8(data?.fields ?? [makeField()]);
  const [outputVariable, setOutputVariable] = useState8(data?.outputVariable ?? "collectedData");
  const [expiryMinutes, setExpiryMinutes] = useState8(data?.expiryMinutes ?? 60);
  useEffect8(() => {
    if (!data) return;
    setTitle(data.title ?? "Input required");
    setDescription(data.description ?? "");
    setCollectionType(data.collectionType ?? "form");
    setFields(data.fields ?? [makeField()]);
    setOutputVariable(data.outputVariable ?? "collectedData");
    setExpiryMinutes(data.expiryMinutes ?? 60);
  }, [data]);
  const addField = useCallback8(() => setFields((prev) => [...prev, makeField()]), []);
  const removeField = useCallback8((id) => setFields((prev) => prev.filter((f) => f.id !== id)), []);
  const updateField = useCallback8((id, patch) => setFields((prev) => prev.map((f) => f.id === id ? { ...f, ...patch } : f)), []);
  const handleSave = useCallback8(() => {
    const { formSchema, formUischema } = buildSchemas(fields);
    onChange({
      title,
      description,
      collectionType,
      fields,
      formSchema,
      formUischema,
      outputVariable,
      expiryMinutes: Number(expiryMinutes) || 60
    });
  }, [title, description, collectionType, fields, outputVariable, expiryMinutes, onChange]);
  return /* @__PURE__ */ React10.createElement("div", { className: "w-full space-y-5" }, /* @__PURE__ */ React10.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground" }, "Modal title"), /* @__PURE__ */ React10.createElement(
    Input3,
    {
      value: title,
      onChange: (e) => setTitle(e.target.value),
      placeholder: "Input required",
      className: "h-8 text-sm"
    }
  )), /* @__PURE__ */ React10.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground" }, "Instructions"), /* @__PURE__ */ React10.createElement(
    Textarea2,
    {
      value: description,
      onChange: (e) => setDescription(e.target.value),
      rows: 2,
      placeholder: "Tell the user what to fill in...",
      className: "w-full text-xs text-foreground border border-border rounded-md px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-brand-dark transition-colors"
    }
  )), /* @__PURE__ */ React10.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground" }, "Collection method"), /* @__PURE__ */ React10.createElement(Select2, { value: collectionType, onValueChange: setCollectionType }, /* @__PURE__ */ React10.createElement(SelectTrigger2, { className: "h-8 text-xs" }, /* @__PURE__ */ React10.createElement(SelectValue2, null)), /* @__PURE__ */ React10.createElement(SelectContent2, null, COLLECTION_TYPES.map((t) => /* @__PURE__ */ React10.createElement(SelectItem2, { key: t.value, value: t.value, disabled: t.disabled, className: "text-xs" }, t.label))))), collectionType === "form" && /* @__PURE__ */ React10.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React10.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground" }, "Form fields"), /* @__PURE__ */ React10.createElement(
    Button8,
    {
      type: "button",
      variant: "ghost",
      size: "sm",
      onClick: addField,
      className: "h-6 px-2 text-[10px] text-primary hover:bg-primary/10"
    },
    /* @__PURE__ */ React10.createElement(Plus3, { className: "w-2.5 h-2.5 mr-1" }),
    " Add field"
  )), fields.length === 0 && /* @__PURE__ */ React10.createElement("p", { className: "text-[10px] text-muted-foreground italic" }, "No fields yet."), fields.map((field, idx) => /* @__PURE__ */ React10.createElement(
    "div",
    {
      key: field.id,
      className: "rounded-md border border-border p-3 bg-muted/20 space-y-2"
    },
    /* @__PURE__ */ React10.createElement("div", { className: "flex gap-2 items-center" }, /* @__PURE__ */ React10.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-[9px] text-muted-foreground" }, "Key"), /* @__PURE__ */ React10.createElement(
      Input3,
      {
        value: field.key,
        onChange: (e) => updateField(field.id, { key: e.target.value.replace(/\s/g, "_") }),
        placeholder: "field_name",
        className: "h-7 text-xs font-mono"
      }
    )), /* @__PURE__ */ React10.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-[9px] text-muted-foreground" }, "Label"), /* @__PURE__ */ React10.createElement(
      Input3,
      {
        value: field.label,
        onChange: (e) => updateField(field.id, { label: e.target.value }),
        placeholder: "Display label",
        className: "h-7 text-xs"
      }
    )), /* @__PURE__ */ React10.createElement(
      Button8,
      {
        type: "button",
        variant: "destructive-ghost",
        size: "sm",
        square: true,
        onClick: () => removeField(field.id),
        className: "h-7 w-7 mt-4 flex-shrink-0",
        disabled: fields.length === 1
      },
      /* @__PURE__ */ React10.createElement(Trash23, { className: "w-2.5 h-2.5" })
    )),
    /* @__PURE__ */ React10.createElement("div", { className: "flex gap-2 items-center" }, /* @__PURE__ */ React10.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-[9px] text-muted-foreground" }, "Type"), /* @__PURE__ */ React10.createElement(
      Select2,
      {
        value: field.fieldType,
        onValueChange: (val) => updateField(field.id, { fieldType: val })
      },
      /* @__PURE__ */ React10.createElement(SelectTrigger2, { className: "h-7 text-xs" }, /* @__PURE__ */ React10.createElement(SelectValue2, null)),
      /* @__PURE__ */ React10.createElement(SelectContent2, null, FIELD_TYPES.map((t) => /* @__PURE__ */ React10.createElement(SelectItem2, { key: t.value, value: t.value, className: "text-xs" }, t.label)))
    )), /* @__PURE__ */ React10.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-[9px] text-muted-foreground" }, "Placeholder"), /* @__PURE__ */ React10.createElement(
      Input3,
      {
        value: field.placeholder,
        onChange: (e) => updateField(field.id, { placeholder: e.target.value }),
        placeholder: "Optional hint",
        className: "h-7 text-xs"
      }
    )), /* @__PURE__ */ React10.createElement("label", { className: "flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0 mt-4" }, /* @__PURE__ */ React10.createElement(
      Checkbox,
      {
        checked: field.required,
        onCheckedChange: (v) => updateField(field.id, { required: v })
      }
    ), "Req.")),
    field.fieldType === "select" && /* @__PURE__ */ React10.createElement("div", null, /* @__PURE__ */ React10.createElement(Label, { className: "text-[9px] text-muted-foreground" }, "Options ", /* @__PURE__ */ React10.createElement("span", { className: "text-muted-foreground/50" }, "(comma-separated)")), /* @__PURE__ */ React10.createElement(
      Input3,
      {
        value: field.options,
        onChange: (e) => updateField(field.id, { options: e.target.value }),
        placeholder: "Option A, Option B, Option C",
        className: "h-7 text-xs"
      }
    ))
  ))), /* @__PURE__ */ React10.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground" }, "Output variable"), /* @__PURE__ */ React10.createElement(
    Input3,
    {
      value: outputVariable,
      onChange: (e) => setOutputVariable(e.target.value.replace(/\s/g, "")),
      placeholder: "collectedData",
      className: "h-8 text-xs font-mono"
    }
  ), /* @__PURE__ */ React10.createElement("p", { className: "text-[10px] text-muted-foreground" }, "Access via", " ", /* @__PURE__ */ React10.createElement("code", { className: "bg-muted px-1 rounded-sm font-mono" }, `{{ctx.${outputVariable || "collectedData"}}}`))), /* @__PURE__ */ React10.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground" }, "Expiry (minutes) \u2014 0 = never"), /* @__PURE__ */ React10.createElement(
    Input3,
    {
      type: "number",
      value: expiryMinutes,
      min: 0,
      onChange: (e) => setExpiryMinutes(e.target.value),
      className: "h-8 text-xs w-28"
    }
  )), /* @__PURE__ */ React10.createElement("div", { className: "rounded-md border border-primary/20 bg-primary/5 p-3 text-[10px] text-primary/80 space-y-1" }, /* @__PURE__ */ React10.createElement("div", { className: "font-semibold text-xs text-primary" }, "Suspend & resume"), /* @__PURE__ */ React10.createElement("div", null, "When this node runs, the workflow ", /* @__PURE__ */ React10.createElement("strong", null, "pauses"), " and a form modal appears in the execution panel. The DAG only advances once the user clicks ", /* @__PURE__ */ React10.createElement("em", null, "Submit & continue"), "."), /* @__PURE__ */ React10.createElement("div", null, "Field values land in", " ", /* @__PURE__ */ React10.createElement("code", { className: "bg-brand-dark px-1 rounded-sm border border-border font-mono" }, `ctx.${outputVariable || "collectedData"}`), " ", "as a plain object.")), /* @__PURE__ */ React10.createElement(Button8, { type: "button", size: "sm", onClick: handleSave, className: "w-full" }, "Save"));
};
var DataCollectionNode = memo8(({ id, data, isConnectable }) => {
  const { nodeExecutionStatus } = useWorkflowNodes();
  const executionStatus = nodeExecutionStatus?.[id] || "idle";
  const isDisabled = data?.isDisabled ?? false;
  const fieldCount = (data?.fields ?? []).filter((f) => f.key).length;
  const isSuspended = executionStatus === "suspended";
  const borderClass = isSuspended ? "border-amber-400 ring-2 ring-amber-300 ring-opacity-60 animate-pulse" : getStatusStyles(executionStatus, "violet-400");
  return /* @__PURE__ */ React10.createElement("div", { className: `
      relative bg-brand-black border rounded
      min-w-[300px] max-w-[380px]
      transition-all duration-150
      ${isDisabled ? "border-brand-border opacity-50" : borderClass}
    ` }, /* @__PURE__ */ React10.createElement(StatusIndicator, { executionStatus }), /* @__PURE__ */ React10.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React10.createElement(
    "div",
    {
      style: { borderTopLeftRadius: "0.25rem", borderBottomLeftRadius: "0.25rem" },
      className: `
            flex flex-col items-center justify-center px-3 py-3 border-r
            ${isDisabled ? "bg-brand-dark border-brand-border" : isSuspended ? "bg-amber-100 border-amber-800" : executionStatus === "running" ? "bg-blue-950/40 border-blue-800" : executionStatus === "completed" ? "bg-green-950/40 border-green-800" : executionStatus === "failed" ? "bg-red-950/40 border-red-800" : "bg-violet-50 border-violet-100"}
          `
    },
    isSuspended ? /* @__PURE__ */ React10.createElement(ArrowRightToLine, { className: "w-5 h-5 text-amber-600" }) : /* @__PURE__ */ React10.createElement(FileText, { className: `w-5 h-5 ${isDisabled ? "text-brand-text-primary" : executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-violet-500"}` })
  ), /* @__PURE__ */ React10.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React10.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React10.createElement("span", { className: `text-xs font-semibold truncate
              ${isDisabled ? "text-brand-text-primary line-through" : "text-brand-text-primary"}` }, data?.title || "Data collection"), isSuspended && /* @__PURE__ */ React10.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm border border-amber-800 whitespace-nowrap" }, "\u23F8 Waiting"), isDisabled && !isSuspended && /* @__PURE__ */ React10.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm border border-orange-800" }, /* @__PURE__ */ React10.createElement(Ban6, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ React10.createElement("div", { className: `text-[10px] mt-0.5 ${isDisabled ? "text-brand-text-primary" : "text-brand-text-primary"}` }, fieldCount > 0 ? `${fieldCount} field${fieldCount !== 1 ? "s" : ""} \xB7 saves to ctx.${data?.outputVariable || "collectedData"}` : "No fields defined yet")), /* @__PURE__ */ React10.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-brand-border" }, /* @__PURE__ */ React10.createElement(
    "div",
    {
      className: `w-2 h-2 rounded-full mb-1
            ${isSuspended ? "bg-amber-400 animate-pulse" : isDisabled ? "bg-brand-black" : "bg-violet-400"}`,
      title: "Output (after submission)"
    }
  ), /* @__PURE__ */ React10.createElement(
    "div",
    {
      className: `w-2 h-2 rounded-full ${isDisabled ? "bg-brand-black" : "bg-red-400"}`,
      title: "Error"
    }
  ))), /* @__PURE__ */ React10.createElement(
    Handle8,
    {
      type: "target",
      position: Position8.Top,
      isConnectable,
      style: { width: 10, height: 10, backgroundColor: isDisabled ? "#cbd5e1" : "#8b5cf6", border: "none", top: -5 }
    }
  ), /* @__PURE__ */ React10.createElement(
    Handle8,
    {
      type: "source",
      position: Position8.Bottom,
      id: "output",
      isConnectable,
      style: { left: "35%", width: 10, height: 10, backgroundColor: isDisabled ? "#cbd5e1" : "#8b5cf6", border: "none", bottom: -5 }
    }
  ), /* @__PURE__ */ React10.createElement(
    Handle8,
    {
      type: "source",
      position: Position8.Bottom,
      id: "error",
      isConnectable,
      style: { left: "65%", width: 10, height: 10, backgroundColor: isDisabled ? "#cbd5e1" : "#ef4444", border: "none", bottom: -5 }
    }
  ));
});

// src/map.js
var WORKFLOW_NODE_TYPES = {
  START: { value: "start", label: "Start" },
  DATA_QUERY: { value: "dataQuery", label: "Data Query" },
  CONNECTOR_PULL: { value: "connectorPull", label: "Connector Pull" },
  CONNECTOR_PUSH: { value: "connectorPush", label: "Connector Push" },
  JAVASCRIPT: { value: "javascript", label: "Javascript" },
  CONDITION: { value: "condition", label: "Condition" },
  LOOP: { value: "loop", label: "Loop" },
  DELAY: { value: "delay", label: "Delay" },
  END: { value: "end", label: "End" },
  DATA_COLLECTION: { value: "dataCollection", label: "Data Collection" }
};
var WORKFLOW_NODES_MAP = {
  [WORKFLOW_NODE_TYPES.DATA_COLLECTION.value]: {
    label: WORKFLOW_NODE_TYPES.DATA_COLLECTION.label,
    value: WORKFLOW_NODE_TYPES.DATA_COLLECTION.value,
    component: DataCollectionNode,
    configurator: DataCollectionNodeConfigurator,
    defaultValue: {
      title: "Input required",
      description: "",
      collectionType: "form",
      fields: [
        { id: "f1", key: "response", label: "Response", fieldType: "text", required: true, placeholder: "", options: "" }
      ],
      formSchema: { type: "object", properties: { response: { type: "string", title: "Response" } }, required: ["response"] },
      formUischema: { type: "VerticalLayout", elements: [{ type: "Control", scope: "#/properties/response" }] },
      outputVariable: "collectedData",
      expiryMinutes: 60,
      isDisabled: false
    }
  },
  [WORKFLOW_NODE_TYPES.DATA_QUERY.value]: {
    label: WORKFLOW_NODE_TYPES.DATA_QUERY.label,
    value: WORKFLOW_NODE_TYPES.DATA_QUERY.value,
    component: DataQueryNode,
    configurator: DataQueryNodeConfigurator,
    defaultValue: {
      title: "Data Query",
      description: "",
      dataQueryID: "",
      args: {},
      outputVariable: "queryResult",
      timeoutSeconds: 300,
      retryLimit: 0,
      retryDelaySeconds: 5,
      errorHandling: "fail_workflow",
      isDisabled: false
    },
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Node Title" },
        description: { type: "string", title: "Description" },
        dataQueryID: { type: "string", title: "Data Query" },
        // Schema populated dynamically in DataQueryNodeConfigurator
        outputVariable: {
          type: "string",
          title: "Output Variable Name",
          pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$",
          default: "queryResult"
        },
        timeoutSeconds: {
          type: "integer",
          title: "Timeout (seconds)",
          minimum: 1,
          maximum: 3600,
          default: 300
        },
        retryLimit: {
          type: "integer",
          title: "Retry Attempts",
          minimum: 0,
          maximum: 10,
          default: 0
        },
        retryDelaySeconds: {
          type: "integer",
          title: "Retry Delay (seconds)",
          minimum: 1,
          maximum: 300,
          default: 5
        },
        errorHandling: {
          type: "string",
          title: "Error Behavior",
          enum: ["fail_workflow", "continue", "retry_then_continue", "retry_then_fail"],
          default: "fail_workflow"
        },
        isDisabled: {
          type: "boolean",
          title: "Skip this node",
          default: false
        }
        // Args added dynamically
      },
      required: ["dataQueryID"]
    },
    uischema: {
      type: "Categorization",
      elements: [
        {
          type: "Category",
          label: "General",
          elements: [
            { type: "Control", scope: "#/properties/title" },
            { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } },
            { type: "Control", scope: "#/properties/dataQueryID" }
          ]
        },
        {
          type: "Category",
          label: "Output",
          elements: [
            { type: "Control", scope: "#/properties/outputVariable" }
          ]
        },
        {
          type: "Category",
          label: "Advanced",
          elements: [
            { type: "Control", scope: "#/properties/timeoutSeconds" },
            { type: "Control", scope: "#/properties/retryLimit" },
            { type: "Control", scope: "#/properties/retryDelaySeconds" },
            { type: "Control", scope: "#/properties/errorHandling" },
            { type: "Control", scope: "#/properties/isDisabled" }
          ]
        }
      ]
    }
  },
  [WORKFLOW_NODE_TYPES.JAVASCRIPT.value]: {
    label: WORKFLOW_NODE_TYPES.JAVASCRIPT.label,
    value: WORKFLOW_NODE_TYPES.JAVASCRIPT.value,
    component: JavascriptNode,
    configurator: JavascriptNodeConfigurator,
    defaultValue: {
      title: "JavaScript",
      description: "",
      code: "// Your JavaScript code here\n// Access context: ctx.variableName\n// Return a value to store in outputVariable\nreturn true;",
      outputVariable: "scriptResult",
      timeoutSeconds: 30,
      retryLimit: 0,
      retryDelaySeconds: 5,
      errorHandling: "fail_workflow",
      isDisabled: false
    },
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Node Title" },
        description: { type: "string", title: "Description" },
        code: { type: "string", title: "JavaScript Code" },
        outputVariable: {
          type: "string",
          title: "Output Variable Name",
          pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$",
          default: "scriptResult"
        },
        timeoutSeconds: {
          type: "integer",
          title: "Timeout (seconds)",
          minimum: 1,
          maximum: 300,
          default: 30
        },
        retryLimit: {
          type: "integer",
          title: "Retry Attempts",
          minimum: 0,
          maximum: 10,
          default: 0
        },
        retryDelaySeconds: {
          type: "integer",
          title: "Retry Delay (seconds)",
          minimum: 1,
          maximum: 300,
          default: 5
        },
        errorHandling: {
          type: "string",
          title: "Error Behavior",
          enum: ["fail_workflow", "continue", "retry_then_continue", "retry_then_fail"],
          default: "fail_workflow"
        },
        isDisabled: {
          type: "boolean",
          title: "Skip this node",
          default: false
        }
      },
      required: ["code"]
    },
    uischema: {
      type: "Categorization",
      elements: [
        {
          type: "Category",
          label: "General",
          elements: [
            { type: "Control", scope: "#/properties/title" },
            { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } },
            { type: "Control", scope: "#/properties/code", options: { format: "code-javascript", multi: true, rows: 12 } }
          ]
        },
        {
          type: "Category",
          label: "Output",
          elements: [
            { type: "Control", scope: "#/properties/outputVariable" }
          ]
        },
        {
          type: "Category",
          label: "Advanced",
          elements: [
            { type: "Control", scope: "#/properties/timeoutSeconds" },
            { type: "Control", scope: "#/properties/retryLimit" },
            { type: "Control", scope: "#/properties/retryDelaySeconds" },
            { type: "Control", scope: "#/properties/errorHandling" },
            { type: "Control", scope: "#/properties/isDisabled" }
          ]
        }
      ]
    }
  },
  [WORKFLOW_NODE_TYPES.CONDITION.value]: {
    label: WORKFLOW_NODE_TYPES.CONDITION.label,
    value: WORKFLOW_NODE_TYPES.CONDITION.value,
    component: ConditionNode,
    configurator: ConditionNodeConfigurator,
    defaultValue: {
      title: "Condition",
      description: "",
      branches: [
        {
          id: "branch_1",
          name: "Branch 1",
          conditionType: "expression",
          expression: "true",
          leftOperand: "",
          rightOperand: ""
        }
      ],
      evaluationMode: "first_match",
      errorHandling: "fail_workflow",
      isDisabled: false
    },
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Node Title" },
        description: { type: "string", title: "Description" },
        branches: {
          type: "array",
          title: "Condition Branches",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string", title: "Branch Name" },
              conditionType: {
                type: "string",
                title: "Condition Type",
                enum: ["expression", "equals", "not_equals", "contains", "greater_than", "less_than", "is_empty", "is_not_empty", "regex"]
              },
              expression: { type: "string", title: "Expression" },
              leftOperand: { type: "string", title: "Left Operand" },
              rightOperand: { type: "string", title: "Right Operand" }
            }
          }
        },
        evaluationMode: {
          type: "string",
          title: "Evaluation Mode",
          enum: ["first_match", "all_matches"],
          default: "first_match"
        },
        errorHandling: {
          type: "string",
          title: "Error Behavior",
          enum: ["fail_workflow", "continue_default"],
          default: "fail_workflow"
        },
        isDisabled: {
          type: "boolean",
          title: "Skip this node",
          default: false
        }
      },
      required: ["branches"]
    },
    uischema: {
      type: "Categorization",
      elements: [
        {
          type: "Category",
          label: "General",
          elements: [
            { type: "Control", scope: "#/properties/title" },
            { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } }
          ]
        },
        {
          type: "Category",
          label: "Advanced",
          elements: [
            { type: "Control", scope: "#/properties/evaluationMode" },
            { type: "Control", scope: "#/properties/errorHandling" },
            { type: "Control", scope: "#/properties/isDisabled" }
          ]
        }
      ]
    }
  },
  [WORKFLOW_NODE_TYPES.START.value]: {
    label: WORKFLOW_NODE_TYPES.START.label,
    value: WORKFLOW_NODE_TYPES.START.value,
    component: StartNode,
    configurator: StartNodeConfigurator,
    defaultValue: {
      title: "Start",
      description: ""
      // Note: Input parameters are managed at workflow level (workflowOptions.args)
    },
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Node Title" },
        description: { type: "string", title: "Description" }
      }
    },
    uischema: {
      type: "VerticalLayout",
      elements: [
        { type: "Control", scope: "#/properties/title" },
        { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } }
      ]
    }
  },
  [WORKFLOW_NODE_TYPES.LOOP.value]: {
    label: WORKFLOW_NODE_TYPES.LOOP.label,
    value: WORKFLOW_NODE_TYPES.LOOP.value,
    component: LoopNode,
    configurator: LoopNodeConfigurator,
    defaultValue: {
      title: "Loop",
      description: "",
      sourceVariable: "",
      itemVariable: "item",
      indexVariable: "index",
      maxIterations: 1e3,
      delayBetweenItems: 0,
      errorHandling: "fail_workflow",
      isDisabled: false
    },
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Node Title" },
        description: { type: "string", title: "Description" },
        sourceVariable: { type: "string", title: "Source Array" },
        itemVariable: { type: "string", title: "Item Variable Name", pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$", default: "item" },
        indexVariable: { type: "string", title: "Index Variable Name", pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$", default: "index" },
        maxIterations: { type: "integer", title: "Max Iterations", minimum: 1, maximum: 1e5, default: 1e3 },
        delayBetweenItems: { type: "integer", title: "Delay Between Items (ms)", minimum: 0, maximum: 6e4, default: 0 },
        errorHandling: { type: "string", title: "Error Behavior", enum: ["fail_workflow", "continue", "skip_item"], default: "fail_workflow" },
        isDisabled: { type: "boolean", title: "Skip this node", default: false }
      },
      required: ["sourceVariable", "itemVariable"]
    },
    uischema: {
      type: "Categorization",
      elements: [
        {
          type: "Category",
          label: "General",
          elements: [
            { type: "Control", scope: "#/properties/title" },
            { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } }
          ]
        },
        {
          type: "Category",
          label: "Loop Config",
          elements: [
            { type: "Control", scope: "#/properties/sourceVariable" },
            { type: "Control", scope: "#/properties/itemVariable" },
            { type: "Control", scope: "#/properties/indexVariable" }
          ]
        },
        {
          type: "Category",
          label: "Advanced",
          elements: [
            { type: "Control", scope: "#/properties/maxIterations" },
            { type: "Control", scope: "#/properties/delayBetweenItems" },
            { type: "Control", scope: "#/properties/errorHandling" },
            { type: "Control", scope: "#/properties/isDisabled" }
          ]
        }
      ]
    }
  },
  [WORKFLOW_NODE_TYPES.DELAY.value]: {
    label: WORKFLOW_NODE_TYPES.DELAY.label,
    value: WORKFLOW_NODE_TYPES.DELAY.value,
    component: DelayNode,
    configurator: DelayNodeConfigurator,
    defaultValue: {
      title: "Delay",
      description: "",
      delayType: "fixed",
      delayMs: 0,
      delaySeconds: 1,
      delayMinutes: 0,
      delayVariable: "",
      untilTime: "",
      isDisabled: false
    },
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Node Title" },
        description: { type: "string", title: "Description" },
        delayType: { type: "string", title: "Delay Type", enum: ["fixed", "dynamic", "until"], default: "fixed" },
        delayMs: { type: "integer", title: "Milliseconds", minimum: 0, maximum: 999, default: 0 },
        delaySeconds: { type: "integer", title: "Seconds", minimum: 0, maximum: 59, default: 1 },
        delayMinutes: { type: "integer", title: "Minutes", minimum: 0, maximum: 1440, default: 0 },
        delayVariable: { type: "string", title: "Delay Variable" },
        untilTime: { type: "string", title: "Until Time" },
        isDisabled: { type: "boolean", title: "Skip this node", default: false }
      }
    },
    uischema: {
      type: "Categorization",
      elements: [
        {
          type: "Category",
          label: "General",
          elements: [
            { type: "Control", scope: "#/properties/title" },
            { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } }
          ]
        },
        {
          type: "Category",
          label: "Delay Config",
          elements: [
            { type: "Control", scope: "#/properties/delayType" },
            { type: "Control", scope: "#/properties/delayMinutes" },
            { type: "Control", scope: "#/properties/delaySeconds" },
            { type: "Control", scope: "#/properties/delayMs" }
          ]
        },
        {
          type: "Category",
          label: "Advanced",
          elements: [
            { type: "Control", scope: "#/properties/isDisabled" }
          ]
        }
      ]
    }
  },
  [WORKFLOW_NODE_TYPES.END.value]: {
    label: WORKFLOW_NODE_TYPES.END.label,
    value: WORKFLOW_NODE_TYPES.END.value,
    component: EndNode,
    configurator: EndNodeConfigurator,
    defaultValue: {
      title: "End",
      description: "",
      status: "success",
      outputParameters: []
    },
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Node Title" },
        description: { type: "string", title: "Description" },
        status: {
          type: "string",
          title: "Completion Status",
          enum: ["success", "failure", "cancelled"],
          default: "success"
        },
        outputParameters: {
          type: "array",
          title: "Output Parameters",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string", title: "Output Name", pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$" },
              sourceVariable: { type: "string", title: "Source Variable" },
              description: { type: "string", title: "Description" }
            }
          }
        }
      }
    },
    uischema: {
      type: "VerticalLayout",
      elements: [
        { type: "Control", scope: "#/properties/title" },
        { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } },
        { type: "Control", scope: "#/properties/status" }
      ]
    }
  }
};
export {
  ConditionNode,
  ConditionNodeConfigurator,
  DataCollectionNode,
  DataCollectionNodeConfigurator,
  DataQueryNode,
  DataQueryNodeConfigurator,
  DelayNode,
  DelayNodeConfigurator,
  ERROR_HANDLING,
  ERROR_HANDLING_OPTIONS,
  EndNode,
  EndNodeConfigurator,
  HANDLE_TYPE,
  JavascriptNode,
  JavascriptNodeConfigurator,
  LoopNode,
  LoopNodeConfigurator,
  NODE_EXECUTION_STATUS,
  StartNode,
  StartNodeConfigurator,
  StatusIndicator,
  WORKFLOW_NODES_MAP,
  WORKFLOW_NODE_TYPES,
  JetCheckboxControl as WorkflowCheckboxControl,
  JetDynamicArgsControl as WorkflowDynamicArgsControl,
  JetGroupLayout as WorkflowGroupLayout,
  WorkflowNodesProvider,
  JetNumberControl as WorkflowNumberControl,
  JetSelectControl as WorkflowSelectControl,
  JetTabLayout as WorkflowTabLayout,
  JetTextControl as WorkflowTextControl,
  JetVerticalLayout as WorkflowVerticalLayout,
  checkboxTester,
  dynamicArgsTester,
  getIconColor,
  getStatusBgColor,
  getStatusStyles,
  groupLayoutTester,
  jetFormsBaseRenderers,
  jetFormsRenderers2 as jetFormsRenderers,
  numberInputTester,
  selectInputTester,
  tabRendererTester,
  textInputTester,
  useNodeExecutionStatus,
  useWorkflowNodes,
  verticalLayoutTester,
  jetFormsRenderers as workflowNodeRenderers
};
//# sourceMappingURL=index.mjs.map
