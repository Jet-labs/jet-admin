// src/renderers/index.js
import {
  withJsonFormsControlProps,
  withJsonFormsLayoutProps
} from "@jsonforms/react";

// src/renderers/CustomNumberInput.jsx
import React from "react";
import PropTypes from "prop-types";
var CustomNumberInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    uischema,
    schema
  } = props;
  const handleInputChange = (ev) => {
    const valueString = ev.target.value;
    if (valueString === "") {
      handleChange(path, void 0);
    } else {
      const numValue = schema.type === "integer" ? parseInt(valueString, 10) : parseFloat(valueString);
      if (!isNaN(numValue)) {
        handleChange(path, numValue);
      }
    }
  };
  const step = uischema.options?.step || schema.multipleOf || (schema.type === "integer" ? 1 : "any");
  return /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"}`
    },
    label || description,
    " ",
    errors && errors.length > 0 && errors
  ), errors && errors.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "text-red-500 text-xs" }, errors), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      id: path,
      name: path,
      className: `placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${errors && errors.length > 0 ? "border-red-500 focus:border-red-500" : "border-slate-200"} text-slate-700 rounded block w-full px-2.5 py-1.5`,
      placeholder: errors && errors.length > 0 ? errors : uischema?.options?.placeholder || "",
      onChange: handleInputChange,
      value: data === void 0 || data === null ? "" : data,
      min: schema.minimum,
      max: schema.maximum,
      step
    }
  ));
};
CustomNumberInput.propTypes = {
  data: PropTypes.number,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  uischema: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired
};

// src/renderers/CustomTextInput.jsx
import React2 from "react";
import PropTypes2 from "prop-types";
var CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const isMulti = uischema?.options?.multi;
  const isDisabled = enabled === false;
  return /* @__PURE__ */ React2.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React2.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"}`
    },
    label || description,
    " ",
    errors && errors.length > 0 && errors
  ), isMulti ? /* @__PURE__ */ React2.createElement(
    "textarea",
    {
      id: path,
      name: path,
      disabled: isDisabled,
      className: `placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${errors && errors.length > 0 ? "border-red-500 focus:border-red-500" : "border-slate-200"} text-slate-700 rounded block w-full px-2.5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed`,
      placeholder: errors && errors.length > 0 ? errors : uischema?.options?.placeholder || "",
      onChange: (ev) => handleChange(path, ev.target.value),
      value: data || "",
      rows: uischema?.options?.rows || 3
    }
  ) : /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: uischema?.options?.format === "password" ? "password" : "text",
      id: path,
      name: path,
      disabled: isDisabled,
      className: `placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${errors && errors.length > 0 ? "border-red-500 focus:border-red-500" : "border-slate-200"} text-slate-700 rounded block w-full px-2.5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed`,
      placeholder: errors && errors.length > 0 ? errors : uischema?.options?.placeholder || "",
      onChange: (ev) => handleChange(path, ev.target.value),
      value: data || ""
    }
  ));
};
CustomTextInput.propTypes = {
  data: PropTypes2.string,
  path: PropTypes2.string.isRequired,
  handleChange: PropTypes2.func.isRequired,
  label: PropTypes2.string,
  description: PropTypes2.string,
  errors: PropTypes2.arrayOf(PropTypes2.string),
  uischema: PropTypes2.object.isRequired,
  enabled: PropTypes2.bool
};

// src/renderers/CustomSelectInput.jsx
import React3, { useState } from "react";
import PropTypes3 from "prop-types";
import { TbRefresh } from "react-icons/tb";
var CustomSelectInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    schema,
    uischema,
    enabled
  } = props;
  const options = schema.enum || [];
  const isDisabled = enabled === false;
  const showRefreshButton = uischema?.options?.showRefreshButton ?? false;
  const onRefresh = uischema?.options?.onRefresh;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const getDisplayName = (optionValue) => {
    if (uischema.options && uischema.options.enumLabels) {
      if (Array.isArray(uischema.options.enumLabels)) {
        const labelMap = uischema.options.enumLabels.find(
          (item) => item.value === optionValue
        );
        if (labelMap) return labelMap.label;
      } else if (typeof uischema.options.enumLabels === "object") {
        if (uischema.options.enumLabels[optionValue]) {
          return uischema.options.enumLabels[optionValue];
        }
      }
    }
    return optionValue;
  };
  const handleRefreshClick = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };
  return /* @__PURE__ */ React3.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React3.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"}`
    },
    label || description,
    " ",
    errors && errors.length > 0 && errors
  ), /* @__PURE__ */ React3.createElement("div", { className: `flex items-center gap-2 ${showRefreshButton ? "" : ""}` }, /* @__PURE__ */ React3.createElement(
    "select",
    {
      id: path,
      name: path,
      disabled: isDisabled,
      className: `placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${errors && errors.length > 0 ? "border-red-500 focus:border-red-500" : "border-slate-200"} text-slate-700 rounded block w-full px-2.5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed`,
      onChange: (ev) => handleChange(path, ev.target.value),
      value: data || ""
    },
    !data && /* @__PURE__ */ React3.createElement("option", { value: "", disabled: true }, uischema?.options?.placeholder || "Select an option"),
    options.map((optionValue) => /* @__PURE__ */ React3.createElement("option", { key: optionValue, value: optionValue }, getDisplayName(optionValue)))
  ), showRefreshButton && onRefresh && /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      onClick: handleRefreshClick,
      disabled: isRefreshing || isDisabled,
      className: "flex-shrink-0 bg-slate-50 p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200",
      title: "Refresh list"
    },
    /* @__PURE__ */ React3.createElement(TbRefresh, { className: `w-5 h-5 ${isRefreshing ? "animate-spin" : ""}` })
  )));
};
CustomSelectInput.propTypes = {
  data: PropTypes3.string,
  path: PropTypes3.string.isRequired,
  handleChange: PropTypes3.func.isRequired,
  label: PropTypes3.string,
  description: PropTypes3.string,
  errors: PropTypes3.arrayOf(PropTypes3.string),
  schema: PropTypes3.object.isRequired,
  uischema: PropTypes3.object.isRequired,
  enabled: PropTypes3.bool
};

// src/renderers/CustomCheckboxInput.jsx
import React4 from "react";
import PropTypes4 from "prop-types";
var CustomCheckboxInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    enabled,
    uischema
  } = props;
  const onToggle = (ev) => {
    handleChange(path, ev.target.checked);
  };
  return /* @__PURE__ */ React4.createElement("div", { className: "flex items-center mb-3" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "checkbox",
      id: path,
      name: path,
      checked: !!data,
      disabled: !enabled,
      onChange: onToggle,
      className: "h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
    }
  ), /* @__PURE__ */ React4.createElement("label", { htmlFor: path, className: "ml-2 text-sm font-medium text-slate-700" }, label || description || uischema.label), errors && errors.length > 0 && /* @__PURE__ */ React4.createElement("p", { className: "text-red-500 text-xs mt-1 ml-2" }, errors));
};
CustomCheckboxInput.propTypes = {
  data: PropTypes4.bool,
  path: PropTypes4.string.isRequired,
  handleChange: PropTypes4.func.isRequired,
  label: PropTypes4.string,
  description: PropTypes4.string,
  errors: PropTypes4.arrayOf(PropTypes4.string),
  enabled: PropTypes4.bool.isRequired,
  uischema: PropTypes4.object.isRequired
};

// src/renderers/CustomCodePgsqlControl.jsx
import React5, { useEffect, useMemo, useRef } from "react";
import PropTypes5 from "prop-types";
import Editor from "@monaco-editor/react";
import GithubTheme from "monaco-themes/themes/GitHub Light.json";
var CustomCodePgsqlControl = ({
  data,
  path,
  label,
  description,
  errors,
  handleChange,
  enabled,
  uischema
}) => {
  const { databaseMetadata } = uischema.options || {};
  const tablesMap = useMemo(() => {
    if (!databaseMetadata?.schemas) return {};
    const map = {};
    databaseMetadata.schemas.forEach((schemaItem) => {
      schemaItem.tables?.forEach((t) => {
        map[t.databaseTableName] = t.databaseTableColumns?.map((c) => c.databaseTableColumnName) || [];
      });
    });
    return map;
  }, [databaseMetadata]);
  const schemaRef = useRef(tablesMap);
  useEffect(() => {
    schemaRef.current = tablesMap;
  }, [tablesMap]);
  const handleEditorWillMount = (monaco) => {
    monaco.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: [".", " "],
      provideCompletionItems: (model, pos) => {
        const text = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: pos.lineNumber,
          endColumn: pos.column
        });
        const wordInfo = model.getWordUntilPosition(pos);
        const range = {
          startLineNumber: pos.lineNumber,
          endLineNumber: pos.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn
        };
        const suggestions = [];
        const tableMatch = text.match(/(\b\w+)\.$/);
        if (tableMatch) {
          const cols = schemaRef.current[tableMatch[1]] || [];
          cols.forEach(
            (col) => suggestions.push({
              label: col,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: col,
              detail: `Column of ${tableMatch[1]}`,
              range
            })
          );
        } else {
          Object.keys(schemaRef.current).forEach(
            (tbl) => suggestions.push({
              label: tbl,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: tbl,
              detail: "Table",
              range
            })
          );
          const sqlKeywords = [
            "SELECT",
            "FROM",
            "WHERE",
            "JOIN",
            "LEFT JOIN",
            "RIGHT JOIN",
            "INNER JOIN",
            "ON",
            "GROUP BY",
            "ORDER BY",
            "ASC",
            "DESC",
            "AS",
            "DISTINCT",
            "LIMIT",
            "OFFSET",
            "INSERT INTO",
            "VALUES",
            "UPDATE",
            "SET",
            "DELETE",
            "CREATE TABLE",
            "ALTER TABLE",
            "DROP TABLE",
            "INDEX",
            "COUNT",
            "SUM",
            "AVG",
            "MAX",
            "MIN",
            "AND",
            "OR",
            "NOT",
            "NULL",
            "IS"
          ];
          sqlKeywords.forEach(
            (kw) => suggestions.push({
              label: kw,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: kw,
              range
            })
          );
        }
        return { suggestions };
      }
    });
    monaco.editor.defineTheme("github-light", GithubTheme);
  };
  return /* @__PURE__ */ React5.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React5.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"}`
    },
    label || description,
    " ",
    errors && errors.length > 0 && errors
  ), /* @__PURE__ */ React5.createElement("div", { className: "border border-slate-200 rounded p-1" }, /* @__PURE__ */ React5.createElement(
    Editor,
    {
      height: uischema.options?.height || "140px",
      defaultLanguage: "sql",
      value: data || "",
      onChange: (val) => handleChange(path, val || ""),
      beforeMount: handleEditorWillMount,
      options: {
        readOnly: !enabled,
        minimap: { enabled: false },
        fontSize: 12,
        wordWrap: "on"
      },
      theme: "github-light"
    }
  )));
};
CustomCodePgsqlControl.propTypes = {
  data: PropTypes5.string,
  path: PropTypes5.string.isRequired,
  handleChange: PropTypes5.func.isRequired,
  enabled: PropTypes5.bool.isRequired,
  uischema: PropTypes5.object,
  label: PropTypes5.string,
  description: PropTypes5.string,
  errors: PropTypes5.arrayOf(PropTypes5.string)
};

// src/renderers/CustomCodeJavascriptControl.jsx
import React6 from "react";
import PropTypes6 from "prop-types";
import Editor2 from "@monaco-editor/react";
import GithubTheme2 from "monaco-themes/themes/GitHub Light.json";
var CustomCodeJavascriptControl = ({
  data,
  path,
  label,
  description,
  errors,
  handleChange,
  enabled,
  uischema
}) => {
  const { placeholder, hint } = uischema.options || {};
  const rows = uischema.options?.rows || 10;
  const height = rows * 20 + "px";
  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme("github-light", GithubTheme2);
    monaco.languages.registerCompletionItemProvider("javascript", {
      triggerCharacters: ["."],
      provideCompletionItems: (model, position) => {
        const wordInfo = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn
        };
        const suggestions = [];
        const textBefore = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });
        if (textBefore.endsWith("ctx.")) {
          suggestions.push({
            label: "/* Available context variables */",
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: "",
            detail: "Access results from previous nodes using ctx.variableName",
            range
          });
        }
        const jsKeywords = [
          { label: "return", detail: "Return statement" },
          { label: "const", detail: "Constant declaration" },
          { label: "let", detail: "Variable declaration" },
          { label: "ctx", detail: "Workflow context object" },
          { label: "console.log", detail: "Log to console" },
          { label: "JSON.stringify", detail: "Convert to JSON string" },
          { label: "JSON.parse", detail: "Parse JSON string" },
          { label: "Array.isArray", detail: "Check if array" },
          { label: "Object.keys", detail: "Get object keys" },
          { label: "Object.values", detail: "Get object values" }
        ];
        jsKeywords.forEach((kw) => {
          suggestions.push({
            label: kw.label,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw.label,
            detail: kw.detail,
            range
          });
        });
        return { suggestions };
      }
    });
  };
  return /* @__PURE__ */ React6.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React6.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"}`
    },
    label || description,
    " ",
    errors && errors.length > 0 && errors
  ), hint && /* @__PURE__ */ React6.createElement("p", { className: "text-[10px] text-slate-400 mb-1" }, hint), /* @__PURE__ */ React6.createElement("div", { className: "border border-slate-200 rounded p-1" }, /* @__PURE__ */ React6.createElement(
    Editor2,
    {
      height,
      defaultLanguage: "javascript",
      value: data || placeholder || "",
      onChange: (val) => handleChange(path, val || ""),
      beforeMount: handleEditorWillMount,
      options: {
        readOnly: !enabled,
        minimap: { enabled: false },
        fontSize: 12,
        wordWrap: "on",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        tabSize: 2,
        automaticLayout: true
      },
      theme: "github-light"
    }
  )));
};
CustomCodeJavascriptControl.propTypes = {
  data: PropTypes6.string,
  path: PropTypes6.string.isRequired,
  handleChange: PropTypes6.func.isRequired,
  enabled: PropTypes6.bool.isRequired,
  uischema: PropTypes6.object,
  label: PropTypes6.string,
  description: PropTypes6.string,
  errors: PropTypes6.arrayOf(PropTypes6.string)
};

// src/renderers/CustomSuggestionInput.jsx
import React7, { useState as useState2 } from "react";
import PropTypes7 from "prop-types";
var CustomSuggestionInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const { suggestions, placeholder } = uischema.options || {};
  const [isOpen, setIsOpen] = useState2(false);
  const handleSelect = (value) => {
    const currentVal = data || "";
    handleChange(path, currentVal + value);
    setIsOpen(false);
  };
  return /* @__PURE__ */ React7.createElement("div", { className: "relative mb-3" }, /* @__PURE__ */ React7.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"} flex justify-between items-center`
    },
    /* @__PURE__ */ React7.createElement("span", null, label || description, " ", errors && errors.length > 0 && errors),
    suggestions && suggestions.length > 0 && /* @__PURE__ */ React7.createElement(
      "button",
      {
        type: "button",
        onClick: () => setIsOpen(!isOpen),
        disabled: !enabled,
        className: "text-[10px] bg-slate-100 text-purple-600 px-1.5 py-0.5 rounded border border-transparent hover:border-purple-200"
      },
      "Map +"
    )
  ), /* @__PURE__ */ React7.createElement(
    "input",
    {
      type: "text",
      id: path,
      name: path,
      disabled: !enabled,
      className: `placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${errors && errors.length > 0 ? "border-red-500 focus:border-red-500" : "border-slate-200"} text-slate-700 rounded block w-full px-2.5 py-1.5`,
      placeholder: errors || placeholder || "",
      onChange: (ev) => handleChange(path, ev.target.value),
      value: data || ""
    }
  ), isOpen && suggestions && /* @__PURE__ */ React7.createElement("div", { className: "absolute right-0 top-6 w-48 bg-white border border-slate-200 shadow-xl rounded z-[50] max-h-40 overflow-y-auto" }, /* @__PURE__ */ React7.createElement("div", { className: "p-2 border-b border-slate-100 flex justify-between items-center bg-slate-50" }, /* @__PURE__ */ React7.createElement("span", { className: "text-[10px] font-semibold text-slate-500" }, "Pick a node"), /* @__PURE__ */ React7.createElement("button", { type: "button", onClick: () => setIsOpen(false), className: "text-slate-400 hover:text-slate-600" }, "\xD7")), suggestions.length === 0 ? /* @__PURE__ */ React7.createElement("div", { className: "px-2 py-1 text-[10px] text-slate-400 italic" }, "No suggestions") : suggestions.map((item, idx) => /* @__PURE__ */ React7.createElement(
    "div",
    {
      key: idx,
      className: "px-2 py-1.5 text-xs hover:bg-purple-50 cursor-pointer truncate text-slate-700 border-b border-slate-50 last:border-0",
      onClick: () => handleSelect(item.value)
    },
    item.label
  ))));
};
CustomSuggestionInput.propTypes = {
  data: PropTypes7.string,
  path: PropTypes7.string.isRequired,
  handleChange: PropTypes7.func.isRequired,
  label: PropTypes7.string,
  description: PropTypes7.string,
  errors: PropTypes7.arrayOf(PropTypes7.string),
  uischema: PropTypes7.object.isRequired,
  enabled: PropTypes7.bool
};

// src/renderers/DynamicArgsControl.jsx
import React8, { useState as useState3, useRef as useRef2, useEffect as useEffect2 } from "react";
import PropTypes8 from "prop-types";
import { TbVariable } from "react-icons/tb";
var DynamicArgsControl = (props) => {
  const { data, path, handleChange, uischema, errors } = props;
  const args = uischema?.options?.args || [];
  const workflowNodes = uischema?.options?.workflowNodes || [];
  const currentNodeId = uischema?.options?.currentNodeId || null;
  const argsData = data || {};
  const handleArgChange = (argKey, value) => {
    handleChange(path, { ...argsData, [argKey]: value });
  };
  const getAvailableVariables = () => {
    if (!workflowNodes || workflowNodes.length === 0) return [];
    return workflowNodes.filter((node) => node.id !== currentNodeId).filter((node) => node.data?.outputVariable).map((node) => ({
      nodeId: node.id,
      nodeTitle: node.data?.title || node.data?.label || node.type,
      variableName: node.data.outputVariable,
      contextPath: `ctx.${node.data.outputVariable}`
    }));
  };
  const availableVariables = getAvailableVariables();
  if (args.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React8.createElement("div", { className: "border border-slate-200 rounded p-3 mt-2 bg-white" }, /* @__PURE__ */ React8.createElement("label", { className: "block mb-2 text-xs font-medium text-slate-500" }, "Arguments"), /* @__PURE__ */ React8.createElement("div", { className: "space-y-2" }, args.map((arg, index) => {
    const argName = arg.key;
    return /* @__PURE__ */ React8.createElement(
      ArgInputWithVariablePicker,
      {
        key: `arg-${index}`,
        argName,
        value: argsData[argName] || "",
        onChange: (value) => handleArgChange(argName, value),
        availableVariables
      }
    );
  })), errors && errors.length > 0 && /* @__PURE__ */ React8.createElement("span", { className: "text-red-500 text-xs mt-1" }, errors));
};
var ArgInputWithVariablePicker = ({ argName, value, onChange, availableVariables }) => {
  const [showDropdown, setShowDropdown] = useState3(false);
  const inputRef = useRef2(null);
  const dropdownRef = useRef2(null);
  useEffect2(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const insertVariable = (contextPath) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const newValue = value.substring(0, start) + `{{${contextPath + value.substring(end)}}}`;
      onChange(newValue);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + contextPath.length, start + contextPath.length);
      }, 0);
    } else {
      onChange(value + contextPath);
    }
    setShowDropdown(false);
  };
  return /* @__PURE__ */ React8.createElement("div", { className: "flex flex-row justify-between items-center gap-2" }, /* @__PURE__ */ React8.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React8.createElement("label", { className: "block mb-1 text-[10px] font-medium text-slate-400" }, argName), /* @__PURE__ */ React8.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React8.createElement(
    "input",
    {
      ref: inputRef,
      type: "text",
      id: `arg-${argName}`,
      className: "placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-200 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5",
      placeholder: `Value for ${argName}`,
      value,
      onChange: (e) => onChange(e.target.value)
    }
  ), /* @__PURE__ */ React8.createElement("div", { className: "relative", ref: dropdownRef }, /* @__PURE__ */ React8.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowDropdown(!showDropdown),
      className: `flex-shrink-0 p-1.5 rounded transition-colors border border-slate-200 bg-slate-50 ${availableVariables.length > 0 ? "text-blue-500 hover:text-blue-700 hover:bg-blue-50" : "text-slate-400 hover:text-slate-500 hover:bg-slate-100"}`,
      title: "Insert variable from previous node"
    },
    /* @__PURE__ */ React8.createElement(TbVariable, { className: "w-4 h-4" })
  ), showDropdown && /* @__PURE__ */ React8.createElement("div", { className: "absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto" }, /* @__PURE__ */ React8.createElement("div", { className: "px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100" }, "Available Variables"), availableVariables.length === 0 ? /* @__PURE__ */ React8.createElement("div", { className: "px-2 py-3 text-xs text-slate-400 text-center" }, "No variables available yet.", /* @__PURE__ */ React8.createElement("br", null), /* @__PURE__ */ React8.createElement("span", { className: "text-[10px]" }, "Add more nodes with output variables.")) : availableVariables.map((variable, idx) => /* @__PURE__ */ React8.createElement(
    "button",
    {
      key: idx,
      type: "button",
      onClick: () => insertVariable(variable.contextPath),
      className: "w-full bg-white text-left px-2 py-1.5 hover:bg-slate-100 hover:border-none border-none rounded-none transition-colors border-b border-slate-50 last:border-b-0"
    },
    /* @__PURE__ */ React8.createElement("div", { className: "text-xs font-medium text-slate-700 font-mono" }, variable.contextPath),
    /* @__PURE__ */ React8.createElement("div", { className: "text-[10px] text-slate-400 truncate" }, "from: ", variable.nodeTitle)
  )))))));
};
DynamicArgsControl.propTypes = {
  data: PropTypes8.object,
  path: PropTypes8.string.isRequired,
  handleChange: PropTypes8.func.isRequired,
  uischema: PropTypes8.object.isRequired,
  errors: PropTypes8.arrayOf(PropTypes8.string)
};

// src/renderers/CustomKeyValueArrayRenderer.jsx
import React9 from "react";
import PropTypes9 from "prop-types";
import { JsonFormsDispatch } from "@jsonforms/react";
import { MdDeleteOutline } from "react-icons/md";
var CustomKeyValueArrayRenderer = ({
  data,
  path,
  handleChange,
  schema,
  uischema,
  errors,
  label,
  enabled,
  renderers
}) => {
  const items = data || [];
  const itemSchema = schema.items;
  const handleAddItem = () => {
    const newItem = itemSchema.properties ? Object.fromEntries(
      Object.entries(itemSchema.properties).map(([key, propSchema]) => [
        key,
        propSchema.default !== void 0 ? propSchema.default : ""
      ])
    ) : { key: "", value: "" };
    handleChange(path, [...items, newItem]);
  };
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };
  return /* @__PURE__ */ React9.createElement("div", { className: "p-3 border border-slate-200 rounded bg-white mb-3" }, /* @__PURE__ */ React9.createElement("label", { className: "block mb-1 text-sm font-medium text-slate-700" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React9.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React9.createElement("div", { className: "gap-2" }, items.map((item, index) => /* @__PURE__ */ React9.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ React9.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React9.createElement(
    JsonFormsDispatch,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/key",
        label: "Key",
        options: uischema.options?.keyOptions
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ React9.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React9.createElement(
    JsonFormsDispatch,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/value",
        label: "Value",
        options: uischema.options?.valueOptions
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ React9.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleRemoveItem(index),
      className: "mt-5 p-2 rounded bg-red-100 text-red-400 focus:outline-none hover:border-red-400"
    },
    /* @__PURE__ */ React9.createElement(MdDeleteOutline, null)
  )))), /* @__PURE__ */ React9.createElement(
    "button",
    {
      type: "button",
      onClick: handleAddItem,
      className: "mt-3 px-2 py-1 bg-white text-[#646cff] text-xs rounded hover:border-[#646cff] focus:outline-none border border-slate-200"
    },
    "Add Item"
  ));
};
CustomKeyValueArrayRenderer.propTypes = {
  data: PropTypes9.arrayOf(PropTypes9.object),
  path: PropTypes9.string.isRequired,
  handleChange: PropTypes9.func.isRequired,
  schema: PropTypes9.object.isRequired,
  uischema: PropTypes9.object.isRequired,
  label: PropTypes9.string,
  description: PropTypes9.string,
  errors: PropTypes9.arrayOf(PropTypes9.string),
  enabled: PropTypes9.bool,
  renderers: PropTypes9.arrayOf(PropTypes9.object).isRequired
};

// src/renderers/CustomKeyValueTypeArrayRenderer.jsx
import React10 from "react";
import PropTypes10 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch2 } from "@jsonforms/react";
import { MdDeleteOutline as MdDeleteOutline2 } from "react-icons/md";
var CustomKeyValueTypeArrayRenderer = ({
  data,
  path,
  handleChange,
  schema,
  uischema,
  errors,
  label,
  enabled,
  renderers
}) => {
  const items = data || [];
  const itemSchema = schema.items;
  const handleAddItem = () => {
    const newItem = itemSchema.properties ? Object.fromEntries(
      Object.entries(itemSchema.properties).map(([key, propSchema]) => [
        key,
        propSchema.default !== void 0 ? propSchema.default : ""
      ])
    ) : { key: "", value: "", type: "" };
    handleChange(path, [...items, newItem]);
  };
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };
  return /* @__PURE__ */ React10.createElement("div", { className: "p-3 border border-slate-200 rounded bg-white mb-3" }, /* @__PURE__ */ React10.createElement("label", { className: "block mb-1 text-sm font-medium text-slate-700" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React10.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React10.createElement("div", { className: "gap-2" }, items.map((item, index) => /* @__PURE__ */ React10.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ React10.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React10.createElement(
    JsonFormsDispatch2,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/key",
        label: "Key",
        options: uischema.options?.keyOptions
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ React10.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React10.createElement(
    JsonFormsDispatch2,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/type",
        label: "Value Type",
        options: uischema.options?.typeOptions
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ React10.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React10.createElement(
    JsonFormsDispatch2,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/value",
        label: "Value",
        options: uischema.options?.valueOptions
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ React10.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleRemoveItem(index),
      className: "mt-5 p-2 rounded bg-red-100 text-red-400 focus:outline-none hover:border-red-400"
    },
    /* @__PURE__ */ React10.createElement(MdDeleteOutline2, null)
  )))), /* @__PURE__ */ React10.createElement(
    "button",
    {
      type: "button",
      onClick: handleAddItem,
      className: "mt-3 px-2 py-1 bg-white text-[#646cff] text-xs rounded hover:border-[#646cff] focus:outline-none border border-slate-200"
    },
    "Add Item"
  ));
};
CustomKeyValueTypeArrayRenderer.propTypes = {
  data: PropTypes10.arrayOf(PropTypes10.object),
  path: PropTypes10.string.isRequired,
  handleChange: PropTypes10.func.isRequired,
  schema: PropTypes10.object.isRequired,
  uischema: PropTypes10.object.isRequired,
  label: PropTypes10.string,
  description: PropTypes10.string,
  errors: PropTypes10.arrayOf(PropTypes10.string),
  enabled: PropTypes10.bool,
  renderers: PropTypes10.arrayOf(PropTypes10.object).isRequired
};

// src/renderers/CustomKeyTypeArrayRenderer.jsx
import React11 from "react";
import PropTypes11 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch3 } from "@jsonforms/react";
import { MdDeleteOutline as MdDeleteOutline3 } from "react-icons/md";
var CustomKeyTypeArrayRenderer = ({
  data,
  path,
  handleChange,
  schema,
  uischema,
  errors,
  label,
  enabled,
  renderers
}) => {
  const items = data || [];
  const itemSchema = schema.items;
  const handleAddItem = () => {
    const newItem = itemSchema.properties ? Object.fromEntries(
      Object.entries(itemSchema.properties).map(([key, propSchema]) => [
        key,
        propSchema.default !== void 0 ? propSchema.default : ""
      ])
    ) : { key: "", type: "" };
    handleChange(path, [...items, newItem]);
  };
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };
  return /* @__PURE__ */ React11.createElement("div", { className: "p-3 border mt-3 border-slate-200 rounded bg-white mb-3" }, /* @__PURE__ */ React11.createElement("label", { className: "block mb-1 text-sm font-medium text-slate-700" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React11.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React11.createElement("div", { className: "flex flex-col gap-2" }, items.map((item, index) => /* @__PURE__ */ React11.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ React11.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React11.createElement(
    JsonFormsDispatch3,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/key",
        label: "Key",
        options: uischema.options?.keyOptions
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ React11.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React11.createElement(
    JsonFormsDispatch3,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/type",
        label: "Value Type",
        options: uischema.options?.typeOptions
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ React11.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleRemoveItem(index),
      className: "mt-2 p-2 rounded bg-red-100 text-red-400 focus:outline-none hover:border-red-400"
    },
    /* @__PURE__ */ React11.createElement(MdDeleteOutline3, null)
  )))), /* @__PURE__ */ React11.createElement(
    "button",
    {
      type: "button",
      onClick: handleAddItem,
      className: "mt-3 px-2 py-1 bg-white text-[#646cff] text-xs rounded hover:border-[#646cff] focus:outline-none border border-slate-200"
    },
    "Add Item"
  ));
};
CustomKeyTypeArrayRenderer.propTypes = {
  data: PropTypes11.arrayOf(PropTypes11.object),
  path: PropTypes11.string.isRequired,
  handleChange: PropTypes11.func.isRequired,
  schema: PropTypes11.object.isRequired,
  uischema: PropTypes11.object.isRequired,
  label: PropTypes11.string,
  description: PropTypes11.string,
  errors: PropTypes11.arrayOf(PropTypes11.string),
  enabled: PropTypes11.bool,
  renderers: PropTypes11.arrayOf(PropTypes11.object).isRequired
};

// src/renderers/CustomGroupLayout.jsx
import React12 from "react";
import PropTypes12 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch4 } from "@jsonforms/react";
var CustomGroupLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];
  const customClass = uischema.options?.customClass || "";
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React12.createElement("div", { className: `border border-slate-200 rounded p-3 mt-2 bg-white ${customClass}` }, uischema.label && /* @__PURE__ */ React12.createElement("h3", { className: "text-xs font-medium text-slate-500 mb-2" }, uischema.label), /* @__PURE__ */ React12.createElement("div", { className: "flex flex-col gap-2" }, elements.map((element, index) => /* @__PURE__ */ React12.createElement(
    JsonFormsDispatch4,
    {
      key: index,
      uischema: element,
      schema,
      path,
      enabled,
      renderers,
      cells
    }
  ))));
};
CustomGroupLayout.propTypes = {
  uischema: PropTypes12.object.isRequired,
  schema: PropTypes12.object.isRequired,
  path: PropTypes12.string.isRequired,
  visible: PropTypes12.bool.isRequired,
  enabled: PropTypes12.bool.isRequired,
  renderers: PropTypes12.arrayOf(PropTypes12.object).isRequired,
  cells: PropTypes12.arrayOf(PropTypes12.object)
};

// src/renderers/CustomVerticalLayout.jsx
import React13 from "react";
import PropTypes13 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch5 } from "@jsonforms/react";
var CustomVerticalLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React13.createElement("div", { className: "flex flex-col" }, elements.map((element, index) => /* @__PURE__ */ React13.createElement(
    JsonFormsDispatch5,
    {
      key: index,
      uischema: element,
      schema,
      path,
      enabled,
      renderers,
      cells
    }
  )));
};
CustomVerticalLayout.propTypes = {
  uischema: PropTypes13.object.isRequired,
  schema: PropTypes13.object.isRequired,
  path: PropTypes13.string.isRequired,
  visible: PropTypes13.bool.isRequired,
  enabled: PropTypes13.bool.isRequired,
  renderers: PropTypes13.arrayOf(PropTypes13.object).isRequired,
  cells: PropTypes13.arrayOf(PropTypes13.object)
};

// src/renderers/CustomTabRenderer.jsx
import React14, { useState as useState4 } from "react";
import PropTypes14 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch6 } from "@jsonforms/react";
var CustomTabRenderer = (props) => {
  const { uischema, schema, path, enabled, renderers, cells } = props;
  const categories = uischema.elements || [];
  const [activeTab, setActiveTab] = useState4(0);
  if (!categories || categories.length === 0) {
    return null;
  }
  const activeCategory = categories[activeTab];
  return /* @__PURE__ */ React14.createElement("div", { className: "custom-tabs-container" }, /* @__PURE__ */ React14.createElement("div", { className: "flex border-slate-300" }, categories.map((category, index) => /* @__PURE__ */ React14.createElement(
    "button",
    {
      key: category.label || `tab-${index}`,
      className: `px-4 mr-2 py-2 text-sm font-medium rounded ${index === activeTab ? "text-[#646cff] border-slate-200" : "text-slate-700"} focus:outline-none bg-white`,
      onClick: () => setActiveTab(index),
      type: "button"
    },
    category.label
  ))), /* @__PURE__ */ React14.createElement("div", { className: "p-3 border mt-3 border-slate-200 rounded bg-white flex flex-col gap-2" }, activeCategory?.elements.map((element, i) => /* @__PURE__ */ React14.createElement(
    JsonFormsDispatch6,
    {
      key: i,
      uischema: element,
      schema,
      path,
      enabled,
      renderers,
      cells
    }
  ))));
};
CustomTabRenderer.propTypes = {
  uischema: PropTypes14.shape({
    type: PropTypes14.string.isRequired,
    elements: PropTypes14.arrayOf(PropTypes14.object).isRequired
  }).isRequired,
  schema: PropTypes14.object.isRequired,
  path: PropTypes14.string.isRequired,
  enabled: PropTypes14.bool.isRequired,
  renderers: PropTypes14.arrayOf(PropTypes14.object).isRequired,
  cells: PropTypes14.arrayOf(PropTypes14.object)
};

// src/renderers/index.js
var JetNumberControl = withJsonFormsControlProps(CustomNumberInput);
var JetTextControl = withJsonFormsControlProps(CustomTextInput);
var JetSelectControl = withJsonFormsControlProps(CustomSelectInput);
var JetCheckboxControl = withJsonFormsControlProps(CustomCheckboxInput);
var JetCodePgsqlControl = withJsonFormsControlProps(CustomCodePgsqlControl);
var JetCodeJavascriptControl = withJsonFormsControlProps(CustomCodeJavascriptControl);
var JetSuggestionControl = withJsonFormsControlProps(CustomSuggestionInput);
var JetDynamicArgsControl = withJsonFormsControlProps(DynamicArgsControl);
var JetKeyValueArrayControl = withJsonFormsControlProps(CustomKeyValueArrayRenderer);
var JetKeyValueTypeArrayControl = withJsonFormsControlProps(CustomKeyValueTypeArrayRenderer);
var JetKeyTypeArrayControl = withJsonFormsControlProps(CustomKeyTypeArrayRenderer);
var JetGroupLayout = withJsonFormsLayoutProps(CustomGroupLayout);
var JetVerticalLayout = withJsonFormsLayoutProps(CustomVerticalLayout);
var JetTabLayout = withJsonFormsLayoutProps(CustomTabRenderer);

// src/testers.js
import {
  rankWith,
  isControl,
  and,
  formatIs,
  uiTypeIs,
  Resolve
} from "@jsonforms/core";
var numberInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const currentSchema = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!currentSchema) {
      return -1;
    }
    if ((currentSchema.type === "number" || currentSchema.type === "integer") && !currentSchema.enum) {
      return 10;
    }
  } catch (e) {
    console.warn(`Error resolving schema for scope ${uischema.scope} in numberInputTester:`, e);
    return -1;
  }
  return -1;
};
var textInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const currentSchema = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!currentSchema) {
      return -1;
    }
    if (currentSchema.format === "password" && uischema.options?.format === "password" || currentSchema.type === "string" && !currentSchema.enum) {
      return 50;
    }
  } catch (e) {
    console.warn(`Error resolving schema for scope ${uischema.scope} in textInputTester:`, e);
    return -1;
  }
  return -1;
};
var selectInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const currentSchema = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!currentSchema) {
      return -1;
    }
    if (currentSchema.type === "string" && currentSchema.enum) {
      return 15;
    }
  } catch (e) {
    console.warn(`Error resolving schema for scope ${uischema.scope} in selectInputTester:`, e);
    return -1;
  }
  return -1;
};
var checkboxTester = (uischema, schema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const current = Resolve.schema(schema, uischema.scope, schema);
    if (current && current.type === "boolean") {
      return 10;
    }
  } catch (e) {
    console.warn(e);
    return -1;
  }
  return -1;
};
var codePgsqlTester = rankWith(
  100,
  and(isControl, formatIs("code-pgsql"))
);
var codeJavascriptTester = rankWith(
  100,
  and(isControl, formatIs("code-javascript"))
);
var suggestionInputTester = rankWith(
  50,
  and(isControl, (uischema) => uischema.options && uischema.options.suggestionType === "nodeOutput")
);
var dynamicArgsTester = rankWith(
  20,
  and(isControl, (uischema) => uischema?.options?.isDynamicArgs === true)
);
var keyValueArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const schemaAtScope = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    const itemSchema = schemaAtScope.items;
    if (itemSchema.type !== "object" || itemSchema.properties?.key?.type !== "string" || itemSchema.properties?.value?.type !== "string") {
      return -1;
    }
    return 50;
  } catch (e) {
    console.warn("Error in key/value tester:", e);
    return -1;
  }
};
var keyValueTypeArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const schemaAtScope = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    const itemSchema = schemaAtScope.items;
    if (itemSchema.type !== "object" || itemSchema.properties?.key?.type !== "string" || itemSchema.properties?.value?.type !== "string" || itemSchema.properties?.type?.type !== "string") {
      return -1;
    }
    return 60;
  } catch (e) {
    console.warn("Error in key/value/type tester:", e);
    return -1;
  }
};
var keyTypeArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const schemaAtScope = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    const itemSchema = schemaAtScope.items;
    if (itemSchema.type !== "object" || itemSchema.properties?.key?.type !== "string" || itemSchema.properties?.type?.type !== "string" || itemSchema.properties?.value?.type) {
      return -1;
    }
    return 60;
  } catch (e) {
    console.warn("Error in key/type tester:", e);
    return -1;
  }
};
var groupLayoutTester = (uischema) => {
  return rankWith(10, uiTypeIs("Group"))(uischema);
};
var verticalLayoutTester = (uischema) => {
  return uischema.type === "VerticalLayout" ? 10 : -1;
};
var tabRendererTester = (uischema) => {
  if (uischema.type === "Categorization") {
    return 50;
  }
  return -1;
};

// src/jetFormsRenderers.js
var jetFormsBaseRenderers = [
  { tester: tabRendererTester, renderer: JetTabLayout },
  { tester: numberInputTester, renderer: JetNumberControl },
  { tester: textInputTester, renderer: JetTextControl },
  { tester: selectInputTester, renderer: JetSelectControl },
  { tester: checkboxTester, renderer: JetCheckboxControl },
  { tester: keyValueArrayTester, renderer: JetKeyValueArrayControl },
  { tester: keyValueTypeArrayTester, renderer: JetKeyValueTypeArrayControl },
  { tester: keyTypeArrayTester, renderer: JetKeyTypeArrayControl },
  { tester: groupLayoutTester, renderer: JetGroupLayout },
  { tester: verticalLayoutTester, renderer: JetVerticalLayout }
];
var jetFormsRenderers = [
  { tester: suggestionInputTester, renderer: JetSuggestionControl },
  { tester: codePgsqlTester, renderer: JetCodePgsqlControl },
  { tester: codeJavascriptTester, renderer: JetCodeJavascriptControl },
  { tester: dynamicArgsTester, renderer: JetDynamicArgsControl },
  ...jetFormsBaseRenderers
];
export {
  CustomCheckboxInput,
  CustomCodeJavascriptControl,
  CustomCodePgsqlControl,
  CustomGroupLayout,
  CustomKeyTypeArrayRenderer,
  CustomKeyValueArrayRenderer,
  CustomKeyValueTypeArrayRenderer,
  CustomNumberInput,
  CustomSelectInput,
  CustomSuggestionInput,
  CustomTabRenderer,
  CustomTextInput,
  CustomVerticalLayout,
  DynamicArgsControl,
  JetCheckboxControl,
  JetCodeJavascriptControl,
  JetCodePgsqlControl,
  JetDynamicArgsControl,
  JetGroupLayout,
  JetKeyTypeArrayControl,
  JetKeyValueArrayControl,
  JetKeyValueTypeArrayControl,
  JetNumberControl,
  JetSelectControl,
  JetSuggestionControl,
  JetTabLayout,
  JetTextControl,
  JetVerticalLayout,
  checkboxTester,
  codeJavascriptTester,
  codePgsqlTester,
  dynamicArgsTester,
  groupLayoutTester,
  jetFormsBaseRenderers,
  jetFormsRenderers,
  keyTypeArrayTester,
  keyValueArrayTester,
  keyValueTypeArrayTester,
  numberInputTester,
  selectInputTester,
  suggestionInputTester,
  tabRendererTester,
  textInputTester,
  verticalLayoutTester
};
//# sourceMappingURL=index.mjs.map
