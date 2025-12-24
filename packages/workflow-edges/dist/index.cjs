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
  DeletableEdge: () => DeletableEdge,
  ErrorEdge: () => ErrorEdge,
  WORKFLOW_EDGES_MAP: () => WORKFLOW_EDGES_MAP,
  WorkflowEdgeContext: () => WorkflowEdgeContext
});
module.exports = __toCommonJS(index_exports);

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
  data
}) {
  const { deleteEdge, updateEdge } = useWorkflowEdge();
  const [edgePath, labelX, labelY] = (0, import_reactflow.getBezierPath)({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
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
      "input",
      {
        autoFocus: true,
        value: edgeLabel,
        onChange: onLabelChange,
        onBlur: onLabelBlur,
        onKeyDown,
        className: "text-xs border border-slate-300 rounded px-1 py-0.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[60px] text-slate-900 placeholder:text-slate-400",
        placeholder: "Name edge"
      }
    ) : /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center gap-1 group" }, /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        className: "w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors text-slate-400 hover:text-red-500 text-[10px]",
        onClick: onDeleteClick,
        title: "Delete Edge"
      },
      "\u2702"
    ), /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        onClick: onEdgeClick,
        className: `px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-500 shadow-sm cursor-text hover:border-blue-300 transition-colors ${!edgeLabel ? "opacity-50 hover:opacity-100" : ""}`
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
var WORKFLOW_EDGES_MAP = {
  default: {
    value: "default",
    label: "Default",
    component: DeletableEdge
  },
  deletable: {
    value: "deletable",
    label: "Deletable",
    component: DeletableEdge
  },
  error: {
    value: "error",
    label: "Error",
    component: ErrorEdge
  }
};
//# sourceMappingURL=index.cjs.map
