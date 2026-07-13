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
  BezierEdge: () => BezierEdge,
  DeletableEdge: () => DeletableEdge,
  ErrorEdge: () => ErrorEdge,
  SimpleBezierEdge: () => SimpleBezierEdge,
  SmoothStepEdge: () => SmoothStepEdge,
  StepEdge: () => StepEdge,
  StraightEdge: () => StraightEdge,
  WORKFLOW_EDGES_MAP: () => WORKFLOW_EDGES_MAP,
  WorkflowEdgeContext: () => WorkflowEdgeContext
});
module.exports = __toCommonJS(index_exports);
var import_react4 = __toESM(require("react"));

// src/edges/DeletableEdge.jsx
var import_react2 = __toESM(require("react"));
var import_reactflow = require("reactflow");

// src/context.js
var import_react = require("react");
var WorkflowEdgeContext = (0, import_react.createContext)({
  deleteEdge: () => {
  },
  updateEdge: () => {
  }
});
var useWorkflowEdge = () => (0, import_react.useContext)(WorkflowEdgeContext);

// src/edges/DeletableEdge.jsx
var import_ui = require("@jet-admin/ui");
function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
  pathType = "smoothstep"
  // Default to smoothstep for best appearance
}) {
  const { deleteEdge, updateEdge } = useWorkflowEdge();
  const getPath = () => {
    const pathParams = {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    };
    switch (pathType) {
      case "straight":
        return (0, import_reactflow.getStraightPath)(pathParams);
      case "step":
        return (0, import_reactflow.getSmoothStepPath)({ ...pathParams, borderRadius: 0 });
      case "smoothstep":
        return (0, import_reactflow.getSmoothStepPath)(pathParams);
      case "simplebezier":
        return (0, import_reactflow.getSimpleBezierPath)(pathParams);
      case "bezier":
      case "default":
      default:
        return (0, import_reactflow.getBezierPath)(pathParams);
    }
  };
  const [edgePath, labelX, labelY] = getPath();
  const [isEditing, setIsEditing] = (0, import_react2.useState)(false);
  const [edgeLabel, setEdgeLabel] = (0, import_react2.useState)(label || data?.label || "");
  const onEdgeClick = (evt) => {
    evt.stopPropagation();
    setIsEditing(true);
  };
  const onDeleteClick = (evt) => {
    evt.stopPropagation();
    if (deleteEdge) {
      deleteEdge(id);
    }
  };
  const onLabelChange = (evt) => {
    setEdgeLabel(evt.target.value);
  };
  const onLabelBlur = () => {
    setIsEditing(false);
    if (updateEdge) {
      updateEdge(id, { label: edgeLabel, data: { ...data, label: edgeLabel } });
    }
  };
  const onKeyDown = (evt) => {
    if (evt.key === "Enter") {
      onLabelBlur();
    }
  };
  return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(import_reactflow.BaseEdge, { path: edgePath, markerEnd, style }), /* @__PURE__ */ import_react2.default.createElement(import_reactflow.EdgeLabelRenderer, null, /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      style: {
        position: "absolute",
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        pointerEvents: "all"
      },
      className: "nodrag nopan"
    },
    isEditing ? /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Input,
      {
        autoFocus: true,
        value: edgeLabel,
        onChange: onLabelChange,
        onBlur: onLabelBlur,
        onKeyDown,
        className: "text-xs border border-brand-border rounded px-1 py-0.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-brand-black min-w-[60px] text-brand-text-primary placeholder:text-brand-text-primary",
        placeholder: "Name edge"
      }
    ) : /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center gap-1 group" }, /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Button,
      {
        className: "w-5 h-5 bg-brand-black border border-brand-border rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors text-brand-text-primary hover:text-red-500 text-[10px]",
        onClick: onDeleteClick,
        title: "Delete Edge"
      },
      "\u2702"
    ), /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        onClick: onEdgeClick,
        className: `px-1.5 py-0.5 rounded bg-brand-black border border-brand-border text-[10px] text-brand-text-primary shadow-sm cursor-text hover:border-blue-300 transition-colors ${!edgeLabel ? "opacity-50 hover:opacity-100" : ""}`
      },
      edgeLabel || "Name edge"
    ))
  )));
}

// src/edges/ErrorEdge.jsx
var import_react3 = __toESM(require("react"));
function ErrorEdge(props) {
  return /* @__PURE__ */ import_react3.default.createElement(
    DeletableEdge,
    {
      ...props,
      style: { ...props.style, stroke: "#ef4444", strokeWidth: 2 }
    }
  );
}

// src/index.js
var SmoothStepEdge = (props) => /* @__PURE__ */ import_react4.default.createElement(DeletableEdge, { ...props, pathType: "smoothstep" });
var StraightEdge = (props) => /* @__PURE__ */ import_react4.default.createElement(DeletableEdge, { ...props, pathType: "straight" });
var StepEdge = (props) => /* @__PURE__ */ import_react4.default.createElement(DeletableEdge, { ...props, pathType: "step" });
var BezierEdge = (props) => /* @__PURE__ */ import_react4.default.createElement(DeletableEdge, { ...props, pathType: "bezier" });
var SimpleBezierEdge = (props) => /* @__PURE__ */ import_react4.default.createElement(DeletableEdge, { ...props, pathType: "simplebezier" });
var WORKFLOW_EDGES_MAP = {
  // Default bezier edge
  default: {
    value: "default",
    label: "Bezier (Curved)",
    component: BezierEdge
  },
  // Smooth step edge (rounded corners)
  smoothstep: {
    value: "smoothstep",
    label: "Smooth Step",
    component: SmoothStepEdge
  },
  // Straight edge
  straight: {
    value: "straight",
    label: "Straight",
    component: StraightEdge
  },
  // Step edge (sharp corners)
  step: {
    value: "step",
    label: "Step",
    component: StepEdge
  },
  // Simple bezier edge
  simplebezier: {
    value: "simplebezier",
    label: "Simple Bezier",
    component: SimpleBezierEdge
  },
  // Error edge (red, for error handles)
  error: {
    value: "error",
    label: "Error",
    component: ErrorEdge
  },
  // Deletable is an alias for default
  deletable: {
    value: "deletable",
    label: "Deletable",
    component: BezierEdge
  }
};
//# sourceMappingURL=index.cjs.map
