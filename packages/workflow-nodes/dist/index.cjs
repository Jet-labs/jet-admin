var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  ConditionNode: () => ConditionNode,
  ConditionNodeConfigurator: () => ConditionNodeConfigurator,
  DataQueryNode: () => DataQueryNode,
  DataQueryNodeConfigurator: () => DataQueryNodeConfigurator,
  DelayNode: () => DelayNode,
  DelayNodeConfigurator: () => DelayNodeConfigurator,
  ERROR_HANDLING: () => ERROR_HANDLING,
  ERROR_HANDLING_OPTIONS: () => ERROR_HANDLING_OPTIONS,
  EndNode: () => EndNode,
  EndNodeConfigurator: () => EndNodeConfigurator,
  HANDLE_TYPE: () => HANDLE_TYPE,
  JavascriptNode: () => JavascriptNode,
  JavascriptNodeConfigurator: () => JavascriptNodeConfigurator,
  LoopNode: () => LoopNode,
  LoopNodeConfigurator: () => LoopNodeConfigurator,
  NODE_EXECUTION_STATUS: () => NODE_EXECUTION_STATUS,
  StartNode: () => StartNode,
  StartNodeConfigurator: () => StartNodeConfigurator,
  StatusIndicator: () => StatusIndicator,
  WORKFLOW_NODES_MAP: () => WORKFLOW_NODES_MAP,
  WORKFLOW_NODE_TYPES: () => WORKFLOW_NODE_TYPES,
  WorkflowCheckboxControl: () => import_json_forms_renderers2.JetCheckboxControl,
  WorkflowDynamicArgsControl: () => import_json_forms_renderers2.JetDynamicArgsControl,
  WorkflowGroupLayout: () => import_json_forms_renderers2.JetGroupLayout,
  WorkflowNodesProvider: () => WorkflowNodesProvider,
  WorkflowNumberControl: () => import_json_forms_renderers2.JetNumberControl,
  WorkflowSelectControl: () => import_json_forms_renderers2.JetSelectControl,
  WorkflowTabLayout: () => import_json_forms_renderers2.JetTabLayout,
  WorkflowTextControl: () => import_json_forms_renderers2.JetTextControl,
  WorkflowVerticalLayout: () => import_json_forms_renderers2.JetVerticalLayout,
  checkboxTester: () => import_json_forms_renderers2.checkboxTester,
  dynamicArgsTester: () => import_json_forms_renderers2.dynamicArgsTester,
  getIconColor: () => getIconColor,
  getStatusBgColor: () => getStatusBgColor,
  getStatusStyles: () => getStatusStyles,
  groupLayoutTester: () => import_json_forms_renderers2.groupLayoutTester,
  jetFormsBaseRenderers: () => import_json_forms_renderers2.jetFormsBaseRenderers,
  jetFormsRenderers: () => import_json_forms_renderers2.jetFormsRenderers,
  numberInputTester: () => import_json_forms_renderers2.numberInputTester,
  selectInputTester: () => import_json_forms_renderers2.selectInputTester,
  tabRendererTester: () => import_json_forms_renderers2.tabRendererTester,
  textInputTester: () => import_json_forms_renderers2.textInputTester,
  useNodeExecutionStatus: () => useNodeExecutionStatus,
  useWorkflowNodes: () => useWorkflowNodes,
  verticalLayoutTester: () => import_json_forms_renderers2.verticalLayoutTester,
  workflowNodeRenderers: () => import_json_forms_renderers.jetFormsRenderers
});
module.exports = __toCommonJS(index_exports);

// src/nodes/conditionNode.jsx
var import_react2 = __toESM(require("react"));
var import_reactflow = require("reactflow");
var import_react3 = require("@jsonforms/react");

// src/context.jsx
var import_react = __toESM(require("react"));

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
  DONE: "done",
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
var WorkflowNodesContext = (0, import_react.createContext)(null);
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
  tenantID = null,
  // Tenant ID for API calls
  onQueryTest = null
  // Callback for testing queries: (dataQueryID, argValues) => Promise<result>
}) => {
  return /* @__PURE__ */ import_react.default.createElement(WorkflowNodesContext.Provider, { value: {
    dataQueries,
    strings,
    onRefreshDataQueries,
    workflowNodes,
    workflowEdges,
    workflowInputArgs,
    nodeExecutionStatus,
    tenantID,
    onQueryTest
  } }, children);
};
var useWorkflowNodes = () => {
  const context = (0, import_react.useContext)(WorkflowNodesContext);
  if (!context) {
    throw new Error("useWorkflowNodes must be used within a WorkflowNodesProvider");
  }
  return context;
};
var useNodeExecutionStatus = (nodeId) => {
  const { nodeExecutionStatus } = useWorkflowNodes();
  return nodeExecutionStatus[nodeId] || NODE_EXECUTION_STATUS.IDLE;
};

// src/jsonFormsRenderers.jsx
var import_json_forms_renderers = require("@jet-admin/json-forms-renderers");
var import_json_forms_renderers2 = require("@jet-admin/json-forms-renderers");

// src/nodes/conditionNode.jsx
var import_tb = require("react-icons/tb");
var import_vsc = require("react-icons/vsc");
var import_fa = require("react-icons/fa");
var import_io = require("react-icons/io");
var import_ui = require("@jet-admin/ui");
var ERROR_HANDLING_OPTIONS2 = {
  FAIL_WORKFLOW: "fail_workflow",
  CONTINUE_DEFAULT: "continue_default"
};
var CONDITION_TYPES = {
  EXPRESSION: "expression",
  EQUALS: "equals",
  NOT_EQUALS: "not_equals",
  CONTAINS: "contains",
  GREATER_THAN: "greater_than",
  LESS_THAN: "less_than",
  IS_EMPTY: "is_empty",
  IS_NOT_EMPTY: "is_not_empty",
  REGEX: "regex"
};
var ConditionBranchEditor = ({ branches, onChange, workflowNodes, currentNodeId }) => {
  const addBranch = () => {
    const newBranch = {
      id: `branch_${Date.now()}`,
      name: `Branch ${branches.length + 1}`,
      conditionType: CONDITION_TYPES.EXPRESSION,
      expression: "true",
      leftOperand: "",
      rightOperand: ""
    };
    onChange([...branches, newBranch]);
  };
  const updateBranch = (index, field, value) => {
    const updated = [...branches];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };
  const removeBranch = (index) => {
    if (branches.length <= 1) return;
    const updated = branches.filter((_, i) => i !== index);
    onChange(updated);
  };
  const moveBranch = (index, direction) => {
    if (direction === -1 && index === 0 || direction === 1 && index === branches.length - 1) return;
    const updated = [...branches];
    const temp = updated[index];
    updated[index] = updated[index + direction];
    updated[index + direction] = temp;
    onChange(updated);
  };
  const availableVariables = (0, import_react2.useMemo)(() => {
    if (!workflowNodes) return [];
    return workflowNodes.filter((n) => n.id !== currentNodeId && n.data?.outputVariable).map((n) => ({
      nodeId: n.id,
      nodeTitle: n.data?.title || n.type,
      variable: n.data.outputVariable
    }));
  }, [workflowNodes, currentNodeId]);
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-medium text-slate-500" }, "Condition Branches"), /* @__PURE__ */ import_react2.default.createElement(
    import_ui.Button,
    {
      type: "button",
      onClick: addBranch,
      className: "flex items-center gap-1 px-2 py-1 text-xs bg-white text-[#646cff] hover:bg-[#646cff]/10 rounded transition-colors border border-slate-200"
    },
    /* @__PURE__ */ import_react2.default.createElement(import_fa.FaPlus, { className: "w-2.5 h-2.5" }),
    "Add Branch"
  )), availableVariables.length > 0 && /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-[10px] text-slate-400" }, "Available: ", availableVariables.map((v) => `ctx.${v.variable}`).join(", ")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-2" }, branches.map((branch, index) => /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      key: branch.id,
      className: "border border-slate-200 rounded p-2 bg-slate-50"
    },
    /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "w-5 h-5 flex items-center justify-center bg-purple-100 text-purple-600 text-[10px] font-bold rounded" }, index + 1), /* @__PURE__ */ import_react2.default.createElement(
      "input",
      {
        type: "text",
        value: branch.name,
        onChange: (e) => updateBranch(index, "name", e.target.value),
        className: "text-xs font-medium text-slate-700 bg-transparent border-none outline-none w-24",
        placeholder: "Branch name"
      }
    )), /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Button,
      {
        type: "button",
        onClick: () => moveBranch(index, -1),
        disabled: index === 0,
        className: "p-1 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors",
        title: "Move up"
      },
      /* @__PURE__ */ import_react2.default.createElement(import_io.IoMdArrowDropup, { className: "w-3 h-3" })
    ), /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Button,
      {
        type: "button",
        onClick: () => moveBranch(index, 1),
        disabled: index === branches.length - 1,
        className: "p-1 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors",
        title: "Move down"
      },
      /* @__PURE__ */ import_react2.default.createElement(import_io.IoMdArrowDropdown, { className: "w-3 h-3" })
    ), /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Button,
      {
        type: "button",
        onClick: () => removeBranch(index),
        disabled: branches.length <= 1,
        className: "p-1 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-30 transition-colors",
        title: "Remove branch"
      },
      /* @__PURE__ */ import_react2.default.createElement(import_fa.FaTrash, { className: "w-3 h-3" })
    ))),
    /* @__PURE__ */ import_react2.default.createElement("div", { className: "mb-2" }, /* @__PURE__ */ import_react2.default.createElement(import_ui.Select, { value: branch.conditionType, onValueChange: (val) => updateBranch(index, "conditionType", val) }, /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectValue, { placeholder: "Select condition type" })), /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectContent, null, /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectItem, { value: CONDITION_TYPES.EXPRESSION }, "JavaScript Expression"), /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectItem, { value: CONDITION_TYPES.EQUALS }, "Equals (==)"), /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectItem, { value: CONDITION_TYPES.NOT_EQUALS }, "Not Equals (!=)"), /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectItem, { value: CONDITION_TYPES.CONTAINS }, "Contains"), /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectItem, { value: CONDITION_TYPES.GREATER_THAN }, "Greater Than (>)"), /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectItem, { value: CONDITION_TYPES.LESS_THAN }, "Less Than (<)"), /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectItem, { value: CONDITION_TYPES.IS_EMPTY }, "Is Empty"), /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectItem, { value: CONDITION_TYPES.IS_NOT_EMPTY }, "Is Not Empty"), /* @__PURE__ */ import_react2.default.createElement(import_ui.SelectItem, { value: CONDITION_TYPES.REGEX }, "Regex Match")))),
    branch.conditionType === CONDITION_TYPES.EXPRESSION ? /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Textarea,
      {
        value: branch.expression || "",
        onChange: (e) => updateBranch(index, "expression", e.target.value),
        placeholder: "ctx.value === true",
        className: "w-full text-xs text-slate-700 p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff] resize-none",
        rows: 2
      }
    ) : branch.conditionType === CONDITION_TYPES.IS_EMPTY || branch.conditionType === CONDITION_TYPES.IS_NOT_EMPTY ? /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Input,
      {
        type: "text",
        value: branch.leftOperand || "",
        onChange: (e) => updateBranch(index, "leftOperand", e.target.value),
        placeholder: "ctx.variableName",
        className: "w-full text-xs text-slate-700 p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
      }
    ) : /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Input,
      {
        type: "text",
        value: branch.leftOperand || "",
        onChange: (e) => updateBranch(index, "leftOperand", e.target.value),
        placeholder: "ctx.variableName",
        className: "flex-1 text-xs text-slate-700 p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
      }
    ), /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Input,
      {
        type: "text",
        value: branch.rightOperand || "",
        onChange: (e) => updateBranch(index, "rightOperand", e.target.value),
        placeholder: "value",
        className: "flex-1 text-xs p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
      }
    ))
  ))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "border border-dashed border-slate-300 rounded p-2 bg-slate-50/50" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center gap-2 text-xs text-slate-500" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-600 text-[10px] font-bold rounded" }, "\u2205"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "font-medium" }, "Default (else)"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-slate-400" }, "- Used when no conditions match"))));
};
var ConditionNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
  const [formData, setFormData] = (0, import_react2.useState)({
    title: data?.title || "Condition",
    description: data?.description || "",
    branches: data?.branches || [
      {
        id: "branch_default",
        name: "Branch 1",
        conditionType: CONDITION_TYPES.EXPRESSION,
        expression: "true",
        leftOperand: "",
        rightOperand: ""
      }
    ],
    evaluationMode: data?.evaluationMode || "first_match",
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS2.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false
  });
  (0, import_react2.useEffect)(() => {
    if (data) {
      setFormData({
        title: data.title || "Condition",
        description: data.description || "",
        branches: data.branches || [
          {
            id: "branch_default",
            name: "Branch 1",
            conditionType: CONDITION_TYPES.EXPRESSION,
            expression: "true",
            leftOperand: "",
            rightOperand: ""
          }
        ],
        evaluationMode: data.evaluationMode || "first_match",
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS2.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false
      });
    }
  }, [data]);
  const schema = (0, import_react2.useMemo)(() => {
    return {
      type: "object",
      properties: {
        title: {
          type: "string",
          title: strings?.WORKFLOW_EDITOR_CONDITION_TITLE_LABEL || "Node Title"
        },
        description: {
          type: "string",
          title: strings?.WORKFLOW_EDITOR_NODE_DESCRIPTION_LABEL || "Description"
        },
        evaluationMode: {
          type: "string",
          title: "Evaluation Mode",
          enum: ["first_match", "all_matches"]
        },
        errorHandling: {
          type: "string",
          title: strings?.WORKFLOW_EDITOR_ERROR_HANDLING_LABEL || "Error Behavior",
          enum: Object.values(ERROR_HANDLING_OPTIONS2)
        },
        isDisabled: {
          type: "boolean",
          title: strings?.WORKFLOW_EDITOR_IS_DISABLED_LABEL || "Skip this node",
          default: false
        }
      }
    };
  }, [strings]);
  const uischema = (0, import_react2.useMemo)(() => {
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
                placeholder: strings?.WORKFLOW_EDITOR_CONDITION_TITLE_PLACEHOLDER || "Enter node title"
              }
            },
            {
              type: "Control",
              scope: "#/properties/description",
              options: {
                placeholder: strings?.WORKFLOW_EDITOR_NODE_DESCRIPTION_PLACEHOLDER || "Describe this condition...",
                multi: true,
                rows: 2
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
              scope: "#/properties/evaluationMode",
              options: {
                enumLabels: {
                  "first_match": "First Match (stop at first true)",
                  "all_matches": "All Matches (execute all true branches)"
                }
              }
            },
            {
              type: "Control",
              scope: "#/properties/errorHandling",
              options: {
                enumLabels: {
                  [ERROR_HANDLING_OPTIONS2.FAIL_WORKFLOW]: "Fail Workflow on Error",
                  [ERROR_HANDLING_OPTIONS2.CONTINUE_DEFAULT]: "Continue to Default Branch on Error"
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
  }, [strings]);
  const handleFormChange = (0, import_react2.useCallback)(({ data: newData }) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);
  const handleBranchesChange = (0, import_react2.useCallback)((newBranches) => {
    setFormData((prev) => ({ ...prev, branches: newBranches }));
  }, []);
  const handleSave = (0, import_react2.useCallback)(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react2.default.createElement(
    import_react3.JsonForms,
    {
      schema,
      uischema,
      data: formData,
      renderers: import_json_forms_renderers.jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ import_react2.default.createElement("div", { className: "border-t border-slate-100 pt-4" }, /* @__PURE__ */ import_react2.default.createElement(
    ConditionBranchEditor,
    {
      branches: formData.branches,
      onChange: handleBranchesChange,
      workflowNodes,
      currentNodeId: nodeId
    }
  )), /* @__PURE__ */ import_react2.default.createElement("div", { className: "p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "font-semibold text-slate-700 text-xs" }, "\u{1F4D8} Condition Expressions"), /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("span", { className: "font-medium text-slate-700" }, "Expression Examples:"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("code", { className: "bg-white px-1 rounded" }, "ctx.queryResult.length > 0")), /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("code", { className: "bg-white px-1 rounded" }, 'ctx.input.status === "active"')), /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("code", { className: "bg-white px-1 rounded" }, 'ctx.userData?.role === "admin"')))), /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("span", { className: "font-medium text-slate-700" }, "Evaluation:"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, "Branches are evaluated top-to-bottom. First matching branch is taken. If none match, ", /* @__PURE__ */ import_react2.default.createElement("strong", null, "Default (else)"), " is used.")), /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("span", { className: "font-medium text-slate-700" }, "Handles:"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, "Each branch creates a ", /* @__PURE__ */ import_react2.default.createElement("strong", null, "purple"), " output handle. ", /* @__PURE__ */ import_react2.default.createElement("strong", null, "Gray"), " = Default, ", /* @__PURE__ */ import_react2.default.createElement("strong", null, "Red"), " = Error."))), /* @__PURE__ */ import_react2.default.createElement(
    import_ui.Button,
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    strings?.WORKFLOW_EDITOR_CONDITION_NODE_SAVE_BUTTON || "Save"
  )));
};
var ConditionNode = (0, import_react2.memo)(({ data, isConnectable }) => {
  const { strings } = useWorkflowNodes();
  const isDisabled = data?.isDisabled ?? false;
  const branches = data?.branches || [];
  const branchCount = branches.length;
  const getHandlePosition = (index, total) => {
    const totalHandles = total + 1;
    const spacing = 100 / (totalHandles + 1);
    return spacing * (index + 1);
  };
  const getConditionPreview = (branch) => {
    if (branch.conditionType === CONDITION_TYPES.EXPRESSION) {
      const expr = branch.expression || "true";
      return expr.length > 20 ? expr.substring(0, 20) + "..." : expr;
    }
    const left = branch.leftOperand || "?";
    const right = branch.rightOperand || "?";
    switch (branch.conditionType) {
      case CONDITION_TYPES.EQUALS:
        return `${left} == ${right}`;
      case CONDITION_TYPES.NOT_EQUALS:
        return `${left} != ${right}`;
      case CONDITION_TYPES.CONTAINS:
        return `${left} contains ${right}`;
      case CONDITION_TYPES.GREATER_THAN:
        return `${left} > ${right}`;
      case CONDITION_TYPES.LESS_THAN:
        return `${left} < ${right}`;
      case CONDITION_TYPES.IS_EMPTY:
        return `${left} is empty`;
      case CONDITION_TYPES.IS_NOT_EMPTY:
        return `${left} is not empty`;
      case CONDITION_TYPES.REGEX:
        return `${left} matches ${right}`;
      default:
        return "condition";
    }
  };
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: `
      bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled ? "border-slate-200 opacity-50" : "border-slate-200 hover:border-purple-400 hover:shadow-md"}
    ` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      style: {
        borderTopLeftRadius: "0.25rem",
        borderBottomLeftRadius: "0.25rem"
      },
      className: `
          flex flex-col items-center justify-center px-3 py-3 border-r
          ${isDisabled ? "bg-slate-50 border-slate-100" : "bg-purple-50 border-purple-100"}
        `
    },
    /* @__PURE__ */ import_react2.default.createElement(import_tb.TbLogicAnd, { className: `w-5 h-5 ${isDisabled ? "text-slate-400" : "text-purple-500"}` })
  ), /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-slate-400 line-through" : "text-slate-700"}` }, data?.title || "Condition"), isDisabled && /* @__PURE__ */ import_react2.default.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200" }, /* @__PURE__ */ import_react2.default.createElement(import_vsc.VscDebugDisconnect, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ import_react2.default.createElement("div", { className: `text-[10px] mt-0.5 ${isDisabled ? "text-slate-300" : "text-slate-400"}` }, branchCount, " branch", branchCount !== 1 ? "es" : "", " + default"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "mt-1 space-y-0.5" }, branches.slice(0, 3).map((branch, index) => /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      key: branch.id,
      className: `flex items-center gap-1 text-[9px] ${isDisabled ? "text-slate-300" : "text-slate-500"}`
    },
    /* @__PURE__ */ import_react2.default.createElement(import_io.IoMdArrowDropright, { className: "w-3 h-3 text-purple-400 flex-shrink-0" }),
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "truncate font-medium" }, branch.name, ":"),
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "truncate font-mono opacity-75" }, getConditionPreview(branch))
  )), branches.length > 3 && /* @__PURE__ */ import_react2.default.createElement("div", { className: `text-[9px] ${isDisabled ? "text-slate-300" : "text-slate-400"}` }, "+", branches.length - 3, " more..."))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100 min-w-[50px]" }, branches.slice(0, 4).map((branch, index) => /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      key: branch.id,
      className: `w-2 h-2 rounded-full mb-0.5 ${isDisabled ? "bg-slate-300" : "bg-purple-400"}`,
      title: branch.name
    }
  )), branches.length > 4 && /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-[8px] text-slate-400" }, "+", branches.length - 4), /* @__PURE__ */ import_react2.default.createElement("div", { className: `w-2 h-2 rounded-full mt-1 ${isDisabled ? "bg-slate-300" : "bg-slate-400"}`, title: "Default" }))), /* @__PURE__ */ import_react2.default.createElement(
    import_reactflow.Handle,
    {
      type: "target",
      position: import_reactflow.Position.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#a855f7",
        border: "none",
        top: "-5px"
      }
    }
  ), branches.map((branch, index) => /* @__PURE__ */ import_react2.default.createElement(
    import_reactflow.Handle,
    {
      key: branch.id,
      type: "source",
      position: import_reactflow.Position.Bottom,
      id: branch.id,
      isConnectable,
      style: {
        left: `${getHandlePosition(index, branchCount)}%`,
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#a855f7",
        border: "none",
        bottom: "-5px"
      }
    }
  )), /* @__PURE__ */ import_react2.default.createElement(
    import_reactflow.Handle,
    {
      type: "source",
      position: import_reactflow.Position.Bottom,
      id: "default",
      isConnectable,
      style: {
        left: `${getHandlePosition(branchCount, branchCount)}%`,
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#94a3b8",
        border: "none",
        bottom: "-5px"
      }
    }
  ), /* @__PURE__ */ import_react2.default.createElement(
    import_reactflow.Handle,
    {
      type: "source",
      position: import_reactflow.Position.Bottom,
      id: "error",
      isConnectable,
      style: {
        right: "10px",
        left: "auto",
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#ef4444",
        border: "none",
        bottom: "-5px"
      }
    }
  ));
});

// src/nodes/dataQueryNode.jsx
var import_react4 = __toESM(require("react"));
var import_reactflow2 = require("reactflow");
var import_react5 = require("@jsonforms/react");
var import_si = require("react-icons/si");
var import_md = require("react-icons/md");
var import_io2 = require("react-icons/io");
var import_tb2 = require("react-icons/tb");
var import_bi = require("react-icons/bi");
var import_vsc2 = require("react-icons/vsc");
var import_fa2 = require("react-icons/fa");
var import_ui2 = require("@jet-admin/ui");
var ERROR_HANDLING_OPTIONS3 = {
  FAIL_WORKFLOW: "fail_workflow",
  CONTINUE: "continue",
  RETRY_THEN_CONTINUE: "retry_then_continue",
  RETRY_THEN_FAIL: "retry_then_fail"
};
var DataQueryNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { dataQueries, strings, onRefreshDataQueries, workflowNodes, workflowEdges, workflowInputArgs, onQueryTest } = useWorkflowNodes();
  const [formData, setFormData] = (0, import_react4.useState)({
    title: data?.title || "",
    description: data?.description || "",
    dataQueryID: data?.dataQueryID || "",
    args: data?.args || {},
    outputVariable: data?.outputVariable || "queryResult",
    timeoutSeconds: data?.timeoutSeconds ?? 300,
    retryLimit: data?.retryLimit ?? 0,
    retryDelaySeconds: data?.retryDelaySeconds ?? 5,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS3.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false
  });
  (0, import_react4.useEffect)(() => {
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
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS3.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false
      });
    }
  }, [data]);
  const selectedQuery = (0, import_react4.useMemo)(() => {
    return dataQueries?.find((q) => q.dataQueryID == formData.dataQueryID) || null;
  }, [dataQueries, formData.dataQueryID]);
  const schema = (0, import_react4.useMemo)(() => {
    const queryEnums = dataQueries?.map((q) => String(q.dataQueryID)) || [""];
    return {
      type: "object",
      properties: {
        // General Tab
        title: {
          type: "string",
          title: strings.WORKFLOW_EDITOR_DATA_QUERY_TITLE_LABEL || "Node Title"
        },
        description: {
          type: "string",
          title: strings.WORKFLOW_EDITOR_NODE_DESCRIPTION_LABEL || "Description"
        },
        dataQueryID: {
          type: "string",
          title: strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_LABEL || "Data Query",
          enum: queryEnums.length > 0 ? queryEnums : [""]
        },
        args: {
          type: "object",
          title: strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_ARGUMENTS_LABEL || "Arguments"
        },
        // Output Tab
        outputVariable: {
          type: "string",
          title: strings.WORKFLOW_EDITOR_OUTPUT_VARIABLE_LABEL || "Output Variable Name",
          description: "Variable name to store result (accessible as {{ctx.{name}}})",
          pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        // Execution Settings Tab
        timeoutSeconds: {
          type: "integer",
          title: strings.WORKFLOW_EDITOR_TIMEOUT_LABEL || "Timeout (seconds)",
          minimum: 1,
          maximum: 3600,
          default: 300
        },
        retryLimit: {
          type: "integer",
          title: strings.WORKFLOW_EDITOR_RETRY_LIMIT_LABEL || "Retry Attempts",
          minimum: 0,
          maximum: 10,
          default: 0
        },
        retryDelaySeconds: {
          type: "integer",
          title: strings.WORKFLOW_EDITOR_RETRY_DELAY_LABEL || "Retry Delay (seconds)",
          minimum: 1,
          maximum: 300,
          default: 5
        },
        errorHandling: {
          type: "string",
          title: strings.WORKFLOW_EDITOR_ERROR_HANDLING_LABEL || "Error Behavior",
          enum: Object.values(ERROR_HANDLING_OPTIONS3)
        },
        isDisabled: {
          type: "boolean",
          title: strings.WORKFLOW_EDITOR_IS_DISABLED_LABEL || "Skip this node",
          default: false
        }
      },
      required: ["dataQueryID"]
    };
  }, [dataQueries, strings]);
  const uischema = (0, import_react4.useMemo)(() => {
    const generalElements = [
      {
        type: "Control",
        scope: "#/properties/title",
        options: {
          placeholder: strings.WORKFLOW_EDITOR_DATA_QUERY_TITLE_PLACEHOLDER || "Enter node title"
        }
      },
      {
        type: "Control",
        scope: "#/properties/description",
        options: {
          placeholder: strings.WORKFLOW_EDITOR_NODE_DESCRIPTION_PLACEHOLDER || "Describe what this node does...",
          multi: true,
          rows: 2
        }
      },
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
        options: {
          isDynamicArgs: true,
          args: selectedQuery.dataQueryOptions.args,
          workflowNodes,
          workflowEdges,
          workflowInputArgs,
          currentNodeId: nodeId
        }
      });
    }
    return {
      type: "Categorization",
      elements: [
        {
          type: "Category",
          label: strings.WORKFLOW_EDITOR_TAB_GENERAL || "General",
          elements: generalElements
        },
        {
          type: "Category",
          label: strings.WORKFLOW_EDITOR_TAB_OUTPUT || "Output",
          elements: [
            {
              type: "Control",
              scope: "#/properties/outputVariable",
              options: {
                placeholder: "e.g., queryResult, userData, orderList"
              }
            }
          ]
        },
        {
          type: "Category",
          label: strings.WORKFLOW_EDITOR_TAB_ADVANCED || "Advanced",
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
  }, [dataQueries, strings, selectedQuery]);
  const handleFormChange = (0, import_react4.useCallback)(({ data: newData }) => {
    setFormData(newData);
  }, []);
  const handleSave = (0, import_react4.useCallback)(() => {
    onChange(formData);
  }, [onChange, formData]);
  const handleOpenTest = (0, import_react4.useCallback)(() => {
    if (onQueryTest && formData.dataQueryID) {
      onQueryTest(formData.dataQueryID);
    }
  }, [onQueryTest, formData.dataQueryID]);
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react4.default.createElement(
    import_react5.JsonForms,
    {
      schema,
      uischema,
      data: formData,
      renderers: import_json_forms_renderers.jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ import_react4.default.createElement("div", { className: "p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "font-semibold text-slate-700 text-xs" }, "\u{1F4D8} Query Arguments"), /* @__PURE__ */ import_react4.default.createElement("div", null, /* @__PURE__ */ import_react4.default.createElement("span", { className: "font-medium text-slate-700" }, "Argument Format:"), /* @__PURE__ */ import_react4.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ import_react4.default.createElement("div", null, /* @__PURE__ */ import_react4.default.createElement("code", { className: "bg-white px-1 rounded" }, "{{ctx.input.userId}}"), " \u2192 pass input value"), /* @__PURE__ */ import_react4.default.createElement("div", null, /* @__PURE__ */ import_react4.default.createElement("code", { className: "bg-white px-1 rounded" }, "{{ctx.queryResult.id}}"), " \u2192 from previous query"), /* @__PURE__ */ import_react4.default.createElement("div", null, /* @__PURE__ */ import_react4.default.createElement("code", { className: "bg-white px-1 rounded" }, "id_{{ctx.input.id}}"), " \u2192 string interpolation"))), /* @__PURE__ */ import_react4.default.createElement("div", null, /* @__PURE__ */ import_react4.default.createElement("span", { className: "font-medium text-slate-700" }, "Access Result:"), /* @__PURE__ */ import_react4.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, "Result stored in ", /* @__PURE__ */ import_react4.default.createElement("code", { className: "bg-white px-1 py-0.5 rounded font-mono" }, "ctx.{outputVariable}"), " for use in next nodes.")), /* @__PURE__ */ import_react4.default.createElement("div", null, /* @__PURE__ */ import_react4.default.createElement("span", { className: "font-medium text-slate-700" }, "Handles:"), /* @__PURE__ */ import_react4.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, /* @__PURE__ */ import_react4.default.createElement("strong", null, "Green:"), " Query succeeded \u2192 ", /* @__PURE__ */ import_react4.default.createElement("strong", null, "Red:"), " Query failed (use for error handling)"))), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex justify-between items-center gap-2 pt-2 border-t border-slate-100" }, /* @__PURE__ */ import_react4.default.createElement(
    import_ui2.Button,
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_SAVE_BUTTON || "Save"
  ), onQueryTest && formData.dataQueryID && /* @__PURE__ */ import_react4.default.createElement(
    import_ui2.Button,
    {
      type: "button",
      onClick: handleOpenTest,
      className: "px-3 py-1.5 text-sm text-slate-600 bg-slate-100 rounded hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5",
      title: "Test this query"
    },
    /* @__PURE__ */ import_react4.default.createElement(import_fa2.FaPlay, { className: "w-3 h-3 text-slate-500" }),
    "Test Query"
  ))));
};
var DataQueryNode = (0, import_react4.memo)(({ id, data, isConnectable }) => {
  const { dataQueries, strings, nodeExecutionStatus } = useWorkflowNodes();
  const [selectedQueryTitle, setSelectedQueryTitle] = (0, import_react4.useState)("Select Query");
  const executionStatus = nodeExecutionStatus?.[id] || "idle";
  (0, import_react4.useEffect)(() => {
    if (data.dataQueryID && dataQueries) {
      const query = dataQueries.find((q) => q.dataQueryID === data.dataQueryID);
      setSelectedQueryTitle(query?.dataQueryTitle || "Unknown Query");
    } else {
      setSelectedQueryTitle("Select Query");
    }
  }, [data.dataQueryID, dataQueries]);
  const isDisabled = data?.isDisabled ?? false;
  const hasRetry = (data?.retryLimit ?? 0) > 0;
  const hasCustomTimeout = (data?.timeoutSeconds ?? 300) !== 300;
  const argCount = data.args ? Object.keys(data.args).length : 0;
  const outputVar = data.outputVariable || "queryResult";
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
        return "border-slate-200 hover:border-blue-400 hover:shadow-md";
    }
  };
  const StatusIndicator2 = () => {
    if (executionStatus === "running") {
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin" }, /* @__PURE__ */ import_react4.default.createElement(import_tb2.TbRefresh, { className: "w-3 h-3 text-white" }));
    }
    if (executionStatus === "completed") {
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ import_react4.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react4.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    }
    if (executionStatus === "failed") {
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ import_react4.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react4.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    }
    return null;
  };
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: `
      relative bg-white border rounded
      min-w-[340px] max-w-[400px]
      transition-all duration-150
      ${isDisabled ? "border-slate-200 opacity-50" : getStatusStyles2()}
      ${!data.dataQueryID ? "!border-red-400 !bg-red-50" : ""}
    ` }, /* @__PURE__ */ import_react4.default.createElement(StatusIndicator2, null), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ import_react4.default.createElement(
    "div",
    {
      style: {
        borderTopLeftRadius: "0.25rem",
        borderBottomLeftRadius: "0.25rem"
      },
      className: `
          flex flex-col items-center justify-center px-3 py-3 border-r
          ${isDisabled ? "bg-slate-50 border-slate-100" : executionStatus === "running" ? "bg-blue-100 border-blue-200" : executionStatus === "completed" ? "bg-green-50 border-green-100" : executionStatus === "failed" ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"}}
        `
    },
    /* @__PURE__ */ import_react4.default.createElement(import_si.SiQuantconnect, { className: `w-5 h-5 ${isDisabled ? "text-slate-400" : executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-blue-500"}` })
  ), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ import_react4.default.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-slate-400 line-through" : "text-slate-700"}` }, data?.title || "Untitled"), isDisabled && /* @__PURE__ */ import_react4.default.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200" }, /* @__PURE__ */ import_react4.default.createElement(import_vsc2.VscDebugDisconnect, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ import_react4.default.createElement("div", { className: `text-sm truncate mt-0.5 ${isDisabled ? "text-slate-300" : "text-slate-500"}` }, selectedQueryTitle.length > 20 ? `${String(selectedQueryTitle).substring(0, 20)}...` : selectedQueryTitle)), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: `w-2 h-2 rounded-full mb-1 ${isDisabled ? "bg-slate-300" : "bg-green-400"}`, title: "Success" }), /* @__PURE__ */ import_react4.default.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-slate-300" : "bg-red-400"}`, title: "Error" }))), /* @__PURE__ */ import_react4.default.createElement(
    import_reactflow2.Handle,
    {
      type: "target",
      position: import_reactflow2.Position.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#3b82f6",
        border: "none",
        top: "-5px"
      }
    }
  ), /* @__PURE__ */ import_react4.default.createElement(
    import_reactflow2.Handle,
    {
      type: "source",
      position: import_reactflow2.Position.Bottom,
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
  ), /* @__PURE__ */ import_react4.default.createElement(
    import_reactflow2.Handle,
    {
      type: "source",
      position: import_reactflow2.Position.Bottom,
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

// src/nodes/javascriptNode.jsx
var import_react6 = __toESM(require("react"));
var import_reactflow3 = require("reactflow");
var import_react7 = require("@jsonforms/react");
var import_fa3 = require("react-icons/fa");
var import_io3 = require("react-icons/io");
var import_tb3 = require("react-icons/tb");
var import_bi2 = require("react-icons/bi");
var import_vsc3 = require("react-icons/vsc");
var import_ui3 = require("@jet-admin/ui");
var ERROR_HANDLING_OPTIONS4 = {
  FAIL_WORKFLOW: "fail_workflow",
  CONTINUE: "continue",
  RETRY_THEN_CONTINUE: "retry_then_continue",
  RETRY_THEN_FAIL: "retry_then_fail"
};
var JavascriptNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
  const [formData, setFormData] = (0, import_react6.useState)({
    title: data?.title || "",
    description: data?.description || "",
    code: data?.code || "return true;",
    outputVariable: data?.outputVariable || "scriptResult",
    timeoutSeconds: data?.timeoutSeconds ?? 30,
    retryLimit: data?.retryLimit ?? 0,
    retryDelaySeconds: data?.retryDelaySeconds ?? 5,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS4.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false
  });
  (0, import_react6.useEffect)(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        description: data.description || "",
        code: data.code || "return true;",
        outputVariable: data.outputVariable || "scriptResult",
        timeoutSeconds: data.timeoutSeconds ?? 30,
        retryLimit: data.retryLimit ?? 0,
        retryDelaySeconds: data.retryDelaySeconds ?? 5,
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS4.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false
      });
    }
  }, [data]);
  const availableVariables = (0, import_react6.useMemo)(() => {
    if (!workflowNodes) return [];
    return workflowNodes.filter((n) => n.id !== nodeId && n.data?.outputVariable).map((n) => ({
      nodeId: n.id,
      nodeTitle: n.data?.title || n.type,
      variable: n.data.outputVariable
    }));
  }, [workflowNodes, nodeId]);
  const schema = (0, import_react6.useMemo)(() => {
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
          enum: Object.values(ERROR_HANDLING_OPTIONS4)
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
  const uischema = (0, import_react6.useMemo)(() => {
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
                hint: contextHint
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
                  [ERROR_HANDLING_OPTIONS4.FAIL_WORKFLOW]: "Fail Workflow",
                  [ERROR_HANDLING_OPTIONS4.CONTINUE]: "Continue (ignore error)",
                  [ERROR_HANDLING_OPTIONS4.RETRY_THEN_CONTINUE]: "Retry, then Continue",
                  [ERROR_HANDLING_OPTIONS4.RETRY_THEN_FAIL]: "Retry, then Fail"
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
  const handleFormChange = (0, import_react6.useCallback)(({ data: newData }) => {
    setFormData(newData);
  }, []);
  const handleSave = (0, import_react6.useCallback)(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react6.default.createElement(
    import_react7.JsonForms,
    {
      schema,
      uischema,
      data: formData,
      renderers: import_json_forms_renderers.jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ import_react6.default.createElement("div", { className: "p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "font-semibold text-slate-700 text-xs" }, "\u{1F4D8} Writing JavaScript Code"), /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement("span", { className: "font-medium text-slate-700" }, "Access Context:"), /* @__PURE__ */ import_react6.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement("code", { className: "bg-white px-1 rounded" }, "ctx.input.paramName"), " \u2192 workflow input"), /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement("code", { className: "bg-white px-1 rounded" }, "ctx.queryResult"), " \u2192 previous node output"), /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement("code", { className: "bg-white px-1 rounded" }, "ctx.item"), " \u2192 current loop item"))), /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement("span", { className: "font-medium text-slate-700" }, "Return Value:"), /* @__PURE__ */ import_react6.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, "Use ", /* @__PURE__ */ import_react6.default.createElement("code", { className: "bg-white px-1 py-0.5 rounded font-mono" }, "return yourValue;"), " to store result in output variable.")), /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement("span", { className: "font-medium text-slate-700" }, "Available Globals:"), /* @__PURE__ */ import_react6.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, /* @__PURE__ */ import_react6.default.createElement("code", { className: "bg-white px-1 rounded font-mono text-[9px]" }, "JSON, Math, Date, Array, Object, String, Number, Boolean, parseInt, parseFloat"))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "text-amber-600 bg-amber-50 border border-amber-200 rounded p-1.5 mt-2" }, /* @__PURE__ */ import_react6.default.createElement("strong", null, "\u26A0\uFE0F Note:"), " Code runs in a sandbox. No network access, filesystem, or require().")), /* @__PURE__ */ import_react6.default.createElement(
    import_ui3.Button,
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    strings?.WORKFLOW_EDITOR_JAVASCRIPT_NODE_SAVE_BUTTON || "Save"
  )));
};
var JavascriptNode = (0, import_react6.memo)(({ id, data, isConnectable }) => {
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
        return "border-slate-200 hover:border-yellow-400 hover:shadow-md";
    }
  };
  const StatusIndicator2 = () => {
    if (executionStatus === "running") {
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin" }, /* @__PURE__ */ import_react6.default.createElement(import_tb3.TbRefresh, { className: "w-3 h-3 text-white" }));
    }
    if (executionStatus === "completed") {
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ import_react6.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react6.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    }
    if (executionStatus === "failed") {
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ import_react6.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react6.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    }
    return null;
  };
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: `
      relative bg-white border rounded
      min-w-[340px] max-w-[400px]
      transition-all duration-150
      ${isDisabled ? "border-slate-200 opacity-50" : getStatusStyles2()}
      ${!data.code ? "!border-red-400 !bg-red-50" : ""}
    ` }, /* @__PURE__ */ import_react6.default.createElement(StatusIndicator2, null), /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ import_react6.default.createElement(
    "div",
    {
      style: {
        borderTopLeftRadius: "0.25rem",
        borderBottomLeftRadius: "0.25rem"
      },
      className: `
          flex flex-col items-center justify-center px-3 py-3 border-r
          ${isDisabled ? "bg-slate-50 border-slate-100" : executionStatus === "running" ? "bg-blue-100 border-blue-200" : executionStatus === "completed" ? "bg-green-50 border-green-100" : executionStatus === "failed" ? "bg-red-50 border-red-100" : "bg-yellow-50 border-yellow-100"}
        `
    },
    /* @__PURE__ */ import_react6.default.createElement(import_fa3.FaJs, { className: `w-5 h-5 ${isDisabled ? "text-slate-400" : executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-yellow-500"}` })
  ), /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-slate-400 line-through" : "text-slate-700"}` }, data?.title || "Untitled Script"), isDisabled && /* @__PURE__ */ import_react6.default.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200" }, /* @__PURE__ */ import_react6.default.createElement(import_vsc3.VscDebugDisconnect, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ import_react6.default.createElement("div", { className: `text-[10px] font-mono truncate mt-0.5 ${isDisabled ? "text-slate-300" : "text-slate-400"}` }, codePreview)), /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: `w-2 h-2 rounded-full mb-1 ${isDisabled ? "bg-slate-300" : "bg-green-400"}`, title: "Success" }), /* @__PURE__ */ import_react6.default.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-slate-300" : "bg-red-400"}`, title: "Error" }))), /* @__PURE__ */ import_react6.default.createElement(
    import_reactflow3.Handle,
    {
      type: "target",
      position: import_reactflow3.Position.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#eab308",
        border: "none",
        top: "-5px"
      }
    }
  ), /* @__PURE__ */ import_react6.default.createElement(
    import_reactflow3.Handle,
    {
      type: "source",
      position: import_reactflow3.Position.Bottom,
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
  ), /* @__PURE__ */ import_react6.default.createElement(
    import_reactflow3.Handle,
    {
      type: "source",
      position: import_reactflow3.Position.Bottom,
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
var import_react8 = __toESM(require("react"));
var import_reactflow4 = require("reactflow");
var import_react9 = require("@jsonforms/react");
var import_vsc4 = require("react-icons/vsc");
var import_ui4 = require("@jet-admin/ui");
var StartNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = (0, import_react8.useState)({
    title: data?.title || "Start",
    description: data?.description || ""
  });
  (0, import_react8.useEffect)(() => {
    if (data) {
      setFormData({
        title: data.title || "Start",
        description: data.description || ""
      });
    }
  }, [data]);
  const schema = (0, import_react8.useMemo)(() => {
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
        }
      }
    };
  }, []);
  const uischema = (0, import_react8.useMemo)(() => {
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
          options: { placeholder: "Describe this workflow...", multi: true, rows: 2 }
        }
      ]
    };
  }, []);
  const handleFormChange = (0, import_react8.useCallback)(({ data: newData }) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);
  const handleSave = (0, import_react8.useCallback)(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react8.default.createElement(
    import_react9.JsonForms,
    {
      schema,
      uischema,
      data: formData,
      renderers: import_json_forms_renderers.jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "font-semibold text-slate-700 text-xs" }, "\u{1F4D8} How This Works"), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-medium text-slate-700" }, "Triggers:"), /* @__PURE__ */ import_react8.default.createElement("ul", { className: "ml-3 mt-0.5 space-y-0.5 list-disc list-inside text-slate-500" }, /* @__PURE__ */ import_react8.default.createElement("li", null, 'Manual: Click "Test Workflow" button'), /* @__PURE__ */ import_react8.default.createElement("li", null, "API: POST /api/v1/workflows/:id/run"), /* @__PURE__ */ import_react8.default.createElement("li", null, "Widget: Link workflow to a widget"))), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-medium text-slate-700" }, "Input Parameters:"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, "Define inputs in the ", /* @__PURE__ */ import_react8.default.createElement("strong", null, '"Input Parameters"'), " panel (right side). Access them in other nodes using: ", /* @__PURE__ */ import_react8.default.createElement("code", { className: "bg-white px-1 py-0.5 rounded border border-slate-200 font-mono" }, "{{ctx.input.paramName}}"))), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-medium text-slate-700" }, "Variable Format:"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement("code", { className: "bg-white px-1 rounded" }, "{{ctx.input.userId}}"), " \u2192 input parameter"), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement("code", { className: "bg-white px-1 rounded" }, "{{ctx.queryResult}}"), " \u2192 previous node output"), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement("code", { className: "bg-white px-1 rounded" }, "id_{{ctx.input.id}}"), " \u2192 string interpolation"))))), /* @__PURE__ */ import_react8.default.createElement(
    import_ui4.Button,
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    "Save"
  )));
};
var StartNode = (0, import_react8.memo)(({ id, data, isConnectable }) => {
  const { strings, nodeExecutionStatus } = useWorkflowNodes();
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
        return "border-slate-200 hover:border-green-400 hover:shadow-md";
    }
  };
  const StatusIndicator2 = () => {
    if (executionStatus === "running") {
      return /* @__PURE__ */ import_react8.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10" }, /* @__PURE__ */ import_react8.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react8.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" })));
    }
    if (executionStatus === "completed") {
      return /* @__PURE__ */ import_react8.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ import_react8.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react8.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    }
    if (executionStatus === "failed") {
      return /* @__PURE__ */ import_react8.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ import_react8.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react8.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    }
    return null;
  };
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: `
      relative bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${getStatusStyles2()}
    ` }, /* @__PURE__ */ import_react8.default.createElement(StatusIndicator2, null), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ import_react8.default.createElement("div", { style: {
    borderTopLeftRadius: "0.25rem",
    borderBottomLeftRadius: "0.25rem"
  }, className: `flex flex-col items-center justify-center px-3 py-3 border-r ${executionStatus === "running" ? "bg-blue-100 border-blue-200" : executionStatus === "completed" ? "bg-green-100 border-green-200" : executionStatus === "failed" ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}` }, /* @__PURE__ */ import_react8.default.createElement(import_vsc4.VscDebugStart, { className: `w-5 h-5 ${executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-green-500"}` })), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-xs font-semibold truncate text-slate-700" }, data?.title || "Start")), /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[10px] mt-0.5 text-slate-400" }, "Workflow entry point")), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-2 h-2 rounded-full bg-green-400", title: "Output" }))), /* @__PURE__ */ import_react8.default.createElement(
    import_reactflow4.Handle,
    {
      type: "source",
      position: import_reactflow4.Position.Bottom,
      id: "output",
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: "#22c55e",
        border: "none",
        bottom: "-5px"
      }
    }
  ));
});

// src/nodes/loopNode.jsx
var import_react10 = __toESM(require("react"));
var import_reactflow5 = require("reactflow");
var import_react11 = require("@jsonforms/react");
var import_vsc5 = require("react-icons/vsc");
var import_tb4 = require("react-icons/tb");
var import_io4 = require("react-icons/io");
var import_ui5 = require("@jet-admin/ui");
var ERROR_HANDLING_OPTIONS5 = {
  FAIL_WORKFLOW: "fail_workflow",
  CONTINUE: "continue",
  SKIP_ITEM: "skip_item"
};
var LoopNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
  const [formData, setFormData] = (0, import_react10.useState)({
    title: data?.title || "Loop",
    description: data?.description || "",
    sourceVariable: data?.sourceVariable || "",
    itemVariable: data?.itemVariable || "item",
    indexVariable: data?.indexVariable || "index",
    maxIterations: data?.maxIterations ?? 1e3,
    batchSize: data?.batchSize ?? 1,
    delayBetweenItems: data?.delayBetweenItems ?? 0,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS5.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false
  });
  (0, import_react10.useEffect)(() => {
    if (data) {
      setFormData({
        title: data.title || "Loop",
        description: data.description || "",
        sourceVariable: data.sourceVariable || "",
        itemVariable: data.itemVariable || "item",
        indexVariable: data.indexVariable || "index",
        maxIterations: data.maxIterations ?? 1e3,
        batchSize: data.batchSize ?? 1,
        delayBetweenItems: data.delayBetweenItems ?? 0,
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS5.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false
      });
    }
  }, [data]);
  const availableVariables = (0, import_react10.useMemo)(() => {
    if (!workflowNodes) return [];
    return workflowNodes.filter((n) => n.id !== nodeId && n.data?.outputVariable).map((n) => ({
      nodeId: n.id,
      nodeTitle: n.data?.title || n.type,
      variable: n.data.outputVariable
    }));
  }, [workflowNodes, nodeId]);
  const schema = (0, import_react10.useMemo)(() => {
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
          description: "Variable containing the array to iterate (e.g., ctx.queryResult)"
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
        batchSize: {
          type: "integer",
          title: "Batch Size",
          description: "Process items in batches (1 = sequential)",
          minimum: 1,
          maximum: 100,
          default: 1
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
          enum: Object.values(ERROR_HANDLING_OPTIONS5)
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
  const uischema = (0, import_react10.useMemo)(() => {
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
              options: { placeholder: "ctx.queryResult", hint: contextHint }
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
            { type: "Control", scope: "#/properties/batchSize" },
            { type: "Control", scope: "#/properties/delayBetweenItems" },
            {
              type: "Control",
              scope: "#/properties/errorHandling",
              options: {
                enumLabels: {
                  [ERROR_HANDLING_OPTIONS5.FAIL_WORKFLOW]: "Fail Workflow",
                  [ERROR_HANDLING_OPTIONS5.CONTINUE]: "Continue to next item",
                  [ERROR_HANDLING_OPTIONS5.SKIP_ITEM]: "Skip failed item"
                }
              }
            },
            { type: "Control", scope: "#/properties/isDisabled" }
          ]
        }
      ]
    };
  }, [availableVariables]);
  const handleFormChange = (0, import_react10.useCallback)(({ data: newData }) => {
    setFormData(newData);
  }, []);
  const handleSave = (0, import_react10.useCallback)(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ import_react10.default.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react10.default.createElement(
    import_react11.JsonForms,
    {
      schema,
      uischema,
      data: formData,
      renderers: import_json_forms_renderers.jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ import_react10.default.createElement("div", { className: "p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "font-semibold text-slate-700 text-xs" }, "\u{1F4D8} Loop Configuration"), /* @__PURE__ */ import_react10.default.createElement("div", null, /* @__PURE__ */ import_react10.default.createElement("span", { className: "font-medium text-slate-700" }, "Source Array Format:"), /* @__PURE__ */ import_react10.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ import_react10.default.createElement("div", null, /* @__PURE__ */ import_react10.default.createElement("code", { className: "bg-white px-1 rounded" }, "{{ctx.queryResult}}"), " \u2192 array from previous node"), /* @__PURE__ */ import_react10.default.createElement("div", null, /* @__PURE__ */ import_react10.default.createElement("code", { className: "bg-white px-1 rounded" }, "{{ctx.input.items}}"), " \u2192 array from input"))), /* @__PURE__ */ import_react10.default.createElement("div", null, /* @__PURE__ */ import_react10.default.createElement("span", { className: "font-medium text-slate-700" }, "Inside Loop Body:"), /* @__PURE__ */ import_react10.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ import_react10.default.createElement("div", null, /* @__PURE__ */ import_react10.default.createElement("code", { className: "bg-white px-1 rounded" }, "ctx.item"), " \u2192 current array element"), /* @__PURE__ */ import_react10.default.createElement("div", null, /* @__PURE__ */ import_react10.default.createElement("code", { className: "bg-white px-1 rounded" }, "ctx.index"), " \u2192 current iteration index (0-based)"))), /* @__PURE__ */ import_react10.default.createElement("div", null, /* @__PURE__ */ import_react10.default.createElement("span", { className: "font-medium text-slate-700" }, "Handles:"), /* @__PURE__ */ import_react10.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, /* @__PURE__ */ import_react10.default.createElement("strong", null, "Loop (cyan):"), " Executes for each item \u2192 ", /* @__PURE__ */ import_react10.default.createElement("strong", null, "Completed (green):"), " After all iterations"))), /* @__PURE__ */ import_react10.default.createElement(
    import_ui5.Button,
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    "Save"
  )));
};
var LoopNode = (0, import_react10.memo)(({ data, isConnectable }) => {
  const { strings } = useWorkflowNodes();
  const isDisabled = data?.isDisabled ?? false;
  const sourceVariable = data?.sourceVariable || "ctx.array";
  const itemVariable = data?.itemVariable || "item";
  return /* @__PURE__ */ import_react10.default.createElement("div", { className: `
      bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled ? "border-slate-200 opacity-50" : "border-slate-200 hover:border-cyan-400 hover:shadow-md"}
      ${!data.sourceVariable ? "!border-red-400 !bg-red-50" : ""}
    ` }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ import_react10.default.createElement(
    "div",
    {
      style: {
        borderTopLeftRadius: "0.25rem",
        borderBottomLeftRadius: "0.25rem"
      },
      className: `
          flex flex-col items-center justify-center px-3 py-3 border-r
          ${isDisabled ? "bg-slate-50 border-slate-100" : "bg-cyan-50 border-cyan-100"}
        `
    },
    /* @__PURE__ */ import_react10.default.createElement(import_tb4.TbRepeat, { className: `w-5 h-5 ${isDisabled ? "text-slate-400" : "text-cyan-500"}` })
  ), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-slate-400 line-through" : "text-slate-700"}` }, data?.title || "Loop"), isDisabled && /* @__PURE__ */ import_react10.default.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200" }, /* @__PURE__ */ import_react10.default.createElement(import_vsc5.VscDebugDisconnect, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ import_react10.default.createElement("div", { className: `text-[10px] font-mono mt-0.5 ${isDisabled ? "text-slate-300" : "text-slate-400"}` }, "for (", itemVariable, " in ", sourceVariable.length > 20 ? sourceVariable.substring(0, 20) + "..." : sourceVariable, ")")), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: `w-2 h-2 rounded-full mb-1 ${isDisabled ? "bg-slate-300" : "bg-cyan-400"}`, title: "Loop Body" }), /* @__PURE__ */ import_react10.default.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-slate-300" : "bg-green-400"}`, title: "Completed" }))), /* @__PURE__ */ import_react10.default.createElement(
    import_reactflow5.Handle,
    {
      type: "target",
      position: import_reactflow5.Position.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#06b6d4",
        border: "none",
        top: "-5px"
      }
    }
  ), /* @__PURE__ */ import_react10.default.createElement(
    import_reactflow5.Handle,
    {
      type: "source",
      position: import_reactflow5.Position.Bottom,
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
  ), /* @__PURE__ */ import_react10.default.createElement(
    import_reactflow5.Handle,
    {
      type: "source",
      position: import_reactflow5.Position.Bottom,
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
var import_react12 = __toESM(require("react"));
var import_reactflow6 = require("reactflow");
var import_react13 = require("@jsonforms/react");
var import_vsc6 = require("react-icons/vsc");
var import_io5 = require("react-icons/io");
var import_ui6 = require("@jet-admin/ui");
var DelayNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = (0, import_react12.useState)({
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
  (0, import_react12.useEffect)(() => {
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
  const schema = (0, import_react12.useMemo)(() => {
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
          description: "Context variable containing delay in ms (e.g., ctx.waitTime)"
        },
        untilTime: {
          type: "string",
          title: "Until Time",
          description: "Wait until this time (ISO format or ctx variable)"
        },
        isDisabled: {
          type: "boolean",
          title: "Skip this node",
          default: false
        }
      }
    };
  }, []);
  const uischema = (0, import_react12.useMemo)(() => {
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
        options: { placeholder: "ctx.waitTime (in milliseconds)" }
      });
    } else if (formData.delayType === "until") {
      delayElements.push({
        type: "Control",
        scope: "#/properties/untilTime",
        options: { placeholder: "2024-12-31T23:59:59Z or ctx.targetTime" }
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
  const handleFormChange = (0, import_react12.useCallback)(({ data: newData }) => {
    setFormData(newData);
  }, []);
  const handleSave = (0, import_react12.useCallback)(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ import_react12.default.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react12.default.createElement(
    import_react13.JsonForms,
    {
      schema,
      uischema,
      data: formData,
      renderers: import_json_forms_renderers.jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ import_react12.default.createElement("div", { className: "p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "font-semibold text-slate-700 text-xs" }, "\u{1F4D8} Delay Types"), /* @__PURE__ */ import_react12.default.createElement("div", null, /* @__PURE__ */ import_react12.default.createElement("span", { className: "font-medium text-slate-700" }, "Fixed Duration:"), /* @__PURE__ */ import_react12.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, "Set exact wait time using minutes, seconds, and milliseconds.")), /* @__PURE__ */ import_react12.default.createElement("div", null, /* @__PURE__ */ import_react12.default.createElement("span", { className: "font-medium text-slate-700" }, "From Variable:"), /* @__PURE__ */ import_react12.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500 font-mono text-[9px]" }, /* @__PURE__ */ import_react12.default.createElement("code", { className: "bg-white px-1 rounded" }, "{{ctx.waitTime}}"), " \u2192 value in milliseconds")), /* @__PURE__ */ import_react12.default.createElement("div", { className: "text-green-600 bg-green-50 border border-green-200 rounded p-1.5 mt-2" }, /* @__PURE__ */ import_react12.default.createElement("strong", null, "\u2713 Non-blocking:"), " Delay uses queue scheduling. Workflow resources are released during wait.")), /* @__PURE__ */ import_react12.default.createElement(
    import_ui6.Button,
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    "Save"
  )));
};
var DelayNode = (0, import_react12.memo)(({ data, isConnectable }) => {
  const { strings } = useWorkflowNodes();
  const isDisabled = data?.isDisabled ?? false;
  const delayType = data?.delayType || "fixed";
  const getDelayDisplay = () => {
    if (delayType === "dynamic") {
      return data?.delayVariable || "ctx.delay";
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
  return /* @__PURE__ */ import_react12.default.createElement("div", { className: `
      bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled ? "border-slate-200 opacity-50" : "border-slate-200 hover:border-amber-400 hover:shadow-md"}
    ` }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ import_react12.default.createElement(
    "div",
    {
      style: {
        borderTopLeftRadius: "0.25rem",
        borderBottomLeftRadius: "0.25rem"
      },
      className: `
          flex flex-col items-center justify-center px-3 py-3 border-r
          ${isDisabled ? "bg-slate-50 border-slate-100" : "bg-amber-50 border-amber-100"}
        `
    },
    /* @__PURE__ */ import_react12.default.createElement(import_io5.IoMdTime, { className: `w-5 h-5 ${isDisabled ? "text-slate-400" : "text-amber-500"}` })
  ), /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ import_react12.default.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-slate-400 line-through" : "text-slate-700"}` }, data?.title || "Delay"), isDisabled && /* @__PURE__ */ import_react12.default.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200" }, /* @__PURE__ */ import_react12.default.createElement(import_vsc6.VscDebugDisconnect, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ import_react12.default.createElement("div", { className: `text-[10px] font-mono mt-0.5 ${isDisabled ? "text-slate-300" : "text-slate-400"}` }, "wait ", getDelayDisplay())), /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-slate-300" : "bg-amber-400"}`, title: "After Delay" }))), /* @__PURE__ */ import_react12.default.createElement(
    import_reactflow6.Handle,
    {
      type: "target",
      position: import_reactflow6.Position.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#f59e0b",
        border: "none",
        top: "-5px"
      }
    }
  ), /* @__PURE__ */ import_react12.default.createElement(
    import_reactflow6.Handle,
    {
      type: "source",
      position: import_reactflow6.Position.Bottom,
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
var import_react14 = __toESM(require("react"));
var import_reactflow7 = require("reactflow");
var import_react15 = require("@jsonforms/react");
var import_vsc7 = require("react-icons/vsc");
var import_fa4 = require("react-icons/fa");
var import_io6 = require("react-icons/io");
var import_ui7 = require("@jet-admin/ui");
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
  return /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react14.default.createElement("label", { className: "text-xs font-medium text-slate-500" }, "Output Parameters"), /* @__PURE__ */ import_react14.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      onClick: addParameter,
      className: "flex items-center gap-1 px-2 py-1 text-xs bg-white text-[#646cff] hover:bg-[#646cff]/10 rounded transition-colors border border-slate-200"
    },
    /* @__PURE__ */ import_react14.default.createElement(import_fa4.FaPlus, { className: "w-2.5 h-2.5" }),
    "Add Output"
  )), /* @__PURE__ */ import_react14.default.createElement("p", { className: "text-[10px] text-slate-400" }, "Define outputs that will be returned when the workflow completes."), parameters.length === 0 ? /* @__PURE__ */ import_react14.default.createElement("div", { className: "text-xs text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded" }, "No output parameters defined. Workflow will complete with no output.") : /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-2" }, parameters.map((param, index) => /* @__PURE__ */ import_react14.default.createElement(
    "div",
    {
      key: param.id,
      className: "border border-slate-200 rounded p-2 bg-slate-50"
    },
    /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react14.default.createElement(import_io6.IoMdArrowDropleft, { className: "w-3 h-3 text-red-500" }), /* @__PURE__ */ import_react14.default.createElement(
      import_ui7.Input,
      {
        type: "text",
        value: param.name,
        onChange: (e) => updateParameter(index, "name", e.target.value.replace(/[^a-zA-Z0-9_]/g, "")),
        className: "text-xs font-mono font-medium text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 w-28 focus:outline-none focus:border-[#646cff]",
        placeholder: "outputName"
      }
    )), /* @__PURE__ */ import_react14.default.createElement(
      import_ui7.Button,
      {
        type: "button",
        onClick: () => removeParameter(index),
        className: "p-1 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors",
        title: "Remove output"
      },
      /* @__PURE__ */ import_react14.default.createElement(import_fa4.FaTrash, { className: "w-3 h-3" })
    )),
    /* @__PURE__ */ import_react14.default.createElement("div", null, /* @__PURE__ */ import_react14.default.createElement("label", { className: "text-[10px] text-slate-400" }, "Source Variable"), /* @__PURE__ */ import_react14.default.createElement(
      import_ui7.Input,
      {
        type: "text",
        value: param.sourceVariable,
        onChange: (e) => updateParameter(index, "sourceVariable", e.target.value),
        placeholder: "ctx.result or a value",
        className: "w-full text-xs text-slate-700 p-1.5 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
      }
    ), availableVariables.length > 0 && /* @__PURE__ */ import_react14.default.createElement("p", { className: "text-[9px] text-slate-400 mt-0.5" }, "Available: ", availableVariables.slice(0, 5).map((v) => `ctx.${v.variable}`).join(", "), availableVariables.length > 5 && "...")),
    /* @__PURE__ */ import_react14.default.createElement("div", { className: "mt-2" }, /* @__PURE__ */ import_react14.default.createElement("label", { className: "text-[10px] text-slate-400" }, "Description"), /* @__PURE__ */ import_react14.default.createElement(
      import_ui7.Input,
      {
        type: "text",
        value: param.description,
        onChange: (e) => updateParameter(index, "description", e.target.value),
        placeholder: "What this output represents",
        className: "w-full text-xs text-slate-700 p-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:border-[#646cff]"
      }
    ))
  ))));
};
var EndNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
  const [formData, setFormData] = (0, import_react14.useState)({
    title: data?.title || "End",
    description: data?.description || "",
    status: data?.status || END_STATUS.SUCCESS,
    outputParameters: data?.outputParameters || []
  });
  (0, import_react14.useEffect)(() => {
    if (data) {
      setFormData({
        title: data.title || "End",
        description: data.description || "",
        status: data.status || END_STATUS.SUCCESS,
        outputParameters: data.outputParameters || []
      });
    }
  }, [data]);
  const availableVariables = (0, import_react14.useMemo)(() => {
    if (!workflowNodes) return [];
    return workflowNodes.filter((n) => n.id !== nodeId && n.data?.outputVariable).map((n) => ({
      nodeId: n.id,
      nodeTitle: n.data?.title || n.type,
      variable: n.data.outputVariable
    }));
  }, [workflowNodes, nodeId]);
  const schema = (0, import_react14.useMemo)(() => {
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
  const uischema = (0, import_react14.useMemo)(() => {
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
  const handleFormChange = (0, import_react14.useCallback)(({ data: newData }) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);
  const handleParametersChange = (0, import_react14.useCallback)((newParams) => {
    setFormData((prev) => ({ ...prev, outputParameters: newParams }));
  }, []);
  const handleSave = (0, import_react14.useCallback)(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ import_react14.default.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react14.default.createElement(
    import_react15.JsonForms,
    {
      schema,
      uischema,
      data: formData,
      renderers: import_json_forms_renderers.jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ import_react14.default.createElement("div", { className: "border-t border-slate-100 pt-4" }, /* @__PURE__ */ import_react14.default.createElement(
    OutputParameterEditor,
    {
      parameters: formData.outputParameters,
      onChange: handleParametersChange,
      availableVariables
    }
  )), /* @__PURE__ */ import_react14.default.createElement("div", { className: "p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "font-semibold text-slate-700 text-xs" }, "\u{1F4D8} Workflow Output"), /* @__PURE__ */ import_react14.default.createElement("div", null, /* @__PURE__ */ import_react14.default.createElement("span", { className: "font-medium text-slate-700" }, "Source Variable Format:"), /* @__PURE__ */ import_react14.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5" }, /* @__PURE__ */ import_react14.default.createElement("div", null, /* @__PURE__ */ import_react14.default.createElement("code", { className: "bg-white px-1 rounded" }, "{{ctx.queryResult}}"), " \u2192 from previous node"), /* @__PURE__ */ import_react14.default.createElement("div", null, /* @__PURE__ */ import_react14.default.createElement("code", { className: "bg-white px-1 rounded" }, "{{ctx.processedData}}"), " \u2192 from script node"))), /* @__PURE__ */ import_react14.default.createElement("div", null, /* @__PURE__ */ import_react14.default.createElement("span", { className: "font-medium text-slate-700" }, "Completion Status:"), /* @__PURE__ */ import_react14.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, /* @__PURE__ */ import_react14.default.createElement("strong", null, "Success:"), " Normal completion \u2022 ", /* @__PURE__ */ import_react14.default.createElement("strong", null, "Failure:"), " Ended with error \u2022 ", /* @__PURE__ */ import_react14.default.createElement("strong", null, "Cancelled:"), " Manual stop")), /* @__PURE__ */ import_react14.default.createElement("div", null, /* @__PURE__ */ import_react14.default.createElement("span", { className: "font-medium text-slate-700" }, "Multiple End Nodes:"), /* @__PURE__ */ import_react14.default.createElement("div", { className: "ml-3 mt-0.5 text-slate-500" }, "You can have multiple End nodes for different outcomes (e.g., success/failure branches)."))), /* @__PURE__ */ import_react14.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    "Save"
  )));
};
var EndNode = (0, import_react14.memo)(({ id, data, isConnectable }) => {
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
          bgColor: "bg-green-50",
          borderColor: "border-green-100",
          textColor: "text-green-500",
          hoverBorder: "hover:border-green-400",
          handleColor: "#22c55e",
          icon: import_fa4.FaCheck,
          label: "Success"
        };
      case END_STATUS.FAILURE:
        return {
          color: "red",
          bgColor: "bg-red-50",
          borderColor: "border-red-100",
          textColor: "text-red-500",
          hoverBorder: "hover:border-red-400",
          handleColor: "#ef4444",
          icon: import_fa4.FaTimes,
          label: "Failure"
        };
      case END_STATUS.CANCELLED:
        return {
          color: "amber",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-100",
          textColor: "text-amber-500",
          hoverBorder: "hover:border-amber-400",
          handleColor: "#f59e0b",
          icon: import_fa4.FaExclamationTriangle,
          label: "Cancelled"
        };
      default:
        return {
          color: "slate",
          bgColor: "bg-slate-50",
          borderColor: "border-slate-100",
          textColor: "text-slate-500",
          hoverBorder: "hover:border-slate-400",
          handleColor: "#94a3b8",
          icon: import_vsc7.VscDebugStop,
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
        return "border-slate-200";
    }
  };
  const ExecutionIndicator = () => {
    if (executionStatus === "running") {
      return /* @__PURE__ */ import_react14.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10" }, /* @__PURE__ */ import_react14.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react14.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" })));
    }
    if (executionStatus === "completed") {
      return /* @__PURE__ */ import_react14.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ import_react14.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react14.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    }
    if (executionStatus === "failed") {
      return /* @__PURE__ */ import_react14.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ import_react14.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react14.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    }
    return null;
  };
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  return /* @__PURE__ */ import_react14.default.createElement("div", { className: `
      relative bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${getExecutionStatusStyles()} ${statusConfig.hoverBorder} hover:shadow-md
    ` }, /* @__PURE__ */ import_react14.default.createElement(ExecutionIndicator, null), /* @__PURE__ */ import_react14.default.createElement(
    import_reactflow7.Handle,
    {
      type: "target",
      position: import_reactflow7.Position.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: statusConfig.handleColor,
        border: "none",
        top: "-5px"
      }
    }
  ), /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ import_react14.default.createElement(
    "div",
    {
      style: {
        borderTopLeftRadius: "0.25rem",
        borderBottomLeftRadius: "0.25rem"
      },
      className: `
            flex flex-col items-center justify-center px-3 py-3 border-r
            ${executionStatus === "running" ? "bg-blue-100 border-blue-200" : executionStatus === "completed" ? "bg-green-100 border-green-200" : executionStatus === "failed" ? "bg-red-50 border-red-100" : `${statusConfig.bgColor} ${statusConfig.borderColor}`}
          `
    },
    /* @__PURE__ */ import_react14.default.createElement(StatusIcon, { className: `w-5 h-5 ${executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : statusConfig.textColor}` })
  ), /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ import_react14.default.createElement("span", { className: "text-xs font-semibold truncate text-slate-700" }, data?.title || "End"), /* @__PURE__ */ import_react14.default.createElement("span", { className: `text-xs font-medium px-1.5 py-0.5 rounded border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}` }, statusConfig.label)), /* @__PURE__ */ import_react14.default.createElement("div", { className: "text-[10px] mt-0.5 text-slate-400" }, outputCount === 0 ? "No outputs defined" : `${outputCount} output${outputCount !== 1 ? "s" : ""}: ${outputParams.slice(0, 3).map((p) => p.name).join(", ")}${outputCount > 3 ? "..." : ""}`)), /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: `w-2 h-2 rounded-full`, style: { backgroundColor: statusConfig.handleColor }, title: statusConfig.label }))));
});

// src/map.js
var import_react16 = __toESM(require("react"));
var WORKFLOW_NODE_TYPES = {
  START: { value: "start", label: "Start" },
  DATA_QUERY: { value: "dataQuery", label: "Data Query" },
  JAVASCRIPT: { value: "javascript", label: "Javascript" },
  CONDITION: { value: "condition", label: "Condition" },
  LOOP: { value: "loop", label: "Loop" },
  DELAY: { value: "delay", label: "Delay" },
  END: { value: "end", label: "End" }
};
var WORKFLOW_NODES_MAP = {
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
      batchSize: 1,
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
        batchSize: { type: "integer", title: "Batch Size", minimum: 1, maximum: 100, default: 1 },
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
            { type: "Control", scope: "#/properties/batchSize" },
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

// src/StatusIndicator.jsx
var import_react17 = __toESM(require("react"));
var import_tb5 = require("react-icons/tb");
var StatusIndicator = ({ executionStatus }) => {
  if (executionStatus === "running") {
    return /* @__PURE__ */ import_react17.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10" }, /* @__PURE__ */ import_react17.default.createElement(import_tb5.TbRefresh, { className: "w-3 h-3 text-white" }));
  }
  if (executionStatus === "completed") {
    return /* @__PURE__ */ import_react17.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ import_react17.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react17.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
  }
  if (executionStatus === "failed") {
    return /* @__PURE__ */ import_react17.default.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ import_react17.default.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ import_react17.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
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
      return `border-slate-200 hover:border-${defaultHoverColor} hover:shadow-md`;
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
      return "bg-blue-100 border-blue-200";
    case "completed":
      return "bg-green-50 border-green-100";
    case "failed":
      return "bg-red-50 border-red-100";
    default:
      return defaultBg;
  }
};
//# sourceMappingURL=index.cjs.map
