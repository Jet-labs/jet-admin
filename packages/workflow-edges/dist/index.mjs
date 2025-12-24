// src/edges/DeletableEdge.jsx
import React, { useState } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "reactflow";

// src/context.js
import { createContext, useContext } from "react";
var WorkflowEdgeContext = createContext({
  deleteEdge: () => {
  },
  updateEdge: () => {
  }
});
var useWorkflowEdge = () => useContext(WorkflowEdgeContext);

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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  const [isEditing, setIsEditing] = useState(false);
  const [edgeLabel, setEdgeLabel] = useState(label || data?.label || "");
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
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(BaseEdge, { path: edgePath, markerEnd, style }), /* @__PURE__ */ React.createElement(EdgeLabelRenderer, null, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        position: "absolute",
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        pointerEvents: "all"
      },
      className: "nodrag nopan"
    },
    isEditing ? /* @__PURE__ */ React.createElement(
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
    ) : /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 group" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors text-slate-400 hover:text-red-500 text-[10px]",
        onClick: onDeleteClick,
        title: "Delete Edge"
      },
      "\u2702"
    ), /* @__PURE__ */ React.createElement(
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
import React2 from "react";
function ErrorEdge(props) {
  return /* @__PURE__ */ React2.createElement(
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
export {
  DeletableEdge,
  ErrorEdge,
  WORKFLOW_EDGES_MAP,
  WorkflowEdgeContext
};
//# sourceMappingURL=index.mjs.map
