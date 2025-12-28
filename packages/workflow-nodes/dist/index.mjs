// src/nodes/conditionNode.jsx
import React4, { memo, useState, useEffect, useMemo, useCallback } from "react";
import { Handle, Position } from "reactflow";
import { JsonForms } from "@jsonforms/react";

// src/context.jsx
import React, { createContext, useContext } from "react";
var WorkflowNodesContext = createContext(null);
var NODE_EXECUTION_STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  SKIPPED: "skipped"
};
var WorkflowNodesProvider = ({
  children,
  dataQueries,
  strings = {},
  onRefreshDataQueries,
  workflowNodes = [],
  nodeExecutionStatus = {}
  // Map of nodeId -> status
}) => {
  return /* @__PURE__ */ React.createElement(WorkflowNodesContext.Provider, { value: {
    dataQueries,
    strings,
    onRefreshDataQueries,
    workflowNodes,
    nodeExecutionStatus
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

// ../../node_modules/react-icons/lib/iconBase.mjs
import React3 from "react";

// ../../node_modules/react-icons/lib/iconContext.mjs
import React2 from "react";
var DefaultContext = {
  color: void 0,
  size: void 0,
  className: void 0,
  style: void 0,
  attr: void 0
};
var IconContext = React2.createContext && /* @__PURE__ */ React2.createContext(DefaultContext);

// ../../node_modules/react-icons/lib/iconBase.mjs
var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /* @__PURE__ */ React3.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return (props) => /* @__PURE__ */ React3.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = (conf) => {
    var {
      attr,
      size,
      title
    } = props, svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /* @__PURE__ */ React3.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /* @__PURE__ */ React3.createElement("title", null, title), props.children);
  };
  return IconContext !== void 0 ? /* @__PURE__ */ React3.createElement(IconContext.Consumer, null, (conf) => elem(conf)) : elem(DefaultContext);
}

// ../../node_modules/react-icons/tb/index.mjs
function TbLogicAnd(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M22 12h-5" }, "child": [] }, { "tag": "path", "attr": { "d": "M2 9h5" }, "child": [] }, { "tag": "path", "attr": { "d": "M2 15h5" }, "child": [] }, { "tag": "path", "attr": { "d": "M9 5c6 0 8 3.5 8 7s-2 7 -8 7h-2v-14h2z" }, "child": [] }] })(props);
}
function TbRefresh(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" }, "child": [] }, { "tag": "path", "attr": { "d": "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" }, "child": [] }] })(props);
}
function TbRepeat(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" }, "child": [] }, { "tag": "path", "attr": { "d": "M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" }, "child": [] }] })(props);
}

// ../../node_modules/react-icons/vsc/index.mjs
function VscDebugDisconnect(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 16 16", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "fillRule": "evenodd", "clipRule": "evenodd", "d": "M13.617 3.844a2.87 2.87 0 0 0-.451-.868l1.354-1.36L13.904 1l-1.36 1.354a2.877 2.877 0 0 0-.868-.452 3.073 3.073 0 0 0-2.14.075 3.03 3.03 0 0 0-.991.664L7 4.192l4.327 4.328 1.552-1.545c.287-.287.508-.618.663-.992a3.074 3.074 0 0 0 .075-2.14zm-.889 1.804a2.15 2.15 0 0 1-.471.705l-.93.93-3.09-3.09.93-.93a2.15 2.15 0 0 1 .704-.472 2.134 2.134 0 0 1 1.689.007c.264.114.494.271.69.472.2.195.358.426.472.69a2.134 2.134 0 0 1 .007 1.688zm-4.824 4.994l1.484-1.545-.616-.622-1.49 1.551-1.86-1.859 1.491-1.552L6.291 6 4.808 7.545l-.616-.615-1.551 1.545a3 3 0 0 0-.663.998 3.023 3.023 0 0 0-.233 1.169c0 .332.05.656.15.97.105.31.258.597.459.862L1 13.834l.615.615 1.36-1.353c.265.2.552.353.862.458.314.1.638.15.97.15.406 0 .796-.077 1.17-.232.378-.155.71-.376.998-.663l1.545-1.552-.616-.615zm-2.262 2.023a2.16 2.16 0 0 1-.834.164c-.301 0-.586-.057-.855-.17a2.278 2.278 0 0 1-.697-.466 2.28 2.28 0 0 1-.465-.697 2.167 2.167 0 0 1-.17-.854 2.16 2.16 0 0 1 .642-1.545l.93-.93 3.09 3.09-.93.93a2.22 2.22 0 0 1-.711.478z" }, "child": [] }] })(props);
}
function VscDebugStart(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 16 16", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "fillRule": "evenodd", "clipRule": "evenodd", "d": "M4.25 3l1.166-.624 8 5.333v1.248l-8 5.334-1.166-.624V3zm1.5 1.401v7.864l5.898-3.932L5.75 4.401z" }, "child": [] }] })(props);
}
function VscDebugStop(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 16 16", "fill": "currentColor" }, "child": [{ "tag": "path", "attr": { "fillRule": "evenodd", "clipRule": "evenodd", "d": "M13 1.99976L14 2.99976V12.9998L13 13.9998H3L2 12.9998L2 2.99976L3 1.99976H13ZM12.7461 3.25057L3.25469 3.25057L3.25469 12.7504H12.7461V3.25057Z" }, "child": [] }] })(props);
}

// ../../node_modules/react-icons/fa/index.mjs
function FaJs(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 448 512" }, "child": [{ "tag": "path", "attr": { "d": "M0 32v448h448V32H0zm243.8 349.4c0 43.6-25.6 63.5-62.9 63.5-33.7 0-53.2-17.4-63.2-38.5l34.3-20.7c6.6 11.7 12.6 21.6 27.1 21.6 13.8 0 22.6-5.4 22.6-26.5V237.7h42.1v143.7zm99.6 63.5c-39.1 0-64.4-18.6-76.7-43l34.3-19.8c9 14.7 20.8 25.6 41.5 25.6 17.4 0 28.6-8.7 28.6-20.8 0-14.4-11.4-19.5-30.7-28l-10.5-4.5c-30.4-12.9-50.5-29.2-50.5-63.5 0-31.6 24.1-55.6 61.6-55.6 26.8 0 46 9.3 59.8 33.7L368 290c-7.2-12.9-15-18-27.1-18-12.3 0-20.1 7.8-20.1 18 0 12.6 7.8 17.7 25.9 25.6l10.5 4.5c35.8 15.3 55.9 31 55.9 66.2 0 37.8-29.8 58.6-69.7 58.6z" }, "child": [] }] })(props);
}
function FaCheck(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" }, "child": [] }] })(props);
}
function FaExclamationTriangle(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 576 512" }, "child": [{ "tag": "path", "attr": { "d": "M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z" }, "child": [] }] })(props);
}
function FaPlus(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 448 512" }, "child": [{ "tag": "path", "attr": { "d": "M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" }, "child": [] }] })(props);
}
function FaTimes(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 352 512" }, "child": [{ "tag": "path", "attr": { "d": "M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" }, "child": [] }] })(props);
}
function FaTrash(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 448 512" }, "child": [{ "tag": "path", "attr": { "d": "M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z" }, "child": [] }] })(props);
}

// ../../node_modules/react-icons/io/index.mjs
function IoMdArrowDropdown(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M128 192l128 128 128-128z" }, "child": [] }] })(props);
}
function IoMdArrowDropleft(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M320 128L192 256l128 128z" }, "child": [] }] })(props);
}
function IoMdArrowDropright(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M192 128l128 128-128 128z" }, "child": [] }] })(props);
}
function IoMdArrowDropup(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M128 320l128-128 128 128z" }, "child": [] }] })(props);
}
function IoMdTime(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "g", "attr": { "fillOpacity": ".9" }, "child": [{ "tag": "path", "attr": { "d": "M255.8 48C141 48 48 141.2 48 256s93 208 207.8 208c115 0 208.2-93.2 208.2-208S370.8 48 255.8 48zm.2 374.4c-91.9 0-166.4-74.5-166.4-166.4S164.1 89.6 256 89.6 422.4 164.1 422.4 256 347.9 422.4 256 422.4z" }, "child": [] }, { "tag": "path", "attr": { "d": "M266.4 152h-31.2v124.8l109.2 65.5 15.6-25.6-93.6-55.5V152z" }, "child": [] }] }] })(props);
}

// src/nodes/conditionNode.jsx
var ERROR_HANDLING_OPTIONS = {
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
  const availableVariables = useMemo(() => {
    if (!workflowNodes) return [];
    return workflowNodes.filter((n) => n.id !== currentNodeId && n.data?.outputVariable).map((n) => ({
      nodeId: n.id,
      nodeTitle: n.data?.title || n.type,
      variable: n.data.outputVariable
    }));
  }, [workflowNodes, currentNodeId]);
  return /* @__PURE__ */ React4.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React4.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React4.createElement("label", { className: "text-xs font-medium text-slate-500" }, "Condition Branches"), /* @__PURE__ */ React4.createElement(
    "button",
    {
      type: "button",
      onClick: addBranch,
      className: "flex items-center gap-1 px-2 py-1 text-xs bg-white text-[#646cff] hover:bg-[#646cff]/10 rounded transition-colors border border-slate-200"
    },
    /* @__PURE__ */ React4.createElement(FaPlus, { className: "w-2.5 h-2.5" }),
    "Add Branch"
  )), availableVariables.length > 0 && /* @__PURE__ */ React4.createElement("p", { className: "text-[10px] text-slate-400" }, "Available: ", availableVariables.map((v) => `ctx.${v.variable}`).join(", ")), /* @__PURE__ */ React4.createElement("div", { className: "space-y-2" }, branches.map((branch, index) => /* @__PURE__ */ React4.createElement(
    "div",
    {
      key: branch.id,
      className: "border border-slate-200 rounded p-2 bg-slate-50"
    },
    /* @__PURE__ */ React4.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React4.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React4.createElement("span", { className: "w-5 h-5 flex items-center justify-center bg-purple-100 text-purple-600 text-[10px] font-bold rounded" }, index + 1), /* @__PURE__ */ React4.createElement(
      "input",
      {
        type: "text",
        value: branch.name,
        onChange: (e) => updateBranch(index, "name", e.target.value),
        className: "text-xs font-medium text-slate-700 bg-transparent border-none outline-none w-24",
        placeholder: "Branch name"
      }
    )), /* @__PURE__ */ React4.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveBranch(index, -1),
        disabled: index === 0,
        className: "p-1 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors",
        title: "Move up"
      },
      /* @__PURE__ */ React4.createElement(IoMdArrowDropup, { className: "w-3 h-3" })
    ), /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveBranch(index, 1),
        disabled: index === branches.length - 1,
        className: "p-1 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors",
        title: "Move down"
      },
      /* @__PURE__ */ React4.createElement(IoMdArrowDropdown, { className: "w-3 h-3" })
    ), /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeBranch(index),
        disabled: branches.length <= 1,
        className: "p-1 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-30 transition-colors",
        title: "Remove branch"
      },
      /* @__PURE__ */ React4.createElement(FaTrash, { className: "w-3 h-3" })
    ))),
    /* @__PURE__ */ React4.createElement("div", { className: "mb-2" }, /* @__PURE__ */ React4.createElement(
      "select",
      {
        value: branch.conditionType,
        onChange: (e) => updateBranch(index, "conditionType", e.target.value),
        className: "w-full text-xs p-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:border-[#646cff]"
      },
      /* @__PURE__ */ React4.createElement("option", { value: CONDITION_TYPES.EXPRESSION }, "JavaScript Expression"),
      /* @__PURE__ */ React4.createElement("option", { value: CONDITION_TYPES.EQUALS }, "Equals (==)"),
      /* @__PURE__ */ React4.createElement("option", { value: CONDITION_TYPES.NOT_EQUALS }, "Not Equals (!=)"),
      /* @__PURE__ */ React4.createElement("option", { value: CONDITION_TYPES.CONTAINS }, "Contains"),
      /* @__PURE__ */ React4.createElement("option", { value: CONDITION_TYPES.GREATER_THAN }, "Greater Than (>)"),
      /* @__PURE__ */ React4.createElement("option", { value: CONDITION_TYPES.LESS_THAN }, "Less Than (<)"),
      /* @__PURE__ */ React4.createElement("option", { value: CONDITION_TYPES.IS_EMPTY }, "Is Empty"),
      /* @__PURE__ */ React4.createElement("option", { value: CONDITION_TYPES.IS_NOT_EMPTY }, "Is Not Empty"),
      /* @__PURE__ */ React4.createElement("option", { value: CONDITION_TYPES.REGEX }, "Regex Match")
    )),
    branch.conditionType === CONDITION_TYPES.EXPRESSION ? /* @__PURE__ */ React4.createElement(
      "textarea",
      {
        value: branch.expression || "",
        onChange: (e) => updateBranch(index, "expression", e.target.value),
        placeholder: "ctx.value === true",
        className: "w-full text-xs p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff] resize-none",
        rows: 2
      }
    ) : branch.conditionType === CONDITION_TYPES.IS_EMPTY || branch.conditionType === CONDITION_TYPES.IS_NOT_EMPTY ? /* @__PURE__ */ React4.createElement(
      "input",
      {
        type: "text",
        value: branch.leftOperand || "",
        onChange: (e) => updateBranch(index, "leftOperand", e.target.value),
        placeholder: "ctx.variableName",
        className: "w-full text-xs p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
      }
    ) : /* @__PURE__ */ React4.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React4.createElement(
      "input",
      {
        type: "text",
        value: branch.leftOperand || "",
        onChange: (e) => updateBranch(index, "leftOperand", e.target.value),
        placeholder: "ctx.variableName",
        className: "flex-1 text-xs p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
      }
    ), /* @__PURE__ */ React4.createElement(
      "input",
      {
        type: "text",
        value: branch.rightOperand || "",
        onChange: (e) => updateBranch(index, "rightOperand", e.target.value),
        placeholder: "value",
        className: "flex-1 text-xs p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
      }
    ))
  ))), /* @__PURE__ */ React4.createElement("div", { className: "border border-dashed border-slate-300 rounded p-2 bg-slate-50/50" }, /* @__PURE__ */ React4.createElement("div", { className: "flex items-center gap-2 text-xs text-slate-500" }, /* @__PURE__ */ React4.createElement("span", { className: "w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-600 text-[10px] font-bold rounded" }, "\u2205"), /* @__PURE__ */ React4.createElement("span", { className: "font-medium" }, "Default (else)"), /* @__PURE__ */ React4.createElement("span", { className: "text-slate-400" }, "- Used when no conditions match"))));
};
var ConditionNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
  const [formData, setFormData] = useState({
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
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false
  });
  useEffect(() => {
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
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false
      });
    }
  }, [data]);
  const schema = useMemo(() => {
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
          enum: Object.values(ERROR_HANDLING_OPTIONS)
        },
        isDisabled: {
          type: "boolean",
          title: strings?.WORKFLOW_EDITOR_IS_DISABLED_LABEL || "Skip this node",
          default: false
        }
      }
    };
  }, [strings]);
  const uischema = useMemo(() => {
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
                  [ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW]: "Fail Workflow on Error",
                  [ERROR_HANDLING_OPTIONS.CONTINUE_DEFAULT]: "Continue to Default Branch on Error"
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
  const handleFormChange = useCallback(({ data: newData }) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);
  const handleBranchesChange = useCallback((newBranches) => {
    setFormData((prev) => ({ ...prev, branches: newBranches }));
  }, []);
  const handleSave = useCallback(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ React4.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ React4.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React4.createElement(
    JsonForms,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React4.createElement("div", { className: "border-t border-slate-100 pt-4" }, /* @__PURE__ */ React4.createElement(
    ConditionBranchEditor,
    {
      branches: formData.branches,
      onChange: handleBranchesChange,
      workflowNodes,
      currentNodeId: nodeId
    }
  )), /* @__PURE__ */ React4.createElement(
    "button",
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    strings?.WORKFLOW_EDITOR_CONDITION_NODE_SAVE_BUTTON || "Save"
  )));
};
var ConditionNode = memo(({ data, isConnectable }) => {
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
  return /* @__PURE__ */ React4.createElement("div", { className: `
      bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled ? "border-slate-200 opacity-50" : "border-slate-200 hover:border-purple-400 hover:shadow-md"}
    ` }, /* @__PURE__ */ React4.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React4.createElement(
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
    /* @__PURE__ */ React4.createElement(TbLogicAnd, { className: `w-5 h-5 ${isDisabled ? "text-slate-400" : "text-purple-500"}` })
  ), /* @__PURE__ */ React4.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React4.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React4.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-slate-400 line-through" : "text-slate-700"}` }, data?.title || "Condition"), isDisabled && /* @__PURE__ */ React4.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200" }, /* @__PURE__ */ React4.createElement(VscDebugDisconnect, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ React4.createElement("div", { className: `text-[10px] mt-0.5 ${isDisabled ? "text-slate-300" : "text-slate-400"}` }, branchCount, " branch", branchCount !== 1 ? "es" : "", " + default"), /* @__PURE__ */ React4.createElement("div", { className: "mt-1 space-y-0.5" }, branches.slice(0, 3).map((branch, index) => /* @__PURE__ */ React4.createElement(
    "div",
    {
      key: branch.id,
      className: `flex items-center gap-1 text-[9px] ${isDisabled ? "text-slate-300" : "text-slate-500"}`
    },
    /* @__PURE__ */ React4.createElement(IoMdArrowDropright, { className: "w-3 h-3 text-purple-400 flex-shrink-0" }),
    /* @__PURE__ */ React4.createElement("span", { className: "truncate font-medium" }, branch.name, ":"),
    /* @__PURE__ */ React4.createElement("span", { className: "truncate font-mono opacity-75" }, getConditionPreview(branch))
  )), branches.length > 3 && /* @__PURE__ */ React4.createElement("div", { className: `text-[9px] ${isDisabled ? "text-slate-300" : "text-slate-400"}` }, "+", branches.length - 3, " more..."))), /* @__PURE__ */ React4.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100 min-w-[50px]" }, branches.slice(0, 4).map((branch, index) => /* @__PURE__ */ React4.createElement(
    "div",
    {
      key: branch.id,
      className: `w-2 h-2 rounded-full mb-0.5 ${isDisabled ? "bg-slate-300" : "bg-purple-400"}`,
      title: branch.name
    }
  )), branches.length > 4 && /* @__PURE__ */ React4.createElement("span", { className: "text-[8px] text-slate-400" }, "+", branches.length - 4), /* @__PURE__ */ React4.createElement("div", { className: `w-2 h-2 rounded-full mt-1 ${isDisabled ? "bg-slate-300" : "bg-slate-400"}`, title: "Default" }))), /* @__PURE__ */ React4.createElement(
    Handle,
    {
      type: "target",
      position: Position.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#a855f7",
        border: "none",
        top: "-5px"
      }
    }
  ), branches.map((branch, index) => /* @__PURE__ */ React4.createElement(
    Handle,
    {
      key: branch.id,
      type: "source",
      position: Position.Bottom,
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
  )), /* @__PURE__ */ React4.createElement(
    Handle,
    {
      type: "source",
      position: Position.Bottom,
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
  ), /* @__PURE__ */ React4.createElement(
    Handle,
    {
      type: "source",
      position: Position.Bottom,
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
import React5, { memo as memo2, useState as useState2, useEffect as useEffect2, useMemo as useMemo2, useCallback as useCallback2 } from "react";
import { Handle as Handle2, Position as Position2 } from "reactflow";
import { JsonForms as JsonForms2 } from "@jsonforms/react";

// ../../node_modules/react-icons/si/index.mjs
function SiQuantconnect(props) {
  return GenIcon({ "tag": "svg", "attr": { "role": "img", "viewBox": "0 0 24 24" }, "child": [{ "tag": "path", "attr": { "d": "M23.0673 16.6635a12.1084 12.1084 0 0 1-6.404 6.4046A12.0185 12.0185 0 0 1 12.0002 24v-2.7975a8.63 8.63 0 0 0 3.5454-.7466 9.4574 9.4574 0 0 0 2.9836-1.9273 11.3659 11.3659 0 0 0 1.9273-2.922 9.1472 9.1472 0 0 0 .7465-3.6064 8.6298 8.6298 0 0 0-.7465-3.5454 8.9285 8.9285 0 0 0-4.9109-4.9122 9.5282 9.5282 0 0 0-7.091 0 9.4798 9.4798 0 0 0-4.9108 4.9122A9.7584 9.7584 0 0 0 2.7977 12H.0003A12.0115 12.0115 0 0 1 .932 7.3375 12.093 12.093 0 0 1 7.336.9328a12.121 12.121 0 0 1 9.326 0 11.5066 11.5066 0 0 1 3.7923 2.609 11.4988 11.4988 0 0 1 2.613 3.7963 12.1232 12.1232 0 0 1 0 9.3254zM11.998 9.8868V7.0892a4.7884 4.7884 0 0 0-3.4826 1.4296 4.7089 4.7089 0 0 0-1.4911 3.482 4.609 4.609 0 0 0 1.4911 3.4779c1.8316 1.923 4.8752 1.9972 6.7983.1656a4.7631 4.7631 0 0 0 .1656-.1656 4.34 4.34 0 0 0 1.4296-3.4786h-2.7976a2.0583 2.0583 0 0 1-.6215 1.4918 2.0189 2.0189 0 0 1-1.4918.6221c-1.1653-.0051-2.1088-.9485-2.114-2.114a2.0199 2.0199 0 0 1 .6216-1.4917 2.0637 2.0637 0 0 1 1.4924-.6215zm5.972 8.0798a7.0439 7.0439 0 0 0 1.806-2.6759 7.4712 7.4712 0 0 0 .6838-3.2953 7.655 7.655 0 0 0-.6837-3.2953 8.453 8.453 0 0 0-4.4767-4.4767 7.4678 7.4678 0 0 0-3.2953-.6836v2.7976a5.3066 5.3066 0 0 1 3.979 1.6784 5.4031 5.4031 0 0 1 1.6784 3.979c-.0338 3.1246-2.5943 5.6303-5.719 5.5964-3.077-.0333-5.5632-2.5195-5.5965-5.5964H3.5484a8.4 8.4 0 0 0 .616 3.298 9.2912 9.2912 0 0 0 4.5397 4.5381 9.0414 9.0414 0 0 0 6.59 0 7.9963 7.9963 0 0 0 2.6758-1.8643z" }, "child": [] }] })(props);
}

// src/nodes/dataQueryNode.jsx
var ERROR_HANDLING_OPTIONS2 = {
  FAIL_WORKFLOW: "fail_workflow",
  CONTINUE: "continue",
  RETRY_THEN_CONTINUE: "retry_then_continue",
  RETRY_THEN_FAIL: "retry_then_fail"
};
var DataQueryNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { dataQueries, strings, onRefreshDataQueries, workflowNodes } = useWorkflowNodes();
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
          description: "Variable name to store result (accessible as ctx.{name})",
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
          enum: Object.values(ERROR_HANDLING_OPTIONS2)
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
  const uischema = useMemo2(() => {
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
                  [ERROR_HANDLING_OPTIONS2.FAIL_WORKFLOW]: "Fail Workflow",
                  [ERROR_HANDLING_OPTIONS2.CONTINUE]: "Continue (ignore error)",
                  [ERROR_HANDLING_OPTIONS2.RETRY_THEN_CONTINUE]: "Retry, then Continue",
                  [ERROR_HANDLING_OPTIONS2.RETRY_THEN_FAIL]: "Retry, then Fail"
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
  const handleFormChange = useCallback2(({ data: newData }) => {
    setFormData(newData);
  }, []);
  const handleSave = useCallback2(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ React5.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ React5.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React5.createElement(
    JsonForms2,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React5.createElement(
    "button",
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_SAVE_BUTTON || "Save"
  )));
};
var DataQueryNode = memo2(({ id, data, isConnectable }) => {
  const { dataQueries, strings, nodeExecutionStatus } = useWorkflowNodes();
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
      return /* @__PURE__ */ React5.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin" }, /* @__PURE__ */ React5.createElement(TbRefresh, { className: "w-3 h-3 text-white" }));
    }
    if (executionStatus === "completed") {
      return /* @__PURE__ */ React5.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ React5.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React5.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    }
    if (executionStatus === "failed") {
      return /* @__PURE__ */ React5.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ React5.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React5.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    }
    return null;
  };
  return /* @__PURE__ */ React5.createElement("div", { className: `
      relative bg-white border rounded
      min-w-[340px] max-w-[400px]
      transition-all duration-150
      ${isDisabled ? "border-slate-200 opacity-50" : getStatusStyles2()}
      ${!data.dataQueryID ? "!border-red-400 !bg-red-50" : ""}
    ` }, /* @__PURE__ */ React5.createElement(StatusIndicator2, null), /* @__PURE__ */ React5.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React5.createElement(
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
    /* @__PURE__ */ React5.createElement(SiQuantconnect, { className: `w-5 h-5 ${isDisabled ? "text-slate-400" : executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-blue-500"}` })
  ), /* @__PURE__ */ React5.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React5.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React5.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-slate-400 line-through" : "text-slate-700"}` }, data?.title || "Untitled"), isDisabled && /* @__PURE__ */ React5.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200" }, /* @__PURE__ */ React5.createElement(VscDebugDisconnect, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ React5.createElement("div", { className: `text-sm truncate mt-0.5 ${isDisabled ? "text-slate-300" : "text-slate-500"}` }, selectedQueryTitle.length > 20 ? `${String(selectedQueryTitle).substring(0, 20)}...` : selectedQueryTitle)), /* @__PURE__ */ React5.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ React5.createElement("div", { className: `w-2 h-2 rounded-full mb-1 ${isDisabled ? "bg-slate-300" : "bg-green-400"}`, title: "Success" }), /* @__PURE__ */ React5.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-slate-300" : "bg-red-400"}`, title: "Error" }))), /* @__PURE__ */ React5.createElement(
    Handle2,
    {
      type: "target",
      position: Position2.Top,
      isConnectable,
      style: {
        width: "10px",
        height: "10px",
        backgroundColor: isDisabled ? "#cbd5e1" : "#3b82f6",
        border: "none",
        top: "-5px"
      }
    }
  ), /* @__PURE__ */ React5.createElement(
    Handle2,
    {
      type: "source",
      position: Position2.Bottom,
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
  ), /* @__PURE__ */ React5.createElement(
    Handle2,
    {
      type: "source",
      position: Position2.Bottom,
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
import React6, { memo as memo3, useState as useState3, useEffect as useEffect3, useMemo as useMemo3, useCallback as useCallback3 } from "react";
import { Handle as Handle3, Position as Position3 } from "reactflow";
import { JsonForms as JsonForms3 } from "@jsonforms/react";
var ERROR_HANDLING_OPTIONS3 = {
  FAIL_WORKFLOW: "fail_workflow",
  CONTINUE: "continue",
  RETRY_THEN_CONTINUE: "retry_then_continue",
  RETRY_THEN_FAIL: "retry_then_fail"
};
var JavascriptNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
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
  return /* @__PURE__ */ React6.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ React6.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React6.createElement(
    JsonForms3,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React6.createElement(
    "button",
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
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
        return "border-slate-200 hover:border-yellow-400 hover:shadow-md";
    }
  };
  const StatusIndicator2 = () => {
    if (executionStatus === "running") {
      return /* @__PURE__ */ React6.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin" }, /* @__PURE__ */ React6.createElement(TbRefresh, { className: "w-3 h-3 text-white" }));
    }
    if (executionStatus === "completed") {
      return /* @__PURE__ */ React6.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ React6.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React6.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    }
    if (executionStatus === "failed") {
      return /* @__PURE__ */ React6.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" }, /* @__PURE__ */ React6.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React6.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    }
    return null;
  };
  return /* @__PURE__ */ React6.createElement("div", { className: `
      relative bg-white border rounded
      min-w-[340px] max-w-[400px]
      transition-all duration-150
      ${isDisabled ? "border-slate-200 opacity-50" : getStatusStyles2()}
      ${!data.code ? "!border-red-400 !bg-red-50" : ""}
    ` }, /* @__PURE__ */ React6.createElement(StatusIndicator2, null), /* @__PURE__ */ React6.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React6.createElement(
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
    /* @__PURE__ */ React6.createElement(FaJs, { className: `w-5 h-5 ${isDisabled ? "text-slate-400" : executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-yellow-500"}` })
  ), /* @__PURE__ */ React6.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React6.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React6.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-slate-400 line-through" : "text-slate-700"}` }, data?.title || "Untitled Script"), isDisabled && /* @__PURE__ */ React6.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200" }, /* @__PURE__ */ React6.createElement(VscDebugDisconnect, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ React6.createElement("div", { className: `text-[10px] font-mono truncate mt-0.5 ${isDisabled ? "text-slate-300" : "text-slate-400"}` }, codePreview)), /* @__PURE__ */ React6.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ React6.createElement("div", { className: `w-2 h-2 rounded-full mb-1 ${isDisabled ? "bg-slate-300" : "bg-green-400"}`, title: "Success" }), /* @__PURE__ */ React6.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-slate-300" : "bg-red-400"}`, title: "Error" }))), /* @__PURE__ */ React6.createElement(
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
  ), /* @__PURE__ */ React6.createElement(
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
  ), /* @__PURE__ */ React6.createElement(
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
import React7, { memo as memo4, useState as useState4, useEffect as useEffect4, useMemo as useMemo4, useCallback as useCallback4 } from "react";
import { Handle as Handle4, Position as Position4 } from "reactflow";
import { JsonForms as JsonForms4 } from "@jsonforms/react";
var PARAM_TYPES = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  OBJECT: "object",
  ARRAY: "array"
};
var InputParameterEditor = ({ parameters, onChange }) => {
  const addParameter = () => {
    const newParam = {
      id: `param_${Date.now()}`,
      name: `param${parameters.length + 1}`,
      type: PARAM_TYPES.STRING,
      required: false,
      defaultValue: "",
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
  return /* @__PURE__ */ React7.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React7.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React7.createElement("label", { className: "text-xs font-medium text-slate-500" }, "Input Parameters"), /* @__PURE__ */ React7.createElement(
    "button",
    {
      type: "button",
      onClick: addParameter,
      className: "flex items-center gap-1 px-2 py-1 text-xs bg-white text-[#646cff] hover:bg-[#646cff]/10 rounded transition-colors border border-slate-200"
    },
    /* @__PURE__ */ React7.createElement(FaPlus, { className: "w-2.5 h-2.5" }),
    "Add Parameter"
  )), /* @__PURE__ */ React7.createElement("p", { className: "text-[10px] text-slate-400" }, "Define inputs that will be available as ", /* @__PURE__ */ React7.createElement("code", { className: "bg-slate-100 px-1 rounded" }, "ctx.input.paramName")), parameters.length === 0 ? /* @__PURE__ */ React7.createElement("div", { className: "text-xs text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded" }, "No input parameters defined. Workflow can still be triggered.") : /* @__PURE__ */ React7.createElement("div", { className: "space-y-2" }, parameters.map((param, index) => /* @__PURE__ */ React7.createElement(
    "div",
    {
      key: param.id,
      className: "border border-slate-200 rounded p-2 bg-slate-50"
    },
    /* @__PURE__ */ React7.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React7.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React7.createElement(IoMdArrowDropright, { className: "w-3 h-3 text-green-500" }), /* @__PURE__ */ React7.createElement(
      "input",
      {
        type: "text",
        value: param.name,
        onChange: (e) => updateParameter(index, "name", e.target.value.replace(/[^a-zA-Z0-9_]/g, "")),
        className: "text-xs font-mono font-medium text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 w-28 focus:outline-none focus:border-[#646cff]",
        placeholder: "paramName"
      }
    )), /* @__PURE__ */ React7.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeParameter(index),
        className: "p-1 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors",
        title: "Remove parameter"
      },
      /* @__PURE__ */ React7.createElement(FaTrash, { className: "w-3 h-3" })
    )),
    /* @__PURE__ */ React7.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React7.createElement("div", null, /* @__PURE__ */ React7.createElement("label", { className: "text-[10px] text-slate-400" }, "Type"), /* @__PURE__ */ React7.createElement(
      "select",
      {
        value: param.type,
        onChange: (e) => updateParameter(index, "type", e.target.value),
        className: "w-full text-xs p-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:border-[#646cff]"
      },
      /* @__PURE__ */ React7.createElement("option", { value: PARAM_TYPES.STRING }, "String"),
      /* @__PURE__ */ React7.createElement("option", { value: PARAM_TYPES.NUMBER }, "Number"),
      /* @__PURE__ */ React7.createElement("option", { value: PARAM_TYPES.BOOLEAN }, "Boolean"),
      /* @__PURE__ */ React7.createElement("option", { value: PARAM_TYPES.OBJECT }, "Object"),
      /* @__PURE__ */ React7.createElement("option", { value: PARAM_TYPES.ARRAY }, "Array")
    )), /* @__PURE__ */ React7.createElement("div", null, /* @__PURE__ */ React7.createElement("label", { className: "text-[10px] text-slate-400" }, "Required"), /* @__PURE__ */ React7.createElement("div", { className: "flex items-center h-[30px]" }, /* @__PURE__ */ React7.createElement(
      "input",
      {
        type: "checkbox",
        checked: param.required,
        onChange: (e) => updateParameter(index, "required", e.target.checked),
        className: "w-4 h-4 text-[#646cff] rounded border-slate-300 focus:ring-[#646cff]"
      }
    ), /* @__PURE__ */ React7.createElement("span", { className: "text-xs text-slate-500 ml-2" }, param.required ? "Yes" : "No")))),
    /* @__PURE__ */ React7.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React7.createElement("label", { className: "text-[10px] text-slate-400" }, "Default Value"), /* @__PURE__ */ React7.createElement(
      "input",
      {
        type: "text",
        value: param.defaultValue,
        onChange: (e) => updateParameter(index, "defaultValue", e.target.value),
        placeholder: param.type === PARAM_TYPES.OBJECT ? "{}" : param.type === PARAM_TYPES.ARRAY ? "[]" : "",
        className: "w-full text-xs p-1.5 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
      }
    )),
    /* @__PURE__ */ React7.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React7.createElement("label", { className: "text-[10px] text-slate-400" }, "Description"), /* @__PURE__ */ React7.createElement(
      "input",
      {
        type: "text",
        value: param.description,
        onChange: (e) => updateParameter(index, "description", e.target.value),
        placeholder: "What is this parameter for?",
        className: "w-full text-xs p-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:border-[#646cff]"
      }
    ))
  ))));
};
var StartNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings } = useWorkflowNodes();
  const [formData, setFormData] = useState4({
    title: data?.title || "Start",
    description: data?.description || "",
    inputParameters: data?.inputParameters || []
  });
  useEffect4(() => {
    if (data) {
      setFormData({
        title: data.title || "Start",
        description: data.description || "",
        inputParameters: data.inputParameters || []
      });
    }
  }, [data]);
  const schema = useMemo4(() => {
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
  const uischema = useMemo4(() => {
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
  const handleFormChange = useCallback4(({ data: newData }) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);
  const handleParametersChange = useCallback4((newParams) => {
    setFormData((prev) => ({ ...prev, inputParameters: newParams }));
  }, []);
  const handleSave = useCallback4(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ React7.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ React7.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React7.createElement(
    JsonForms4,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React7.createElement("div", { className: "p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-600" }, /* @__PURE__ */ React7.createElement("strong", null, "Triggers:"), " Workflows can be started manually or via HTTP webhook (POST /api/workflows/:id/run)"), /* @__PURE__ */ React7.createElement("div", { className: "border-t border-slate-100 pt-4" }, /* @__PURE__ */ React7.createElement(
    InputParameterEditor,
    {
      parameters: formData.inputParameters,
      onChange: handleParametersChange
    }
  )), /* @__PURE__ */ React7.createElement(
    "button",
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    "Save"
  )));
};
var StartNode = memo4(({ id, data, isConnectable }) => {
  const { strings, nodeExecutionStatus } = useWorkflowNodes();
  const executionStatus = nodeExecutionStatus?.[id] || "idle";
  const inputParams = data?.inputParameters || [];
  const paramCount = inputParams.length;
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
      return /* @__PURE__ */ React7.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10" }, /* @__PURE__ */ React7.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React7.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" })));
    }
    if (executionStatus === "completed") {
      return /* @__PURE__ */ React7.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React7.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React7.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    }
    if (executionStatus === "failed") {
      return /* @__PURE__ */ React7.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React7.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React7.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    }
    return null;
  };
  return /* @__PURE__ */ React7.createElement("div", { className: `
      relative bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${getStatusStyles2()}
    ` }, /* @__PURE__ */ React7.createElement(StatusIndicator2, null), /* @__PURE__ */ React7.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React7.createElement("div", { style: {
    borderTopLeftRadius: "0.25rem",
    borderBottomLeftRadius: "0.25rem"
  }, className: `flex flex-col items-center justify-center px-3 py-3 border-r ${executionStatus === "running" ? "bg-blue-100 border-blue-200" : executionStatus === "completed" ? "bg-green-100 border-green-200" : executionStatus === "failed" ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}` }, /* @__PURE__ */ React7.createElement(VscDebugStart, { className: `w-5 h-5 ${executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : "text-green-500"}` })), /* @__PURE__ */ React7.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React7.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React7.createElement("span", { className: "text-xs font-semibold truncate text-slate-700" }, data?.title || "Start")), /* @__PURE__ */ React7.createElement("div", { className: "text-[10px] mt-0.5 text-slate-400" }, paramCount === 0 ? "No input parameters" : `${paramCount} input${paramCount !== 1 ? "s" : ""}: ${inputParams.slice(0, 3).map((p) => p.name).join(", ")}${paramCount > 3 ? "..." : ""}`), inputParams.some((p) => p.required) && /* @__PURE__ */ React7.createElement("div", { className: "text-[9px] mt-0.5 text-amber-500" }, "* Has required parameters")), /* @__PURE__ */ React7.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ React7.createElement("div", { className: "w-2 h-2 rounded-full bg-green-400", title: "Output" }))), /* @__PURE__ */ React7.createElement(
    Handle4,
    {
      type: "source",
      position: Position4.Bottom,
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
import React8, { memo as memo5, useState as useState5, useEffect as useEffect5, useMemo as useMemo5, useCallback as useCallback5 } from "react";
import { Handle as Handle5, Position as Position5 } from "reactflow";
import { JsonForms as JsonForms5 } from "@jsonforms/react";
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
    batchSize: data?.batchSize ?? 1,
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
        batchSize: data.batchSize ?? 1,
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
  return /* @__PURE__ */ React8.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ React8.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React8.createElement(
    JsonForms5,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React8.createElement(
    "button",
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
    },
    "Save"
  )));
};
var LoopNode = memo5(({ data, isConnectable }) => {
  const { strings } = useWorkflowNodes();
  const isDisabled = data?.isDisabled ?? false;
  const sourceVariable = data?.sourceVariable || "ctx.array";
  const itemVariable = data?.itemVariable || "item";
  return /* @__PURE__ */ React8.createElement("div", { className: `
      bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled ? "border-slate-200 opacity-50" : "border-slate-200 hover:border-cyan-400 hover:shadow-md"}
      ${!data.sourceVariable ? "!border-red-400 !bg-red-50" : ""}
    ` }, /* @__PURE__ */ React8.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React8.createElement(
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
    /* @__PURE__ */ React8.createElement(TbRepeat, { className: `w-5 h-5 ${isDisabled ? "text-slate-400" : "text-cyan-500"}` })
  ), /* @__PURE__ */ React8.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React8.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React8.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-slate-400 line-through" : "text-slate-700"}` }, data?.title || "Loop"), isDisabled && /* @__PURE__ */ React8.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200" }, /* @__PURE__ */ React8.createElement(VscDebugDisconnect, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ React8.createElement("div", { className: `text-[10px] font-mono mt-0.5 ${isDisabled ? "text-slate-300" : "text-slate-400"}` }, "for (", itemVariable, " in ", sourceVariable.length > 20 ? sourceVariable.substring(0, 20) + "..." : sourceVariable, ")")), /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ React8.createElement("div", { className: `w-2 h-2 rounded-full mb-1 ${isDisabled ? "bg-slate-300" : "bg-cyan-400"}`, title: "Loop Body" }), /* @__PURE__ */ React8.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-slate-300" : "bg-green-400"}`, title: "Completed" }))), /* @__PURE__ */ React8.createElement(
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
  ), /* @__PURE__ */ React8.createElement(
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
  ), /* @__PURE__ */ React8.createElement(
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
import React9, { memo as memo6, useState as useState6, useEffect as useEffect6, useMemo as useMemo6, useCallback as useCallback6 } from "react";
import { Handle as Handle6, Position as Position6 } from "reactflow";
import { JsonForms as JsonForms6 } from "@jsonforms/react";
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
  const handleFormChange = useCallback6(({ data: newData }) => {
    setFormData(newData);
  }, []);
  const handleSave = useCallback6(() => {
    onChange(formData);
  }, [onChange, formData]);
  return /* @__PURE__ */ React9.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ React9.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React9.createElement(
    JsonForms6,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React9.createElement(
    "button",
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
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
  return /* @__PURE__ */ React9.createElement("div", { className: `
      bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled ? "border-slate-200 opacity-50" : "border-slate-200 hover:border-amber-400 hover:shadow-md"}
    ` }, /* @__PURE__ */ React9.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React9.createElement(
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
    /* @__PURE__ */ React9.createElement(IoMdTime, { className: `w-5 h-5 ${isDisabled ? "text-slate-400" : "text-amber-500"}` })
  ), /* @__PURE__ */ React9.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React9.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React9.createElement("span", { className: `text-xs font-semibold truncate ${isDisabled ? "text-slate-400 line-through" : "text-slate-700"}` }, data?.title || "Delay"), isDisabled && /* @__PURE__ */ React9.createElement("span", { className: "inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200" }, /* @__PURE__ */ React9.createElement(VscDebugDisconnect, { className: "w-2.5 h-2.5" }), "Skip")), /* @__PURE__ */ React9.createElement("div", { className: `text-[10px] font-mono mt-0.5 ${isDisabled ? "text-slate-300" : "text-slate-400"}` }, "wait ", getDelayDisplay())), /* @__PURE__ */ React9.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ React9.createElement("div", { className: `w-2 h-2 rounded-full ${isDisabled ? "bg-slate-300" : "bg-amber-400"}`, title: "After Delay" }))), /* @__PURE__ */ React9.createElement(
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
  ), /* @__PURE__ */ React9.createElement(
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
import React10, { memo as memo7, useState as useState7, useEffect as useEffect7, useMemo as useMemo7, useCallback as useCallback7 } from "react";
import { Handle as Handle7, Position as Position7 } from "reactflow";
import { JsonForms as JsonForms7 } from "@jsonforms/react";
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
  return /* @__PURE__ */ React10.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React10.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React10.createElement("label", { className: "text-xs font-medium text-slate-500" }, "Output Parameters"), /* @__PURE__ */ React10.createElement(
    "button",
    {
      type: "button",
      onClick: addParameter,
      className: "flex items-center gap-1 px-2 py-1 text-xs bg-white text-[#646cff] hover:bg-[#646cff]/10 rounded transition-colors border border-slate-200"
    },
    /* @__PURE__ */ React10.createElement(FaPlus, { className: "w-2.5 h-2.5" }),
    "Add Output"
  )), /* @__PURE__ */ React10.createElement("p", { className: "text-[10px] text-slate-400" }, "Define outputs that will be returned when the workflow completes."), parameters.length === 0 ? /* @__PURE__ */ React10.createElement("div", { className: "text-xs text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded" }, "No output parameters defined. Workflow will complete with no output.") : /* @__PURE__ */ React10.createElement("div", { className: "space-y-2" }, parameters.map((param, index) => /* @__PURE__ */ React10.createElement(
    "div",
    {
      key: param.id,
      className: "border border-slate-200 rounded p-2 bg-slate-50"
    },
    /* @__PURE__ */ React10.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React10.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React10.createElement(IoMdArrowDropleft, { className: "w-3 h-3 text-red-500" }), /* @__PURE__ */ React10.createElement(
      "input",
      {
        type: "text",
        value: param.name,
        onChange: (e) => updateParameter(index, "name", e.target.value.replace(/[^a-zA-Z0-9_]/g, "")),
        className: "text-xs font-mono font-medium text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 w-28 focus:outline-none focus:border-[#646cff]",
        placeholder: "outputName"
      }
    )), /* @__PURE__ */ React10.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeParameter(index),
        className: "p-1 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors",
        title: "Remove output"
      },
      /* @__PURE__ */ React10.createElement(FaTrash, { className: "w-3 h-3" })
    )),
    /* @__PURE__ */ React10.createElement("div", null, /* @__PURE__ */ React10.createElement("label", { className: "text-[10px] text-slate-400" }, "Source Variable"), /* @__PURE__ */ React10.createElement(
      "input",
      {
        type: "text",
        value: param.sourceVariable,
        onChange: (e) => updateParameter(index, "sourceVariable", e.target.value),
        placeholder: "ctx.result or a value",
        className: "w-full text-xs p-1.5 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
      }
    ), availableVariables.length > 0 && /* @__PURE__ */ React10.createElement("p", { className: "text-[9px] text-slate-400 mt-0.5" }, "Available: ", availableVariables.slice(0, 5).map((v) => `ctx.${v.variable}`).join(", "), availableVariables.length > 5 && "...")),
    /* @__PURE__ */ React10.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React10.createElement("label", { className: "text-[10px] text-slate-400" }, "Description"), /* @__PURE__ */ React10.createElement(
      "input",
      {
        type: "text",
        value: param.description,
        onChange: (e) => updateParameter(index, "description", e.target.value),
        placeholder: "What this output represents",
        className: "w-full text-xs p-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:border-[#646cff]"
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
  return /* @__PURE__ */ React10.createElement("div", { className: "w-full h-full" }, /* @__PURE__ */ React10.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React10.createElement(
    JsonForms7,
    {
      schema,
      uischema,
      data: formData,
      renderers: jetFormsRenderers,
      onChange: handleFormChange
    }
  ), /* @__PURE__ */ React10.createElement("div", { className: "border-t border-slate-100 pt-4" }, /* @__PURE__ */ React10.createElement(
    OutputParameterEditor,
    {
      parameters: formData.outputParameters,
      onChange: handleParametersChange,
      availableVariables
    }
  )), /* @__PURE__ */ React10.createElement(
    "button",
    {
      type: "button",
      onClick: handleSave,
      className: "px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
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
          bgColor: "bg-green-50",
          borderColor: "border-green-100",
          textColor: "text-green-500",
          hoverBorder: "hover:border-green-400",
          handleColor: "#22c55e",
          icon: FaCheck,
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
          icon: FaTimes,
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
          icon: FaExclamationTriangle,
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
          icon: VscDebugStop,
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
      return /* @__PURE__ */ React10.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10" }, /* @__PURE__ */ React10.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React10.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" })));
    }
    if (executionStatus === "completed") {
      return /* @__PURE__ */ React10.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React10.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React10.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
    }
    if (executionStatus === "failed") {
      return /* @__PURE__ */ React10.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React10.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React10.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
    }
    return null;
  };
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  return /* @__PURE__ */ React10.createElement("div", { className: `
      relative bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${getExecutionStatusStyles()} ${statusConfig.hoverBorder} hover:shadow-md
    ` }, /* @__PURE__ */ React10.createElement(ExecutionIndicator, null), /* @__PURE__ */ React10.createElement(
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
  ), /* @__PURE__ */ React10.createElement("div", { className: "flex items-stretch" }, /* @__PURE__ */ React10.createElement(
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
    /* @__PURE__ */ React10.createElement(StatusIcon, { className: `w-5 h-5 ${executionStatus === "running" ? "text-blue-600" : executionStatus === "completed" ? "text-green-600" : executionStatus === "failed" ? "text-red-600" : statusConfig.textColor}` })
  ), /* @__PURE__ */ React10.createElement("div", { className: "flex-1 px-3 py-2 min-w-0" }, /* @__PURE__ */ React10.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React10.createElement("span", { className: "text-xs font-semibold truncate text-slate-700" }, data?.title || "End"), /* @__PURE__ */ React10.createElement("span", { className: `text-xs font-medium px-1.5 py-0.5 rounded border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}` }, statusConfig.label)), /* @__PURE__ */ React10.createElement("div", { className: "text-[10px] mt-0.5 text-slate-400" }, outputCount === 0 ? "No outputs defined" : `${outputCount} output${outputCount !== 1 ? "s" : ""}: ${outputParams.slice(0, 3).map((p) => p.name).join(", ")}${outputCount > 3 ? "..." : ""}`)), /* @__PURE__ */ React10.createElement("div", { className: "flex flex-col items-center justify-center px-2 border-l border-slate-100" }, /* @__PURE__ */ React10.createElement("div", { className: `w-2 h-2 rounded-full`, style: { backgroundColor: statusConfig.handleColor }, title: statusConfig.label }))));
});

// src/map.js
import React11 from "react";
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
      description: "",
      inputParameters: []
    },
    schema: {
      type: "object",
      properties: {
        title: { type: "string", title: "Node Title" },
        description: { type: "string", title: "Description" },
        inputParameters: {
          type: "array",
          title: "Input Parameters",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string", title: "Parameter Name", pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$" },
              type: { type: "string", title: "Type", enum: ["string", "number", "boolean", "object", "array"] },
              required: { type: "boolean", title: "Required", default: false },
              defaultValue: { type: "string", title: "Default Value" },
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
import React12 from "react";
var StatusIndicator = ({ executionStatus }) => {
  if (executionStatus === "running") {
    return /* @__PURE__ */ React12.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin z-10" }, /* @__PURE__ */ React12.createElement(TbRefresh, { className: "w-3 h-3 text-white" }));
  }
  if (executionStatus === "completed") {
    return /* @__PURE__ */ React12.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React12.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React12.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" })));
  }
  if (executionStatus === "failed") {
    return /* @__PURE__ */ React12.createElement("div", { className: "absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10" }, /* @__PURE__ */ React12.createElement("svg", { className: "w-3 h-3 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, /* @__PURE__ */ React12.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" })));
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
export {
  ConditionNode,
  ConditionNodeConfigurator,
  DataQueryNode,
  DataQueryNodeConfigurator,
  DelayNode,
  DelayNodeConfigurator,
  EndNode,
  EndNodeConfigurator,
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
