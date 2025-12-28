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
  CustomCheckboxInput: () => CustomCheckboxInput,
  CustomCodeJavascriptControl: () => CustomCodeJavascriptControl,
  CustomCodePgsqlControl: () => CustomCodePgsqlControl,
  CustomGroupLayout: () => CustomGroupLayout,
  CustomKeyTypeArrayRenderer: () => CustomKeyTypeArrayRenderer,
  CustomKeyValueArrayRenderer: () => CustomKeyValueArrayRenderer,
  CustomKeyValueTypeArrayRenderer: () => CustomKeyValueTypeArrayRenderer,
  CustomNumberInput: () => CustomNumberInput,
  CustomSelectInput: () => CustomSelectInput,
  CustomSuggestionInput: () => CustomSuggestionInput,
  CustomTabRenderer: () => CustomTabRenderer,
  CustomTextInput: () => CustomTextInput,
  CustomVerticalLayout: () => CustomVerticalLayout,
  DynamicArgsControl: () => DynamicArgsControl,
  JetCheckboxControl: () => JetCheckboxControl,
  JetCodeJavascriptControl: () => JetCodeJavascriptControl,
  JetCodePgsqlControl: () => JetCodePgsqlControl,
  JetDynamicArgsControl: () => JetDynamicArgsControl,
  JetGroupLayout: () => JetGroupLayout,
  JetKeyTypeArrayControl: () => JetKeyTypeArrayControl,
  JetKeyValueArrayControl: () => JetKeyValueArrayControl,
  JetKeyValueTypeArrayControl: () => JetKeyValueTypeArrayControl,
  JetNumberControl: () => JetNumberControl,
  JetSelectControl: () => JetSelectControl,
  JetSuggestionControl: () => JetSuggestionControl,
  JetTabLayout: () => JetTabLayout,
  JetTextControl: () => JetTextControl,
  JetVerticalLayout: () => JetVerticalLayout,
  checkboxTester: () => checkboxTester,
  codeJavascriptTester: () => codeJavascriptTester,
  codePgsqlTester: () => codePgsqlTester,
  dynamicArgsTester: () => dynamicArgsTester,
  groupLayoutTester: () => groupLayoutTester,
  jetFormsBaseRenderers: () => jetFormsBaseRenderers,
  jetFormsRenderers: () => jetFormsRenderers,
  keyTypeArrayTester: () => keyTypeArrayTester,
  keyValueArrayTester: () => keyValueArrayTester,
  keyValueTypeArrayTester: () => keyValueTypeArrayTester,
  numberInputTester: () => numberInputTester,
  selectInputTester: () => selectInputTester,
  suggestionInputTester: () => suggestionInputTester,
  tabRendererTester: () => tabRendererTester,
  textInputTester: () => textInputTester,
  verticalLayoutTester: () => verticalLayoutTester
});
module.exports = __toCommonJS(index_exports);

// src/renderers/index.js
var import_react23 = require("@jsonforms/react");

// src/renderers/CustomNumberInput.jsx
var import_react = __toESM(require("react"));
var import_prop_types = __toESM(require("prop-types"));
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
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "mb-3" }, /* @__PURE__ */ import_react.default.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"}`
    },
    label || description,
    " ",
    errors && errors.length > 0 && errors
  ), errors && errors.length > 0 && /* @__PURE__ */ import_react.default.createElement("span", { className: "text-red-500 text-xs" }, errors), /* @__PURE__ */ import_react.default.createElement(
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
  data: import_prop_types.default.number,
  path: import_prop_types.default.string.isRequired,
  handleChange: import_prop_types.default.func.isRequired,
  label: import_prop_types.default.string,
  description: import_prop_types.default.string,
  errors: import_prop_types.default.arrayOf(import_prop_types.default.string),
  uischema: import_prop_types.default.object.isRequired,
  schema: import_prop_types.default.object.isRequired
};

// src/renderers/CustomTextInput.jsx
var import_react2 = __toESM(require("react"));
var import_prop_types2 = __toESM(require("prop-types"));
var CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const isMulti = uischema?.options?.multi;
  const isDisabled = enabled === false;
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "mb-3" }, /* @__PURE__ */ import_react2.default.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"}`
    },
    label || description,
    " ",
    errors && errors.length > 0 && errors
  ), isMulti ? /* @__PURE__ */ import_react2.default.createElement(
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
  ) : /* @__PURE__ */ import_react2.default.createElement(
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
  data: import_prop_types2.default.string,
  path: import_prop_types2.default.string.isRequired,
  handleChange: import_prop_types2.default.func.isRequired,
  label: import_prop_types2.default.string,
  description: import_prop_types2.default.string,
  errors: import_prop_types2.default.arrayOf(import_prop_types2.default.string),
  uischema: import_prop_types2.default.object.isRequired,
  enabled: import_prop_types2.default.bool
};

// src/renderers/CustomSelectInput.jsx
var import_react3 = __toESM(require("react"));
var import_prop_types3 = __toESM(require("prop-types"));
var import_tb = require("react-icons/tb");
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
  const [isRefreshing, setIsRefreshing] = (0, import_react3.useState)(false);
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
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "mb-3" }, /* @__PURE__ */ import_react3.default.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"}`
    },
    label || description,
    " ",
    errors && errors.length > 0 && errors
  ), /* @__PURE__ */ import_react3.default.createElement("div", { className: `flex items-center gap-2 ${showRefreshButton ? "" : ""}` }, /* @__PURE__ */ import_react3.default.createElement(
    "select",
    {
      id: path,
      name: path,
      disabled: isDisabled,
      className: `placeholder:text-slate-400 text-sm bg-slate-50 border focus:border-slate-700 ${errors && errors.length > 0 ? "border-red-500 focus:border-red-500" : "border-slate-200"} text-slate-700 rounded block w-full px-2.5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed`,
      onChange: (ev) => handleChange(path, ev.target.value),
      value: data || ""
    },
    !data && /* @__PURE__ */ import_react3.default.createElement("option", { value: "", disabled: true }, uischema?.options?.placeholder || "Select an option"),
    options.map((optionValue) => /* @__PURE__ */ import_react3.default.createElement("option", { key: optionValue, value: optionValue }, getDisplayName(optionValue)))
  ), showRefreshButton && onRefresh && /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      type: "button",
      onClick: handleRefreshClick,
      disabled: isRefreshing || isDisabled,
      className: "flex-shrink-0 bg-slate-50 p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200",
      title: "Refresh list"
    },
    /* @__PURE__ */ import_react3.default.createElement(import_tb.TbRefresh, { className: `w-5 h-5 ${isRefreshing ? "animate-spin" : ""}` })
  )));
};
CustomSelectInput.propTypes = {
  data: import_prop_types3.default.string,
  path: import_prop_types3.default.string.isRequired,
  handleChange: import_prop_types3.default.func.isRequired,
  label: import_prop_types3.default.string,
  description: import_prop_types3.default.string,
  errors: import_prop_types3.default.arrayOf(import_prop_types3.default.string),
  schema: import_prop_types3.default.object.isRequired,
  uischema: import_prop_types3.default.object.isRequired,
  enabled: import_prop_types3.default.bool
};

// src/renderers/CustomCheckboxInput.jsx
var import_react4 = __toESM(require("react"));
var import_prop_types4 = __toESM(require("prop-types"));
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
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center mb-3" }, /* @__PURE__ */ import_react4.default.createElement(
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
  ), /* @__PURE__ */ import_react4.default.createElement("label", { htmlFor: path, className: "ml-2 text-sm font-medium text-slate-700" }, label || description || uischema.label), errors && errors.length > 0 && /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-red-500 text-xs mt-1 ml-2" }, errors));
};
CustomCheckboxInput.propTypes = {
  data: import_prop_types4.default.bool,
  path: import_prop_types4.default.string.isRequired,
  handleChange: import_prop_types4.default.func.isRequired,
  label: import_prop_types4.default.string,
  description: import_prop_types4.default.string,
  errors: import_prop_types4.default.arrayOf(import_prop_types4.default.string),
  enabled: import_prop_types4.default.bool.isRequired,
  uischema: import_prop_types4.default.object.isRequired
};

// src/renderers/CustomCodePgsqlControl.jsx
var import_react5 = __toESM(require("react"));
var import_prop_types5 = __toESM(require("prop-types"));
var import_react6 = __toESM(require("@monaco-editor/react"));
var import_GitHub_Light = __toESM(require("monaco-themes/themes/GitHub Light.json"));
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
  const tablesMap = (0, import_react5.useMemo)(() => {
    if (!databaseMetadata?.schemas) return {};
    const map = {};
    databaseMetadata.schemas.forEach((schemaItem) => {
      schemaItem.tables?.forEach((t) => {
        map[t.databaseTableName] = t.databaseTableColumns?.map((c) => c.databaseTableColumnName) || [];
      });
    });
    return map;
  }, [databaseMetadata]);
  const schemaRef = (0, import_react5.useRef)(tablesMap);
  (0, import_react5.useEffect)(() => {
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
    monaco.editor.defineTheme("github-light", import_GitHub_Light.default);
  };
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "mb-3" }, /* @__PURE__ */ import_react5.default.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"}`
    },
    label || description,
    " ",
    errors && errors.length > 0 && errors
  ), /* @__PURE__ */ import_react5.default.createElement("div", { className: "border border-slate-200 rounded p-1" }, /* @__PURE__ */ import_react5.default.createElement(
    import_react6.default,
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
  data: import_prop_types5.default.string,
  path: import_prop_types5.default.string.isRequired,
  handleChange: import_prop_types5.default.func.isRequired,
  enabled: import_prop_types5.default.bool.isRequired,
  uischema: import_prop_types5.default.object,
  label: import_prop_types5.default.string,
  description: import_prop_types5.default.string,
  errors: import_prop_types5.default.arrayOf(import_prop_types5.default.string)
};

// src/renderers/CustomCodeJavascriptControl.jsx
var import_react7 = __toESM(require("react"));
var import_prop_types6 = __toESM(require("prop-types"));
var import_react8 = __toESM(require("@monaco-editor/react"));
var import_GitHub_Light2 = __toESM(require("monaco-themes/themes/GitHub Light.json"));
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
    monaco.editor.defineTheme("github-light", import_GitHub_Light2.default);
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
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "mb-3" }, /* @__PURE__ */ import_react7.default.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"}`
    },
    label || description,
    " ",
    errors && errors.length > 0 && errors
  ), hint && /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-[10px] text-slate-400 mb-1" }, hint), /* @__PURE__ */ import_react7.default.createElement("div", { className: "border border-slate-200 rounded p-1" }, /* @__PURE__ */ import_react7.default.createElement(
    import_react8.default,
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
  data: import_prop_types6.default.string,
  path: import_prop_types6.default.string.isRequired,
  handleChange: import_prop_types6.default.func.isRequired,
  enabled: import_prop_types6.default.bool.isRequired,
  uischema: import_prop_types6.default.object,
  label: import_prop_types6.default.string,
  description: import_prop_types6.default.string,
  errors: import_prop_types6.default.arrayOf(import_prop_types6.default.string)
};

// src/renderers/CustomSuggestionInput.jsx
var import_react9 = __toESM(require("react"));
var import_prop_types7 = __toESM(require("prop-types"));
var CustomSuggestionInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const { suggestions, placeholder } = uischema.options || {};
  const [isOpen, setIsOpen] = (0, import_react9.useState)(false);
  const handleSelect = (value) => {
    const currentVal = data || "";
    handleChange(path, currentVal + value);
    setIsOpen(false);
  };
  return /* @__PURE__ */ import_react9.default.createElement("div", { className: "relative mb-3" }, /* @__PURE__ */ import_react9.default.createElement(
    "label",
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${errors && errors.length > 0 ? "text-red-500" : "text-slate-500"} flex justify-between items-center`
    },
    /* @__PURE__ */ import_react9.default.createElement("span", null, label || description, " ", errors && errors.length > 0 && errors),
    suggestions && suggestions.length > 0 && /* @__PURE__ */ import_react9.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => setIsOpen(!isOpen),
        disabled: !enabled,
        className: "text-[10px] bg-slate-100 text-purple-600 px-1.5 py-0.5 rounded border border-transparent hover:border-purple-200"
      },
      "Map +"
    )
  ), /* @__PURE__ */ import_react9.default.createElement(
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
  ), isOpen && suggestions && /* @__PURE__ */ import_react9.default.createElement("div", { className: "absolute right-0 top-6 w-48 bg-white border border-slate-200 shadow-xl rounded z-[50] max-h-40 overflow-y-auto" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "p-2 border-b border-slate-100 flex justify-between items-center bg-slate-50" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-[10px] font-semibold text-slate-500" }, "Pick a node"), /* @__PURE__ */ import_react9.default.createElement("button", { type: "button", onClick: () => setIsOpen(false), className: "text-slate-400 hover:text-slate-600" }, "\xD7")), suggestions.length === 0 ? /* @__PURE__ */ import_react9.default.createElement("div", { className: "px-2 py-1 text-[10px] text-slate-400 italic" }, "No suggestions") : suggestions.map((item, idx) => /* @__PURE__ */ import_react9.default.createElement(
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
  data: import_prop_types7.default.string,
  path: import_prop_types7.default.string.isRequired,
  handleChange: import_prop_types7.default.func.isRequired,
  label: import_prop_types7.default.string,
  description: import_prop_types7.default.string,
  errors: import_prop_types7.default.arrayOf(import_prop_types7.default.string),
  uischema: import_prop_types7.default.object.isRequired,
  enabled: import_prop_types7.default.bool
};

// src/renderers/DynamicArgsControl.jsx
var import_react10 = __toESM(require("react"));
var import_prop_types8 = __toESM(require("prop-types"));
var import_tb2 = require("react-icons/tb");
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
  return /* @__PURE__ */ import_react10.default.createElement("div", { className: "border border-slate-200 rounded p-3 mt-2 bg-white" }, /* @__PURE__ */ import_react10.default.createElement("label", { className: "block mb-2 text-xs font-medium text-slate-500" }, "Arguments"), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, args.map((arg, index) => {
    const argName = arg.key;
    return /* @__PURE__ */ import_react10.default.createElement(
      ArgInputWithVariablePicker,
      {
        key: `arg-${index}`,
        argName,
        value: argsData[argName] || "",
        onChange: (value) => handleArgChange(argName, value),
        availableVariables
      }
    );
  })), errors && errors.length > 0 && /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-red-500 text-xs mt-1" }, errors));
};
var ArgInputWithVariablePicker = ({ argName, value, onChange, availableVariables }) => {
  const [showDropdown, setShowDropdown] = (0, import_react10.useState)(false);
  const inputRef = (0, import_react10.useRef)(null);
  const dropdownRef = (0, import_react10.useRef)(null);
  (0, import_react10.useEffect)(() => {
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
  return /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex flex-row justify-between items-center gap-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react10.default.createElement("label", { className: "block mb-1 text-[10px] font-medium text-slate-400" }, argName), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ import_react10.default.createElement(
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
  ), /* @__PURE__ */ import_react10.default.createElement("div", { className: "relative", ref: dropdownRef }, /* @__PURE__ */ import_react10.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowDropdown(!showDropdown),
      className: `flex-shrink-0 p-1.5 rounded transition-colors border border-slate-200 bg-slate-50 ${availableVariables.length > 0 ? "text-blue-500 hover:text-blue-700 hover:bg-blue-50" : "text-slate-400 hover:text-slate-500 hover:bg-slate-100"}`,
      title: "Insert variable from previous node"
    },
    /* @__PURE__ */ import_react10.default.createElement(import_tb2.TbVariable, { className: "w-4 h-4" })
  ), showDropdown && /* @__PURE__ */ import_react10.default.createElement("div", { className: "absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100" }, "Available Variables"), availableVariables.length === 0 ? /* @__PURE__ */ import_react10.default.createElement("div", { className: "px-2 py-3 text-xs text-slate-400 text-center" }, "No variables available yet.", /* @__PURE__ */ import_react10.default.createElement("br", null), /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-[10px]" }, "Add more nodes with output variables.")) : availableVariables.map((variable, idx) => /* @__PURE__ */ import_react10.default.createElement(
    "button",
    {
      key: idx,
      type: "button",
      onClick: () => insertVariable(variable.contextPath),
      className: "w-full bg-white text-left px-2 py-1.5 hover:bg-slate-100 hover:border-none border-none rounded-none transition-colors border-b border-slate-50 last:border-b-0"
    },
    /* @__PURE__ */ import_react10.default.createElement("div", { className: "text-xs font-medium text-slate-700 font-mono" }, variable.contextPath),
    /* @__PURE__ */ import_react10.default.createElement("div", { className: "text-[10px] text-slate-400 truncate" }, "from: ", variable.nodeTitle)
  )))))));
};
DynamicArgsControl.propTypes = {
  data: import_prop_types8.default.object,
  path: import_prop_types8.default.string.isRequired,
  handleChange: import_prop_types8.default.func.isRequired,
  uischema: import_prop_types8.default.object.isRequired,
  errors: import_prop_types8.default.arrayOf(import_prop_types8.default.string)
};

// src/renderers/CustomKeyValueArrayRenderer.jsx
var import_react11 = __toESM(require("react"));
var import_prop_types9 = __toESM(require("prop-types"));
var import_react12 = require("@jsonforms/react");
var import_md = require("react-icons/md");
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
  return /* @__PURE__ */ import_react11.default.createElement("div", { className: "p-3 border border-slate-200 rounded bg-white mb-3" }, /* @__PURE__ */ import_react11.default.createElement("label", { className: "block mb-1 text-sm font-medium text-slate-700" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ import_react11.default.createElement("div", { className: "gap-2" }, items.map((item, index) => /* @__PURE__ */ import_react11.default.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react11.default.createElement(
    import_react12.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react11.default.createElement(
    import_react12.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react11.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleRemoveItem(index),
      className: "mt-5 p-2 rounded bg-red-100 text-red-400 focus:outline-none hover:border-red-400"
    },
    /* @__PURE__ */ import_react11.default.createElement(import_md.MdDeleteOutline, null)
  )))), /* @__PURE__ */ import_react11.default.createElement(
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
  data: import_prop_types9.default.arrayOf(import_prop_types9.default.object),
  path: import_prop_types9.default.string.isRequired,
  handleChange: import_prop_types9.default.func.isRequired,
  schema: import_prop_types9.default.object.isRequired,
  uischema: import_prop_types9.default.object.isRequired,
  label: import_prop_types9.default.string,
  description: import_prop_types9.default.string,
  errors: import_prop_types9.default.arrayOf(import_prop_types9.default.string),
  enabled: import_prop_types9.default.bool,
  renderers: import_prop_types9.default.arrayOf(import_prop_types9.default.object).isRequired
};

// src/renderers/CustomKeyValueTypeArrayRenderer.jsx
var import_react13 = __toESM(require("react"));
var import_prop_types10 = __toESM(require("prop-types"));
var import_react14 = require("@jsonforms/react");
var import_md2 = require("react-icons/md");
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
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "p-3 border border-slate-200 rounded bg-white mb-3" }, /* @__PURE__ */ import_react13.default.createElement("label", { className: "block mb-1 text-sm font-medium text-slate-700" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ import_react13.default.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ import_react13.default.createElement("div", { className: "gap-2" }, items.map((item, index) => /* @__PURE__ */ import_react13.default.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react13.default.createElement(
    import_react14.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react13.default.createElement(
    import_react14.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react13.default.createElement(
    import_react14.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleRemoveItem(index),
      className: "mt-5 p-2 rounded bg-red-100 text-red-400 focus:outline-none hover:border-red-400"
    },
    /* @__PURE__ */ import_react13.default.createElement(import_md2.MdDeleteOutline, null)
  )))), /* @__PURE__ */ import_react13.default.createElement(
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
  data: import_prop_types10.default.arrayOf(import_prop_types10.default.object),
  path: import_prop_types10.default.string.isRequired,
  handleChange: import_prop_types10.default.func.isRequired,
  schema: import_prop_types10.default.object.isRequired,
  uischema: import_prop_types10.default.object.isRequired,
  label: import_prop_types10.default.string,
  description: import_prop_types10.default.string,
  errors: import_prop_types10.default.arrayOf(import_prop_types10.default.string),
  enabled: import_prop_types10.default.bool,
  renderers: import_prop_types10.default.arrayOf(import_prop_types10.default.object).isRequired
};

// src/renderers/CustomKeyTypeArrayRenderer.jsx
var import_react15 = __toESM(require("react"));
var import_prop_types11 = __toESM(require("prop-types"));
var import_react16 = require("@jsonforms/react");
var import_md3 = require("react-icons/md");
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
  return /* @__PURE__ */ import_react15.default.createElement("div", { className: "p-3 border mt-3 border-slate-200 rounded bg-white mb-3" }, /* @__PURE__ */ import_react15.default.createElement("label", { className: "block mb-1 text-sm font-medium text-slate-700" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ import_react15.default.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ import_react15.default.createElement("div", { className: "flex flex-col gap-2" }, items.map((item, index) => /* @__PURE__ */ import_react15.default.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ import_react15.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react15.default.createElement(
    import_react16.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react15.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react15.default.createElement(
    import_react16.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react15.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleRemoveItem(index),
      className: "mt-2 p-2 rounded bg-red-100 text-red-400 focus:outline-none hover:border-red-400"
    },
    /* @__PURE__ */ import_react15.default.createElement(import_md3.MdDeleteOutline, null)
  )))), /* @__PURE__ */ import_react15.default.createElement(
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
  data: import_prop_types11.default.arrayOf(import_prop_types11.default.object),
  path: import_prop_types11.default.string.isRequired,
  handleChange: import_prop_types11.default.func.isRequired,
  schema: import_prop_types11.default.object.isRequired,
  uischema: import_prop_types11.default.object.isRequired,
  label: import_prop_types11.default.string,
  description: import_prop_types11.default.string,
  errors: import_prop_types11.default.arrayOf(import_prop_types11.default.string),
  enabled: import_prop_types11.default.bool,
  renderers: import_prop_types11.default.arrayOf(import_prop_types11.default.object).isRequired
};

// src/renderers/CustomGroupLayout.jsx
var import_react17 = __toESM(require("react"));
var import_prop_types12 = __toESM(require("prop-types"));
var import_react18 = require("@jsonforms/react");
var CustomGroupLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];
  const customClass = uischema.options?.customClass || "";
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ import_react17.default.createElement("div", { className: `border border-slate-200 rounded p-3 mt-2 bg-white ${customClass}` }, uischema.label && /* @__PURE__ */ import_react17.default.createElement("h3", { className: "text-xs font-medium text-slate-500 mb-2" }, uischema.label), /* @__PURE__ */ import_react17.default.createElement("div", { className: "flex flex-col gap-2" }, elements.map((element, index) => /* @__PURE__ */ import_react17.default.createElement(
    import_react18.JsonFormsDispatch,
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
  uischema: import_prop_types12.default.object.isRequired,
  schema: import_prop_types12.default.object.isRequired,
  path: import_prop_types12.default.string.isRequired,
  visible: import_prop_types12.default.bool.isRequired,
  enabled: import_prop_types12.default.bool.isRequired,
  renderers: import_prop_types12.default.arrayOf(import_prop_types12.default.object).isRequired,
  cells: import_prop_types12.default.arrayOf(import_prop_types12.default.object)
};

// src/renderers/CustomVerticalLayout.jsx
var import_react19 = __toESM(require("react"));
var import_prop_types13 = __toESM(require("prop-types"));
var import_react20 = require("@jsonforms/react");
var CustomVerticalLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ import_react19.default.createElement("div", { className: "flex flex-col" }, elements.map((element, index) => /* @__PURE__ */ import_react19.default.createElement(
    import_react20.JsonFormsDispatch,
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
  uischema: import_prop_types13.default.object.isRequired,
  schema: import_prop_types13.default.object.isRequired,
  path: import_prop_types13.default.string.isRequired,
  visible: import_prop_types13.default.bool.isRequired,
  enabled: import_prop_types13.default.bool.isRequired,
  renderers: import_prop_types13.default.arrayOf(import_prop_types13.default.object).isRequired,
  cells: import_prop_types13.default.arrayOf(import_prop_types13.default.object)
};

// src/renderers/CustomTabRenderer.jsx
var import_react21 = __toESM(require("react"));
var import_prop_types14 = __toESM(require("prop-types"));
var import_react22 = require("@jsonforms/react");
var CustomTabRenderer = (props) => {
  const { uischema, schema, path, enabled, renderers, cells } = props;
  const categories = uischema.elements || [];
  const [activeTab, setActiveTab] = (0, import_react21.useState)(0);
  if (!categories || categories.length === 0) {
    return null;
  }
  const activeCategory = categories[activeTab];
  return /* @__PURE__ */ import_react21.default.createElement("div", { className: "custom-tabs-container" }, /* @__PURE__ */ import_react21.default.createElement("div", { className: "flex border-slate-300" }, categories.map((category, index) => /* @__PURE__ */ import_react21.default.createElement(
    "button",
    {
      key: category.label || `tab-${index}`,
      className: `px-4 mr-2 py-2 text-sm font-medium rounded ${index === activeTab ? "text-[#646cff] border-slate-200" : "text-slate-700"} focus:outline-none bg-white`,
      onClick: () => setActiveTab(index),
      type: "button"
    },
    category.label
  ))), /* @__PURE__ */ import_react21.default.createElement("div", { className: "p-3 border mt-3 border-slate-200 rounded bg-white flex flex-col gap-2" }, activeCategory?.elements.map((element, i) => /* @__PURE__ */ import_react21.default.createElement(
    import_react22.JsonFormsDispatch,
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
  uischema: import_prop_types14.default.shape({
    type: import_prop_types14.default.string.isRequired,
    elements: import_prop_types14.default.arrayOf(import_prop_types14.default.object).isRequired
  }).isRequired,
  schema: import_prop_types14.default.object.isRequired,
  path: import_prop_types14.default.string.isRequired,
  enabled: import_prop_types14.default.bool.isRequired,
  renderers: import_prop_types14.default.arrayOf(import_prop_types14.default.object).isRequired,
  cells: import_prop_types14.default.arrayOf(import_prop_types14.default.object)
};

// src/renderers/index.js
var JetNumberControl = (0, import_react23.withJsonFormsControlProps)(CustomNumberInput);
var JetTextControl = (0, import_react23.withJsonFormsControlProps)(CustomTextInput);
var JetSelectControl = (0, import_react23.withJsonFormsControlProps)(CustomSelectInput);
var JetCheckboxControl = (0, import_react23.withJsonFormsControlProps)(CustomCheckboxInput);
var JetCodePgsqlControl = (0, import_react23.withJsonFormsControlProps)(CustomCodePgsqlControl);
var JetCodeJavascriptControl = (0, import_react23.withJsonFormsControlProps)(CustomCodeJavascriptControl);
var JetSuggestionControl = (0, import_react23.withJsonFormsControlProps)(CustomSuggestionInput);
var JetDynamicArgsControl = (0, import_react23.withJsonFormsControlProps)(DynamicArgsControl);
var JetKeyValueArrayControl = (0, import_react23.withJsonFormsControlProps)(CustomKeyValueArrayRenderer);
var JetKeyValueTypeArrayControl = (0, import_react23.withJsonFormsControlProps)(CustomKeyValueTypeArrayRenderer);
var JetKeyTypeArrayControl = (0, import_react23.withJsonFormsControlProps)(CustomKeyTypeArrayRenderer);
var JetGroupLayout = (0, import_react23.withJsonFormsLayoutProps)(CustomGroupLayout);
var JetVerticalLayout = (0, import_react23.withJsonFormsLayoutProps)(CustomVerticalLayout);
var JetTabLayout = (0, import_react23.withJsonFormsLayoutProps)(CustomTabRenderer);

// src/testers.js
var import_core = require("@jsonforms/core");
var numberInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const currentSchema = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
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
    const currentSchema = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
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
    const currentSchema = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
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
    const current = import_core.Resolve.schema(schema, uischema.scope, schema);
    if (current && current.type === "boolean") {
      return 10;
    }
  } catch (e) {
    console.warn(e);
    return -1;
  }
  return -1;
};
var codePgsqlTester = (0, import_core.rankWith)(
  100,
  (0, import_core.and)(import_core.isControl, (0, import_core.formatIs)("code-pgsql"))
);
var codeJavascriptTester = (0, import_core.rankWith)(
  100,
  (0, import_core.and)(import_core.isControl, (0, import_core.formatIs)("code-javascript"))
);
var suggestionInputTester = (0, import_core.rankWith)(
  50,
  (0, import_core.and)(import_core.isControl, (uischema) => uischema.options && uischema.options.suggestionType === "nodeOutput")
);
var dynamicArgsTester = (0, import_core.rankWith)(
  20,
  (0, import_core.and)(import_core.isControl, (uischema) => uischema?.options?.isDynamicArgs === true)
);
var keyValueArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const schemaAtScope = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
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
    const schemaAtScope = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
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
    const schemaAtScope = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
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
  return (0, import_core.rankWith)(10, (0, import_core.uiTypeIs)("Group"))(uischema);
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
//# sourceMappingURL=index.cjs.map
