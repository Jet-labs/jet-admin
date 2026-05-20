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
  CustomCodeEditorControl: () => CustomCodeEditorControl,
  CustomCodeJavascriptControl: () => CustomCodeEditorControl,
  CustomCodePgsqlControl: () => CustomCodeEditorControl,
  CustomFieldOperatorValueArrayRenderer: () => CustomFieldOperatorValueArrayRenderer,
  CustomGenericObjectArrayRenderer: () => CustomGenericObjectArrayRenderer,
  CustomGroupLayout: () => CustomGroupLayout,
  CustomHorizontalLayout: () => CustomHorizontalLayout,
  CustomKeyTypeArrayRenderer: () => CustomKeyTypeArrayRenderer,
  CustomKeyValueArrayRenderer: () => CustomKeyValueArrayRenderer,
  CustomKeyValueTypeArrayRenderer: () => CustomKeyValueTypeArrayRenderer,
  CustomNumberInput: () => CustomNumberInput,
  CustomRadioInput: () => CustomRadioInput,
  CustomSelectInput: () => CustomSelectInput,
  CustomStringArrayRenderer: () => CustomStringArrayRenderer,
  CustomSuggestionInput: () => CustomSuggestionInput,
  CustomTabRenderer: () => CustomTabRenderer,
  CustomTextInput: () => CustomTextInput,
  CustomVerticalLayout: () => CustomVerticalLayout,
  DynamicArgsControl: () => DynamicArgsControl,
  JetCheckboxControl: () => JetCheckboxControl,
  JetCodeEditorControl: () => JetCodeEditorControl,
  JetCodeJavascriptControl: () => JetCodeEditorControl,
  JetCodePgsqlControl: () => JetCodeEditorControl,
  JetDynamicArgsControl: () => JetDynamicArgsControl,
  JetFieldOperatorValueArrayControl: () => JetFieldOperatorValueArrayControl,
  JetGenericObjectArrayControl: () => JetGenericObjectArrayControl,
  JetGroupLayout: () => JetGroupLayout,
  JetHorizontalLayout: () => JetHorizontalLayout,
  JetKeyTypeArrayControl: () => JetKeyTypeArrayControl,
  JetKeyValueArrayControl: () => JetKeyValueArrayControl,
  JetKeyValueTypeArrayControl: () => JetKeyValueTypeArrayControl,
  JetNumberControl: () => JetNumberControl,
  JetRadioControl: () => JetRadioControl,
  JetSelectControl: () => JetSelectControl,
  JetStringArrayControl: () => JetStringArrayControl,
  JetSuggestionControl: () => JetSuggestionControl,
  JetTabLayout: () => JetTabLayout,
  JetTextControl: () => JetTextControl,
  JetVerticalLayout: () => JetVerticalLayout,
  checkboxTester: () => checkboxTester,
  codeEditorTester: () => codeEditorTester,
  codeJavascriptTester: () => codeEditorTester,
  codePgsqlTester: () => codeEditorTester,
  dynamicArgsTester: () => dynamicArgsTester,
  fieldOperatorValueArrayTester: () => fieldOperatorValueArrayTester,
  genericObjectArrayTester: () => genericObjectArrayTester,
  groupLayoutTester: () => groupLayoutTester,
  jetFormsBaseRenderers: () => jetFormsBaseRenderers,
  jetFormsRenderers: () => jetFormsRenderers,
  keyTypeArrayTester: () => keyTypeArrayTester,
  keyValueArrayTester: () => keyValueArrayTester,
  keyValueTypeArrayTester: () => keyValueTypeArrayTester,
  numberInputTester: () => numberInputTester,
  radioInputTester: () => radioInputTester,
  selectInputTester: () => selectInputTester,
  stringArrayTester: () => stringArrayTester,
  suggestionInputTester: () => suggestionInputTester,
  tabRendererTester: () => tabRendererTester,
  textInputTester: () => textInputTester,
  verticalLayoutTester: () => verticalLayoutTester
});
module.exports = __toCommonJS(index_exports);

// src/renderers/index.js
var import_react27 = require("@jsonforms/react");

// src/renderers/CustomNumberInput.jsx
var import_react = __toESM(require("react"));
var import_prop_types = __toESM(require("prop-types"));
var import_ui = require("@jet-admin/ui");
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
  const hasErrors = errors && errors.length > 0;
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "" }, /* @__PURE__ */ import_react.default.createElement(
    import_ui.Label,
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description
  ), /* @__PURE__ */ import_react.default.createElement(
    import_ui.Input,
    {
      size: "sm",
      type: "number",
      id: path,
      name: path,
      className: hasErrors ? "border-red-500 focus:border-red-500" : "",
      placeholder: hasErrors ? errors : uischema?.options?.placeholder || "",
      onChange: handleInputChange,
      value: data === void 0 || data === null ? "" : data,
      min: schema.minimum,
      max: schema.maximum,
      step
    }
  ), hasErrors && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
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
var import_ui2 = require("@jet-admin/ui");
var CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const isMulti = uischema?.options?.multi;
  const isDisabled = enabled === false;
  const hasErrors = errors && errors.length > 0;
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "" }, /* @__PURE__ */ import_react2.default.createElement(
    import_ui2.Label,
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description
  ), isMulti ? /* @__PURE__ */ import_react2.default.createElement(
    import_ui2.Textarea,
    {
      id: path,
      name: path,
      disabled: isDisabled,
      className: hasErrors ? "border-red-500 focus:border-red-500" : "",
      placeholder: hasErrors ? errors : uischema?.options?.placeholder || "",
      onChange: (ev) => handleChange(path, ev.target.value),
      value: data || "",
      rows: uischema?.options?.rows || 3
    }
  ) : /* @__PURE__ */ import_react2.default.createElement(
    import_ui2.Input,
    {
      size: "sm",
      type: uischema?.options?.format === "password" ? "password" : "text",
      id: path,
      name: path,
      disabled: isDisabled,
      className: hasErrors ? "border-red-500 focus:border-red-500" : "",
      placeholder: hasErrors ? errors : uischema?.options?.placeholder || "",
      onChange: (ev) => handleChange(path, ev.target.value),
      value: data || ""
    }
  ), hasErrors && /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
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
var import_lucide_react = require("lucide-react");
var import_ui3 = require("@jet-admin/ui");
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
  const hasErrors = errors && errors.length > 0;
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "" }, /* @__PURE__ */ import_react3.default.createElement(
    import_ui3.Label,
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description
  ), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react3.default.createElement(import_ui3.Select, { value: data || "", onValueChange: (val) => handleChange(path, val), disabled: isDisabled }, /* @__PURE__ */ import_react3.default.createElement(
    import_ui3.SelectTrigger,
    {
      id: path,
      size: "sm",
      className: `${hasErrors ? "border-red-500" : ""}`
    },
    /* @__PURE__ */ import_react3.default.createElement(import_ui3.SelectValue, { placeholder: uischema?.options?.placeholder || "Select an option" })
  ), /* @__PURE__ */ import_react3.default.createElement(import_ui3.SelectContent, null, options.map((optionValue) => /* @__PURE__ */ import_react3.default.createElement(import_ui3.SelectItem, { key: optionValue, value: optionValue }, getDisplayName(optionValue))))), showRefreshButton && onRefresh && /* @__PURE__ */ import_react3.default.createElement(
    import_ui3.Button,
    {
      type: "button",
      variant: "outline",
      size: "icon",
      square: true,
      onClick: handleRefreshClick,
      disabled: isRefreshing || isDisabled,
      title: "Refresh list"
    },
    /* @__PURE__ */ import_react3.default.createElement(import_lucide_react.RefreshCw, { className: `w-4 h-4 ${isRefreshing ? "animate-spin" : ""}` })
  )), hasErrors && /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
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
var import_ui4 = require("@jet-admin/ui");
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
  const onToggle = (checked) => {
    handleChange(path, checked);
  };
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ import_react4.default.createElement(
    import_ui4.Checkbox,
    {
      id: path,
      checked: !!data,
      disabled: !enabled,
      onCheckedChange: onToggle
    }
  ), /* @__PURE__ */ import_react4.default.createElement(import_ui4.Label, { htmlFor: path, className: "ml-2 text-sm font-medium text-foreground" }, label || description || uischema.label), errors && errors.length > 0 && /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-red-500 text-xs mt-1 ml-2" }, errors));
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

// src/renderers/CustomCodeEditorControl.jsx
var import_react5 = __toESM(require("react"));
var import_prop_types5 = __toESM(require("prop-types"));
var import_ui5 = require("@jet-admin/ui");

// src/renderers/templateCompletion.js
var ROOT_COMPLETIONS = [
  {
    label: "args",
    detail: "Configured query arguments"
  },
  {
    label: "runtimeArgs",
    detail: "Runtime query arguments"
  }
];
var IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
var getUniqueQueryArgs = (queryArgs = []) => {
  const seen = /* @__PURE__ */ new Set();
  return queryArgs.filter((queryArg) => typeof queryArg?.key === "string" && queryArg.key.trim()).map((queryArg) => ({
    key: queryArg.key.trim(),
    type: queryArg.type
  })).filter((queryArg) => {
    if (seen.has(queryArg.key)) {
      return false;
    }
    seen.add(queryArg.key);
    return true;
  });
};
var buildAccessExpression = (rootLabel, key) => {
  if (IDENTIFIER_REGEX.test(key)) {
    return `${rootLabel}.${key}`;
  }
  return `${rootLabel}["${key.replaceAll('"', '\\"')}"]`;
};
var getTemplateCompletionContext = (model, position) => {
  const textBeforeCursor = model.getValueInRange({
    startLineNumber: position.lineNumber,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column
  });
  const lastOpenIndex = textBeforeCursor.lastIndexOf("{{");
  const lastCloseIndex = textBeforeCursor.lastIndexOf("}}");
  if (lastOpenIndex === -1 || lastCloseIndex > lastOpenIndex) {
    return null;
  }
  return {
    expression: textBeforeCursor.slice(lastOpenIndex + 2),
    range: {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: lastOpenIndex + 3,
      endColumn: position.column
    }
  };
};
var buildTemplateSuggestions = ({ monaco, context, queryArgs = [] }) => {
  if (!context) {
    return [];
  }
  const normalizedExpression = context.expression.replace(/^\s*/, "");
  const normalizedQueryArgs = getUniqueQueryArgs(queryArgs);
  const templateSuggestions = [];
  const pushRootSuggestions = (partial = "") => {
    ROOT_COMPLETIONS.filter(
      (rootCompletion) => rootCompletion.label.toLowerCase().startsWith(partial.toLowerCase())
    ).forEach((rootCompletion) => {
      templateSuggestions.push({
        label: rootCompletion.label,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: `${rootCompletion.label}.`,
        detail: rootCompletion.detail,
        command: {
          id: "editor.action.triggerSuggest",
          title: "Trigger suggest"
        },
        range: context.range,
        sortText: `0-${rootCompletion.label}`
      });
    });
  };
  const pushQueryArgSuggestions = (rootLabel, partial = "") => {
    normalizedQueryArgs.filter((queryArg) => queryArg.key.toLowerCase().startsWith(partial.toLowerCase())).forEach((queryArg) => {
      templateSuggestions.push({
        label: queryArg.key,
        kind: monaco.languages.CompletionItemKind.Field,
        insertText: buildAccessExpression(rootLabel, queryArg.key),
        detail: queryArg.type ? `Query arg (${queryArg.type})` : "Configured query arg",
        documentation: `Insert ${buildAccessExpression(rootLabel, queryArg.key)}`,
        range: context.range,
        sortText: `0-${rootLabel}-${queryArg.key}`
      });
    });
  };
  if (!normalizedExpression) {
    pushRootSuggestions();
    return templateSuggestions;
  }
  const dotAccessMatch = normalizedExpression.match(/^(args|runtimeArgs)(?:\.([A-Za-z0-9_$-]*))?$/);
  if (dotAccessMatch) {
    if (dotAccessMatch[2] === void 0) {
      pushRootSuggestions(dotAccessMatch[1]);
      return templateSuggestions;
    }
    pushQueryArgSuggestions(dotAccessMatch[1], dotAccessMatch[2]);
    return templateSuggestions;
  }
  const bracketAccessMatch = normalizedExpression.match(/^(args|runtimeArgs)\[(?:["']?([^"'\]]*))?$/);
  if (bracketAccessMatch) {
    pushQueryArgSuggestions(bracketAccessMatch[1], bracketAccessMatch[2] || "");
    return templateSuggestions;
  }
  pushRootSuggestions(normalizedExpression);
  return templateSuggestions;
};

// src/renderers/CustomCodeEditorControl.jsx
var CustomCodeEditorControl = ({
  data,
  path,
  label,
  description,
  errors,
  handleChange,
  enabled,
  uischema,
  schema
}) => {
  const {
    databaseMetadata,
    queryArgs = [],
    height = "140px",
    placeholder,
    hint
  } = uischema.options || {};
  const format = schema?.format || "";
  const language = (0, import_react5.useMemo)(() => {
    if (["code-pgsql", "code-sql", "code-mysql"].includes(format)) return "sql";
    if (format === "code-javascript") return "javascript";
    if (format === "code-json") return "json";
    if (format === "code-html") return "html";
    if (format === "code-css") return "css";
    if (format.startsWith("code-")) return format.replace("code-", "");
    return "javascript";
  }, [format]);
  const tablesMap = (0, import_react5.useMemo)(() => {
    if (language !== "sql" || !databaseMetadata?.schemas) return {};
    const map = {};
    databaseMetadata.schemas.forEach((schemaItem) => {
      schemaItem.tables?.forEach((t) => {
        map[t.databaseTableName] = t.databaseTableColumns?.map((c) => c.databaseTableColumnName) || [];
      });
    });
    return map;
  }, [databaseMetadata, language]);
  const schemaRef = (0, import_react5.useRef)(tablesMap);
  const queryArgsRef = (0, import_react5.useRef)(queryArgs);
  (0, import_react5.useEffect)(() => {
    schemaRef.current = tablesMap;
  }, [tablesMap]);
  (0, import_react5.useEffect)(() => {
    queryArgsRef.current = queryArgs;
  }, [queryArgs]);
  const handleBeforeMount = (monaco) => {
    if (language === "sql") {
      monaco.languages.registerCompletionItemProvider("sql", {
        triggerCharacters: [".", " ", "{", "[", '"', "'"],
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
          const templateContext = getTemplateCompletionContext(model, pos);
          if (templateContext) {
            return {
              suggestions: buildTemplateSuggestions({
                monaco,
                context: templateContext,
                queryArgs: queryArgsRef.current
              })
            };
          }
          const suggestions = [];
          const tableMatch = text.match(/(\\b\\w+)\\.$/);
          ;
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
    }
    if (language === "javascript") {
      monaco.languages.registerCompletionItemProvider("javascript", {
        triggerCharacters: [".", "{", "[", '"', "'", " "],
        provideCompletionItems: (model, position) => {
          const templateContext = getTemplateCompletionContext(model, position);
          if (templateContext) {
            return {
              suggestions: buildTemplateSuggestions({
                monaco,
                context: templateContext,
                queryArgs: queryArgsRef.current
              })
            };
          }
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
    }
  };
  const hasErrors = errors && errors.length > 0;
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "" }, /* @__PURE__ */ import_react5.default.createElement(
    import_ui5.Label,
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description
  ), hint && /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-[10px] text-muted-foreground mb-1" }, hint), /* @__PURE__ */ import_react5.default.createElement(
    import_ui5.CodeEditor,
    {
      value: data || placeholder || "",
      onChange: (val) => handleChange(path, val || ""),
      language,
      height,
      disabled: !enabled,
      showHeader: false,
      beforeMount: handleBeforeMount,
      status: hasErrors ? "error" : null
    }
  ), hasErrors && /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
};
CustomCodeEditorControl.propTypes = {
  data: import_prop_types5.default.string,
  path: import_prop_types5.default.string.isRequired,
  handleChange: import_prop_types5.default.func.isRequired,
  enabled: import_prop_types5.default.bool.isRequired,
  uischema: import_prop_types5.default.object,
  schema: import_prop_types5.default.object,
  label: import_prop_types5.default.string,
  description: import_prop_types5.default.string,
  errors: import_prop_types5.default.arrayOf(import_prop_types5.default.string)
};

// src/renderers/CustomSuggestionInput.jsx
var import_react6 = __toESM(require("react"));
var import_prop_types6 = __toESM(require("prop-types"));
var import_ui6 = require("@jet-admin/ui");
var CustomSuggestionInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const { suggestions, placeholder } = uischema.options || {};
  const [isOpen, setIsOpen] = (0, import_react6.useState)(false);
  const hasErrors = errors && errors.length > 0;
  const handleSelect = (value) => {
    const currentVal = data || "";
    handleChange(path, currentVal + value);
    setIsOpen(false);
  };
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "relative mb-3" }, /* @__PURE__ */ import_react6.default.createElement(
    import_ui6.Label,
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"} flex justify-between items-center`
    },
    /* @__PURE__ */ import_react6.default.createElement("span", null, label || description),
    suggestions && suggestions.length > 0 && /* @__PURE__ */ import_react6.default.createElement(
      import_ui6.Button,
      {
        type: "button",
        variant: "ghost",
        size: "sm",
        onClick: () => setIsOpen(!isOpen),
        disabled: !enabled
      },
      "Map +"
    )
  ), /* @__PURE__ */ import_react6.default.createElement(
    import_ui6.Input,
    {
      size: "sm",
      type: "text",
      id: path,
      name: path,
      disabled: !enabled,
      className: hasErrors ? "border-red-500 focus:border-red-500" : "",
      placeholder: errors || placeholder || "",
      onChange: (ev) => handleChange(path, ev.target.value),
      value: data || ""
    }
  ), hasErrors && /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors), isOpen && suggestions && /* @__PURE__ */ import_react6.default.createElement("div", { className: "absolute right-0 top-6 w-48 bg-background border border-border shadow-xl rounded-sm z-[50] max-h-40 overflow-y-auto" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "p-2 border-b border-border flex justify-between items-center bg-muted/50" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-[10px] font-semibold text-muted-foreground" }, "Pick a node"), /* @__PURE__ */ import_react6.default.createElement(import_ui6.Button, { type: "button", variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => setIsOpen(false) }, "\xD7")), suggestions.length === 0 ? /* @__PURE__ */ import_react6.default.createElement("div", { className: "px-2 py-1 text-[10px] text-muted-foreground italic" }, "No suggestions") : suggestions.map((item, idx) => /* @__PURE__ */ import_react6.default.createElement(
    "div",
    {
      key: idx,
      className: "px-2 py-1.5 text-xs hover:bg-primary/5 cursor-pointer truncate text-foreground border-b border-border/50 last:border-0",
      onClick: () => handleSelect(item.value)
    },
    item.label
  ))));
};
CustomSuggestionInput.propTypes = {
  data: import_prop_types6.default.string,
  path: import_prop_types6.default.string.isRequired,
  handleChange: import_prop_types6.default.func.isRequired,
  label: import_prop_types6.default.string,
  description: import_prop_types6.default.string,
  errors: import_prop_types6.default.arrayOf(import_prop_types6.default.string),
  uischema: import_prop_types6.default.object.isRequired,
  enabled: import_prop_types6.default.bool
};

// src/renderers/DynamicArgsControl.jsx
var import_react7 = __toESM(require("react"));
var import_prop_types7 = __toESM(require("prop-types"));
var import_lucide_react2 = require("lucide-react");
var import_ui7 = require("@jet-admin/ui");
var DynamicArgsControl = (props) => {
  const { data, path, handleChange, uischema, errors } = props;
  const args = uischema?.options?.args || [];
  const workflowNodes = uischema?.options?.workflowNodes || [];
  const workflowEdges = uischema?.options?.workflowEdges || [];
  const workflowInputArgs = uischema?.options?.workflowInputArgs || [];
  const currentNodeId = uischema?.options?.currentNodeId || null;
  const argsData = data || {};
  const handleArgChange = (argKey, value) => {
    handleChange(path, { ...argsData, [argKey]: value });
  };
  const getUpstreamNodeIds = (0, import_react7.useMemo)(() => {
    if (!currentNodeId || !workflowEdges || workflowEdges.length === 0) {
      return /* @__PURE__ */ new Set();
    }
    const upstreamIds = /* @__PURE__ */ new Set();
    const visited = /* @__PURE__ */ new Set();
    const queue = [currentNodeId];
    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      const incomingEdges = workflowEdges.filter((e) => e.target === nodeId);
      for (const edge of incomingEdges) {
        if (!visited.has(edge.source)) {
          upstreamIds.add(edge.source);
          queue.push(edge.source);
        }
      }
    }
    return upstreamIds;
  }, [currentNodeId, workflowEdges]);
  const getAvailableVariables = () => {
    const variables = [];
    if (workflowInputArgs && workflowInputArgs.length > 0) {
      workflowInputArgs.forEach((arg) => {
        if (arg.key) {
          variables.push({
            nodeId: "input",
            nodeTitle: "Workflow Input",
            variableName: arg.key,
            contextPath: `ctx.input.${arg.key}`,
            category: "input",
            type: arg.type || "string"
          });
        }
      });
    }
    if (workflowNodes && workflowNodes.length > 0) {
      const nodeVariables = workflowNodes.filter((node) => node.id !== currentNodeId).filter((node) => getUpstreamNodeIds.has(node.id)).filter((node) => node.data?.outputVariable).map((node) => ({
        nodeId: node.id,
        nodeTitle: node.data?.title || node.data?.label || node.type,
        variableName: node.data.outputVariable,
        contextPath: `ctx.${node.data.outputVariable}`,
        category: "node"
      }));
      variables.push(...nodeVariables);
    }
    return variables;
  };
  const availableVariables = getAvailableVariables();
  if (args.length === 0) {
    return null;
  }
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "border border-border rounded-sm p-2 bg-background" }, /* @__PURE__ */ import_react7.default.createElement(import_ui7.Label, { className: "block mb-2 text-xs font-medium text-muted-foreground" }, "Arguments"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "space-y-2" }, args.map((arg, index) => {
    const argName = arg.key;
    return /* @__PURE__ */ import_react7.default.createElement(
      ArgInputWithVariablePicker,
      {
        key: `arg-${index}`,
        argName,
        value: argsData[argName] || "",
        onChange: (value) => handleArgChange(argName, value),
        availableVariables
      }
    );
  })), errors && errors.length > 0 && /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-red-500 text-xs mt-1" }, errors));
};
var ArgInputWithVariablePicker = ({ argName, value, onChange, availableVariables }) => {
  const [showDropdown, setShowDropdown] = (0, import_react7.useState)(false);
  const inputRef = (0, import_react7.useRef)(null);
  const dropdownRef = (0, import_react7.useRef)(null);
  (0, import_react7.useEffect)(() => {
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
      const mustacheVar = `{{${contextPath}}}`;
      const newValue = value.substring(0, start) + mustacheVar + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        input.focus();
        const newCursorPos = start + mustacheVar.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      onChange(`{{${contextPath}}}`);
    }
    setShowDropdown(false);
  };
  const inputVariables = availableVariables.filter((v) => v.category === "input");
  const nodeVariables = availableVariables.filter((v) => v.category === "node");
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex flex-row justify-between items-center gap-2" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react7.default.createElement(import_ui7.Label, { className: "block mb-1 text-[10px] font-medium text-muted-foreground" }, argName), /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react7.default.createElement(
    import_ui7.Input,
    {
      size: "sm",
      ref: inputRef,
      type: "text",
      id: `arg-${argName}`,
      placeholder: `Value for ${argName}`,
      value,
      onChange: (e) => onChange(e.target.value)
    }
  ), /* @__PURE__ */ import_react7.default.createElement("div", { className: "relative", ref: dropdownRef }, /* @__PURE__ */ import_react7.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      variant: "outline",
      size: "icon",
      square: true,
      onClick: () => setShowDropdown(!showDropdown),
      title: "Insert variable from previous node"
    },
    /* @__PURE__ */ import_react7.default.createElement(import_lucide_react2.Variable, { className: "w-4 h-4" })
  ), showDropdown && /* @__PURE__ */ import_react7.default.createElement("div", { className: "absolute right-0 top-full mt-1 w-64 bg-background border border-border rounded-sm shadow-lg z-50 max-h-64 overflow-y-auto" }, availableVariables.length === 0 ? /* @__PURE__ */ import_react7.default.createElement("div", { className: "px-2 py-3 text-xs text-muted-foreground text-center" }, "No variables available yet.", /* @__PURE__ */ import_react7.default.createElement("br", null), /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[10px]" }, "Add workflow inputs or connect upstream nodes.")) : /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, inputVariables.length > 0 && /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("div", { className: "px-2 py-1.5 text-[10px] font-semibold text-primary uppercase tracking-wider border-b border-border bg-primary/5" }, "\u{1F4E5} Workflow Inputs"), inputVariables.map((variable, idx) => /* @__PURE__ */ import_react7.default.createElement(
    import_ui7.Button,
    {
      key: `input-${idx}`,
      type: "button",
      variant: "ghost",
      onClick: () => insertVariable(variable.contextPath),
      className: "w-full text-left px-2 py-1.5 hover:bg-primary/5 rounded-none border-b border-border/50"
    },
    /* @__PURE__ */ import_react7.default.createElement("div", { className: "text-xs font-medium text-foreground font-mono" }, variable.contextPath),
    /* @__PURE__ */ import_react7.default.createElement("div", { className: "text-[10px] text-muted-foreground truncate" }, "type: ", variable.type || "any")
  ))), nodeVariables.length > 0 && /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("div", { className: "px-2 py-1.5 text-[10px] font-semibold text-primary uppercase tracking-wider border-b border-border bg-primary/5" }, "\u{1F4E4} Upstream Node Outputs"), nodeVariables.map((variable, idx) => /* @__PURE__ */ import_react7.default.createElement(
    import_ui7.Button,
    {
      key: `node-${idx}`,
      type: "button",
      variant: "ghost",
      onClick: () => insertVariable(variable.contextPath),
      className: "w-full text-left px-2 py-1.5 hover:bg-primary/5 rounded-none border-b border-border/50 last:border-b-0"
    },
    /* @__PURE__ */ import_react7.default.createElement("div", { className: "text-xs font-medium text-foreground font-mono" }, variable.contextPath),
    /* @__PURE__ */ import_react7.default.createElement("div", { className: "text-[10px] text-muted-foreground truncate" }, "from: ", variable.nodeTitle)
  )))))))));
};
DynamicArgsControl.propTypes = {
  data: import_prop_types7.default.object,
  path: import_prop_types7.default.string.isRequired,
  handleChange: import_prop_types7.default.func.isRequired,
  uischema: import_prop_types7.default.object.isRequired,
  errors: import_prop_types7.default.arrayOf(import_prop_types7.default.string)
};

// src/renderers/CustomKeyValueArrayRenderer.jsx
var import_react8 = __toESM(require("react"));
var import_prop_types8 = __toESM(require("prop-types"));
var import_react9 = require("@jsonforms/react");
var import_lucide_react3 = require("lucide-react");
var import_ui8 = require("@jet-admin/ui");
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
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ import_react8.default.createElement(import_ui8.Label, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ import_react8.default.createElement("div", { className: "gap-2" }, items.map((item, index) => /* @__PURE__ */ import_react8.default.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react8.default.createElement(
    import_react9.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react8.default.createElement(
    import_react9.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react8.default.createElement(
    import_ui8.Button,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ import_react8.default.createElement(import_lucide_react3.Trash2, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ import_react8.default.createElement(
    import_ui8.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      onClick: handleAddItem,
      className: "mt-3"
    },
    "Add Item"
  ));
};
CustomKeyValueArrayRenderer.propTypes = {
  data: import_prop_types8.default.arrayOf(import_prop_types8.default.object),
  path: import_prop_types8.default.string.isRequired,
  handleChange: import_prop_types8.default.func.isRequired,
  schema: import_prop_types8.default.object.isRequired,
  uischema: import_prop_types8.default.object.isRequired,
  label: import_prop_types8.default.string,
  description: import_prop_types8.default.string,
  errors: import_prop_types8.default.arrayOf(import_prop_types8.default.string),
  enabled: import_prop_types8.default.bool,
  renderers: import_prop_types8.default.arrayOf(import_prop_types8.default.object).isRequired
};

// src/renderers/CustomKeyValueTypeArrayRenderer.jsx
var import_react10 = __toESM(require("react"));
var import_prop_types9 = __toESM(require("prop-types"));
var import_react11 = require("@jsonforms/react");
var import_lucide_react4 = require("lucide-react");
var import_ui9 = require("@jet-admin/ui");
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
  return /* @__PURE__ */ import_react10.default.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ import_react10.default.createElement(import_ui9.Label, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ import_react10.default.createElement("div", { className: "gap-2" }, items.map((item, index) => /* @__PURE__ */ import_react10.default.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react10.default.createElement(
    import_react11.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react10.default.createElement(
    import_react11.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react10.default.createElement(
    import_react11.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react10.default.createElement(
    import_ui9.Button,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ import_react10.default.createElement(import_lucide_react4.Trash2, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ import_react10.default.createElement(
    import_ui9.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      onClick: handleAddItem,
      className: "mt-3"
    },
    "Add Item"
  ));
};
CustomKeyValueTypeArrayRenderer.propTypes = {
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

// src/renderers/CustomKeyTypeArrayRenderer.jsx
var import_react12 = __toESM(require("react"));
var import_prop_types10 = __toESM(require("prop-types"));
var import_react13 = require("@jsonforms/react");
var import_lucide_react5 = require("lucide-react");
var import_ui10 = require("@jet-admin/ui");
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
  return /* @__PURE__ */ import_react12.default.createElement("div", { className: "p-3 border mt-3 border-border rounded-sm bg-background" }, /* @__PURE__ */ import_react12.default.createElement(import_ui10.Label, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ import_react12.default.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex flex-col gap-2" }, items.map((item, index) => /* @__PURE__ */ import_react12.default.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react12.default.createElement(
    import_react13.JsonFormsDispatch,
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
  )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react12.default.createElement(
    import_react13.JsonFormsDispatch,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/type",
        label: "Value Type",
        options: {
          ...uischema.options?.typeOptions
        }
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ import_react12.default.createElement(
    import_ui10.Button,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ import_react12.default.createElement(import_lucide_react5.Trash2, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ import_react12.default.createElement(
    import_ui10.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      onClick: handleAddItem,
      className: "mt-3"
    },
    "Add Item"
  ));
};
CustomKeyTypeArrayRenderer.propTypes = {
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

// src/renderers/CustomStringArrayRenderer.jsx
var import_react14 = __toESM(require("react"));
var import_prop_types11 = __toESM(require("prop-types"));
var import_lucide_react6 = require("lucide-react");
var import_ui11 = require("@jet-admin/ui");
var CustomStringArrayRenderer = (props) => {
  const { data, path, handleChange, label, uischema, enabled, visible } = props;
  const arrayData = Array.isArray(data) ? data : [];
  const handleAddItem = () => {
    handleChange(path, [...arrayData, ""]);
  };
  const handleRemoveItem = (index) => {
    const newData = arrayData.filter((_, i) => i !== index);
    handleChange(path, newData);
  };
  const handleItemChange = (index, value) => {
    const newData = [...arrayData];
    newData[index] = value;
    handleChange(path, newData);
  };
  if (visible === false) {
    return null;
  }
  return /* @__PURE__ */ import_react14.default.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ import_react14.default.createElement(import_ui11.Label, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema?.label || "Items"), /* @__PURE__ */ import_react14.default.createElement("div", { className: "gap-2" }, arrayData.map((item, index) => /* @__PURE__ */ import_react14.default.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2 mb-2" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ import_react14.default.createElement(
    import_ui11.Input,
    {
      size: "sm",
      type: "text",
      value: item || "",
      onChange: (e) => handleItemChange(index, e.target.value),
      disabled: !enabled,
      placeholder: "Enter value..."
    }
  )), /* @__PURE__ */ import_react14.default.createElement(
    import_ui11.Button,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index),
      disabled: !enabled
    },
    /* @__PURE__ */ import_react14.default.createElement(import_lucide_react6.Trash2, { className: "w-4 h-4" })
  )))), arrayData.length === 0 && /* @__PURE__ */ import_react14.default.createElement("div", { className: "text-xs text-muted-foreground italic py-2" }, "No items added yet."), /* @__PURE__ */ import_react14.default.createElement(
    import_ui11.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      onClick: handleAddItem,
      disabled: !enabled,
      className: "mt-3"
    },
    "Add Item"
  ));
};
CustomStringArrayRenderer.propTypes = {
  data: import_prop_types11.default.array,
  path: import_prop_types11.default.string.isRequired,
  handleChange: import_prop_types11.default.func.isRequired,
  label: import_prop_types11.default.string,
  uischema: import_prop_types11.default.object,
  enabled: import_prop_types11.default.bool,
  visible: import_prop_types11.default.bool
};

// src/renderers/CustomFieldOperatorValueArrayRenderer.jsx
var import_react15 = __toESM(require("react"));
var import_prop_types12 = __toESM(require("prop-types"));
var import_lucide_react7 = require("lucide-react");
var import_ui12 = require("@jet-admin/ui");
var CustomFieldOperatorValueArrayRenderer = ({
  data,
  path,
  handleChange,
  schema,
  uischema,
  errors,
  label,
  enabled
}) => {
  const items = data || [];
  const itemSchema = schema.items;
  const isDisabled = enabled === false;
  const operatorOptions = itemSchema?.properties?.operator?.enum || [
    "==",
    "!=",
    "<",
    "<=",
    ">",
    ">=",
    "array-contains",
    "array-contains-any",
    "in",
    "not-in"
  ];
  const handleAddItem = () => {
    const newItem = { field: "", operator: "==", value: "" };
    handleChange(path, [...items, newItem]);
  };
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange(path, newItems);
  };
  return /* @__PURE__ */ import_react15.default.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ import_react15.default.createElement(import_ui12.Label, { className: "block mb-2 text-sm font-medium text-foreground" }, label || uischema.label || "Conditions"), errors && errors.length > 0 && /* @__PURE__ */ import_react15.default.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ import_react15.default.createElement("div", { className: "space-y-2" }, items.map((item, index) => /* @__PURE__ */ import_react15.default.createElement("div", { key: `${path}-${index}`, className: "flex items-center gap-2" }, /* @__PURE__ */ import_react15.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react15.default.createElement(
    import_ui12.Input,
    {
      size: "sm",
      type: "text",
      placeholder: "Field",
      value: item.field || "",
      disabled: isDisabled,
      onChange: (e) => handleItemChange(index, "field", e.target.value),
      className: errors && errors.length > 0 ? "border-red-500" : ""
    }
  )), /* @__PURE__ */ import_react15.default.createElement("div", { className: "w-36" }, /* @__PURE__ */ import_react15.default.createElement(import_ui12.Select, { value: item.operator || "==", onValueChange: (val) => handleItemChange(index, "operator", val), disabled: isDisabled }, /* @__PURE__ */ import_react15.default.createElement(import_ui12.SelectTrigger, { size: "sm" }, /* @__PURE__ */ import_react15.default.createElement(import_ui12.SelectValue, null)), /* @__PURE__ */ import_react15.default.createElement(import_ui12.SelectContent, null, operatorOptions.map((op) => /* @__PURE__ */ import_react15.default.createElement(import_ui12.SelectItem, { key: op, value: op }, op))))), /* @__PURE__ */ import_react15.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react15.default.createElement(
    import_ui12.Input,
    {
      size: "sm",
      type: "text",
      placeholder: "Value",
      value: item.value || "",
      disabled: isDisabled,
      onChange: (e) => handleItemChange(index, "value", e.target.value)
    }
  )), /* @__PURE__ */ import_react15.default.createElement(
    import_ui12.Button,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index),
      disabled: isDisabled
    },
    /* @__PURE__ */ import_react15.default.createElement(import_lucide_react7.Trash2, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ import_react15.default.createElement(
    import_ui12.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      onClick: handleAddItem,
      disabled: isDisabled,
      className: "mt-3"
    },
    "Add Condition"
  ));
};
CustomFieldOperatorValueArrayRenderer.propTypes = {
  data: import_prop_types12.default.arrayOf(import_prop_types12.default.object),
  path: import_prop_types12.default.string.isRequired,
  handleChange: import_prop_types12.default.func.isRequired,
  schema: import_prop_types12.default.object.isRequired,
  uischema: import_prop_types12.default.object.isRequired,
  label: import_prop_types12.default.string,
  errors: import_prop_types12.default.arrayOf(import_prop_types12.default.string),
  enabled: import_prop_types12.default.bool
};

// src/renderers/CustomGenericObjectArrayRenderer.jsx
var import_react16 = __toESM(require("react"));
var import_prop_types13 = __toESM(require("prop-types"));
var import_react17 = require("@jsonforms/react");
var import_lucide_react8 = require("lucide-react");
var import_ui13 = require("@jet-admin/ui");
var CustomGenericObjectArrayRenderer = ({
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
  const propertyKeys = itemSchema?.properties ? Object.keys(itemSchema.properties) : [];
  const handleAddItem = () => {
    const newItem = itemSchema.properties ? Object.fromEntries(
      Object.entries(itemSchema.properties).map(([key, propSchema]) => [
        key,
        propSchema.default !== void 0 ? propSchema.default : ""
      ])
    ) : {};
    handleChange(path, [...items, newItem]);
  };
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };
  if (propertyKeys.length === 0) {
    return null;
  }
  return /* @__PURE__ */ import_react16.default.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ import_react16.default.createElement(import_ui13.Label, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ import_react16.default.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ import_react16.default.createElement("div", { className: "flex flex-col gap-2" }, items.map((item, index) => /* @__PURE__ */ import_react16.default.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, propertyKeys.map((propKey) => /* @__PURE__ */ import_react16.default.createElement("div", { key: propKey, className: "flex-grow" }, /* @__PURE__ */ import_react16.default.createElement(
    import_react17.JsonFormsDispatch,
    {
      uischema: {
        type: "Control",
        scope: `#/properties/${propKey}`,
        label: propKey.charAt(0).toUpperCase() + propKey.slice(1)
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  ))), /* @__PURE__ */ import_react16.default.createElement(
    import_ui13.Button,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ import_react16.default.createElement(import_lucide_react8.Trash2, { className: "w-4 h-4" })
  )))), items.length === 0 && /* @__PURE__ */ import_react16.default.createElement("div", { className: "text-xs text-muted-foreground italic py-2" }, "No items added yet."), /* @__PURE__ */ import_react16.default.createElement(
    import_ui13.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      onClick: handleAddItem,
      className: "mt-3"
    },
    "Add Item"
  ));
};
CustomGenericObjectArrayRenderer.propTypes = {
  data: import_prop_types13.default.arrayOf(import_prop_types13.default.object),
  path: import_prop_types13.default.string.isRequired,
  handleChange: import_prop_types13.default.func.isRequired,
  schema: import_prop_types13.default.object.isRequired,
  uischema: import_prop_types13.default.object.isRequired,
  label: import_prop_types13.default.string,
  errors: import_prop_types13.default.arrayOf(import_prop_types13.default.string),
  enabled: import_prop_types13.default.bool,
  renderers: import_prop_types13.default.arrayOf(import_prop_types13.default.object).isRequired
};

// src/renderers/CustomGroupLayout.jsx
var import_react18 = __toESM(require("react"));
var import_prop_types14 = __toESM(require("prop-types"));
var import_react19 = require("@jsonforms/react");
var CustomGroupLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];
  const customClass = uischema.options?.customClass || "";
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ import_react18.default.createElement("div", { className: `border border-border rounded-sm p-2 bg-background ${customClass}` }, uischema.label && /* @__PURE__ */ import_react18.default.createElement("h3", { className: "text-xs font-medium text-muted-foreground mb-2" }, uischema.label), /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex flex-col gap-2" }, elements.map((element, index) => /* @__PURE__ */ import_react18.default.createElement(
    import_react19.JsonFormsDispatch,
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
  uischema: import_prop_types14.default.object.isRequired,
  schema: import_prop_types14.default.object.isRequired,
  path: import_prop_types14.default.string.isRequired,
  visible: import_prop_types14.default.bool.isRequired,
  enabled: import_prop_types14.default.bool.isRequired,
  renderers: import_prop_types14.default.arrayOf(import_prop_types14.default.object).isRequired,
  cells: import_prop_types14.default.arrayOf(import_prop_types14.default.object)
};

// src/renderers/CustomRadioInput.jsx
var import_react20 = __toESM(require("react"));
var import_prop_types15 = __toESM(require("prop-types"));
var import_ui14 = require("@jet-admin/ui");
var CustomRadioInput = (props) => {
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
  const orientation = uischema?.options?.orientation || "horizontal";
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
    return optionValue.charAt(0).toUpperCase() + optionValue.slice(1).replace(/([A-Z])/g, " $1");
  };
  const hasErrors = errors && errors.length > 0;
  return /* @__PURE__ */ import_react20.default.createElement("div", { className: "" }, /* @__PURE__ */ import_react20.default.createElement(
    import_ui14.Label,
    {
      className: `block mb-2 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description
  ), /* @__PURE__ */ import_react20.default.createElement(
    import_ui14.RadioGroup,
    {
      value: data || "",
      onValueChange: (val) => handleChange(path, val),
      disabled: isDisabled,
      className: `flex ${orientation === "vertical" ? "flex-col gap-2" : "flex-row flex-wrap gap-4"}`
    },
    options.map((optionValue) => /* @__PURE__ */ import_react20.default.createElement("div", { key: optionValue, className: "flex items-center gap-2" }, /* @__PURE__ */ import_react20.default.createElement(import_ui14.RadioGroupItem, { value: optionValue, id: `${path}-${optionValue}` }), /* @__PURE__ */ import_react20.default.createElement(
      import_ui14.Label,
      {
        htmlFor: `${path}-${optionValue}`,
        className: `text-sm ${data === optionValue ? "text-foreground font-medium" : "text-muted-foreground"}`
      },
      getDisplayName(optionValue)
    )))
  ), hasErrors && /* @__PURE__ */ import_react20.default.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
};
CustomRadioInput.propTypes = {
  data: import_prop_types15.default.string,
  path: import_prop_types15.default.string.isRequired,
  handleChange: import_prop_types15.default.func.isRequired,
  label: import_prop_types15.default.string,
  description: import_prop_types15.default.string,
  errors: import_prop_types15.default.arrayOf(import_prop_types15.default.string),
  schema: import_prop_types15.default.object.isRequired,
  uischema: import_prop_types15.default.object.isRequired,
  enabled: import_prop_types15.default.bool
};

// src/renderers/CustomVerticalLayout.jsx
var import_react21 = __toESM(require("react"));
var import_prop_types16 = __toESM(require("prop-types"));
var import_react22 = require("@jsonforms/react");
var CustomVerticalLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ import_react21.default.createElement("div", { className: "flex flex-col gap-2" }, elements.map((element, index) => /* @__PURE__ */ import_react21.default.createElement(
    import_react22.JsonFormsDispatch,
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
  uischema: import_prop_types16.default.object.isRequired,
  schema: import_prop_types16.default.object.isRequired,
  path: import_prop_types16.default.string.isRequired,
  visible: import_prop_types16.default.bool.isRequired,
  enabled: import_prop_types16.default.bool.isRequired,
  renderers: import_prop_types16.default.arrayOf(import_prop_types16.default.object).isRequired,
  cells: import_prop_types16.default.arrayOf(import_prop_types16.default.object)
};

// src/renderers/CustomTabRenderer.jsx
var import_react23 = __toESM(require("react"));
var import_prop_types17 = __toESM(require("prop-types"));
var import_react24 = require("@jsonforms/react");
var import_ui15 = require("@jet-admin/ui");
var CustomTabRenderer = (props) => {
  const { uischema, schema, path, enabled, renderers, cells } = props;
  const categories = uischema.elements || [];
  const [activeTab, setActiveTab] = (0, import_react23.useState)(0);
  if (!categories || categories.length === 0) {
    return null;
  }
  const activeCategory = categories[activeTab];
  return /* @__PURE__ */ import_react23.default.createElement("div", { className: "custom-tabs-container" }, /* @__PURE__ */ import_react23.default.createElement("div", { className: "flex border-border" }, categories.map((category, index) => /* @__PURE__ */ import_react23.default.createElement(
    import_ui15.Button,
    {
      key: category.label || `tab-${index}`,
      variant: "ghost",
      className: `px-4 mr-2 py-2 text-sm font-medium rounded-sm ${index === activeTab ? "text-primary bg-primary/5" : "text-foreground"}`,
      onClick: () => setActiveTab(index),
      type: "button"
    },
    category.label
  ))), /* @__PURE__ */ import_react23.default.createElement("div", { className: "p-3 border mt-3 border-border rounded-sm bg-background flex flex-col gap-2" }, activeCategory?.elements.map((element, i) => /* @__PURE__ */ import_react23.default.createElement(
    import_react24.JsonFormsDispatch,
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
  uischema: import_prop_types17.default.shape({
    type: import_prop_types17.default.string.isRequired,
    elements: import_prop_types17.default.arrayOf(import_prop_types17.default.object).isRequired
  }).isRequired,
  schema: import_prop_types17.default.object.isRequired,
  path: import_prop_types17.default.string.isRequired,
  enabled: import_prop_types17.default.bool.isRequired,
  renderers: import_prop_types17.default.arrayOf(import_prop_types17.default.object).isRequired,
  cells: import_prop_types17.default.arrayOf(import_prop_types17.default.object)
};

// src/renderers/CustomHorizontalLayout.jsx
var import_react25 = __toESM(require("react"));
var import_prop_types18 = __toESM(require("prop-types"));
var import_react26 = require("@jsonforms/react");
var CustomHorizontalLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ import_react25.default.createElement("div", { className: "flex flex-row gap-2" }, elements.map((element, index) => /* @__PURE__ */ import_react25.default.createElement("div", { key: index, className: "flex-1 min-w-0" }, /* @__PURE__ */ import_react25.default.createElement(
    import_react26.JsonFormsDispatch,
    {
      uischema: element,
      schema,
      path,
      enabled,
      renderers,
      cells
    }
  ))));
};
CustomHorizontalLayout.propTypes = {
  uischema: import_prop_types18.default.object.isRequired,
  schema: import_prop_types18.default.object.isRequired,
  path: import_prop_types18.default.string.isRequired,
  visible: import_prop_types18.default.bool.isRequired,
  enabled: import_prop_types18.default.bool.isRequired,
  renderers: import_prop_types18.default.arrayOf(import_prop_types18.default.object).isRequired,
  cells: import_prop_types18.default.arrayOf(import_prop_types18.default.object)
};

// src/renderers/index.js
var JetNumberControl = (0, import_react27.withJsonFormsControlProps)(CustomNumberInput);
var JetTextControl = (0, import_react27.withJsonFormsControlProps)(CustomTextInput);
var JetSelectControl = (0, import_react27.withJsonFormsControlProps)(CustomSelectInput);
var JetCheckboxControl = (0, import_react27.withJsonFormsControlProps)(CustomCheckboxInput);
var JetCodeEditorControl = (0, import_react27.withJsonFormsControlProps)(CustomCodeEditorControl);
var JetSuggestionControl = (0, import_react27.withJsonFormsControlProps)(CustomSuggestionInput);
var JetDynamicArgsControl = (0, import_react27.withJsonFormsControlProps)(DynamicArgsControl);
var JetKeyValueArrayControl = (0, import_react27.withJsonFormsControlProps)(CustomKeyValueArrayRenderer);
var JetKeyValueTypeArrayControl = (0, import_react27.withJsonFormsControlProps)(CustomKeyValueTypeArrayRenderer);
var JetKeyTypeArrayControl = (0, import_react27.withJsonFormsControlProps)(CustomKeyTypeArrayRenderer);
var JetStringArrayControl = (0, import_react27.withJsonFormsControlProps)(CustomStringArrayRenderer);
var JetFieldOperatorValueArrayControl = (0, import_react27.withJsonFormsControlProps)(CustomFieldOperatorValueArrayRenderer);
var JetGenericObjectArrayControl = (0, import_react27.withJsonFormsControlProps)(CustomGenericObjectArrayRenderer);
var JetGroupLayout = (0, import_react27.withJsonFormsLayoutProps)(CustomGroupLayout);
var JetRadioControl = (0, import_react27.withJsonFormsControlProps)(CustomRadioInput);
var JetVerticalLayout = (0, import_react27.withJsonFormsLayoutProps)(CustomVerticalLayout);
var JetTabLayout = (0, import_react27.withJsonFormsLayoutProps)(CustomTabRenderer);
var JetHorizontalLayout = (0, import_react27.withJsonFormsLayoutProps)(CustomHorizontalLayout);

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
var codeEditorTester = (0, import_core.rankWith)(
  100,
  (0, import_core.and)(
    import_core.isControl,
    (uischema, rootSchema) => {
      try {
        const currentSchema = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
        return typeof currentSchema?.format === "string" && currentSchema.format.startsWith("code-");
      } catch (e) {
        console.warn(`Error resolving schema for scope ${uischema.scope} in codeEditorTester:`, e);
        return false;
      }
    }
  )
);
var suggestionInputTester = (0, import_core.rankWith)(
  50,
  (0, import_core.and)(import_core.isControl, (uischema) => uischema.options && uischema.options.suggestionType === "nodeOutput")
);
var dynamicArgsTester = (0, import_core.rankWith)(
  20,
  (0, import_core.and)(import_core.isControl, (uischema) => uischema?.options?.isDynamicArgs === true)
);
var stringArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const schemaAtScope = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    const itemSchema = schemaAtScope.items;
    if (itemSchema && itemSchema.type === "string" && !itemSchema.properties) {
      return 40;
    }
    return -1;
  } catch (e) {
    console.warn("Error in string array tester:", e);
    return -1;
  }
};
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
var radioInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  if (uischema.options && uischema.options.format === "radio") {
    try {
      const currentSchema = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
      if (currentSchema && currentSchema.type === "string" && currentSchema.enum) {
        return 100;
      }
    } catch (e) {
      console.warn(`Error resolving schema for scope ${uischema.scope} in radioInputTester:`, e);
      return -1;
    }
  }
  return -1;
};
var fieldOperatorValueArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const schemaAtScope = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    const itemSchema = schemaAtScope.items;
    if (itemSchema.type !== "object" || itemSchema.properties?.field?.type !== "string" || itemSchema.properties?.operator?.type !== "string" || itemSchema.properties?.value?.type !== "string") {
      return -1;
    }
    if (!itemSchema.properties?.operator?.enum) {
      return -1;
    }
    return 70;
  } catch (e) {
    console.warn("Error in field/operator/value tester:", e);
    return -1;
  }
};
var groupLayoutTester = (0, import_core.rankWith)(100, (0, import_core.uiTypeIs)("Group"));
var verticalLayoutTester = (uischema) => {
  return uischema.type === "VerticalLayout" ? 10 : -1;
};
var horizontalLayoutTester = (uischema) => {
  return uischema.type === "HorizontalLayout" ? 10 : -1;
};
var genericObjectArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") return -1;
  try {
    const schemaAtScope = import_core.Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!schemaAtScope || schemaAtScope.type !== "array") return -1;
    const itemSchema = schemaAtScope.items;
    if (itemSchema?.type === "object" && itemSchema?.properties) {
      return 20;
    }
    return -1;
  } catch (e) {
    return -1;
  }
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
  { tester: radioInputTester, renderer: JetRadioControl },
  { tester: checkboxTester, renderer: JetCheckboxControl },
  { tester: keyValueArrayTester, renderer: JetKeyValueArrayControl },
  { tester: keyValueTypeArrayTester, renderer: JetKeyValueTypeArrayControl },
  { tester: keyTypeArrayTester, renderer: JetKeyTypeArrayControl },
  { tester: stringArrayTester, renderer: JetStringArrayControl },
  { tester: fieldOperatorValueArrayTester, renderer: JetFieldOperatorValueArrayControl },
  { tester: genericObjectArrayTester, renderer: JetGenericObjectArrayControl },
  { tester: groupLayoutTester, renderer: JetGroupLayout },
  { tester: verticalLayoutTester, renderer: JetVerticalLayout },
  { tester: horizontalLayoutTester, renderer: JetHorizontalLayout }
];
var jetFormsRenderers = [
  { tester: suggestionInputTester, renderer: JetSuggestionControl },
  { tester: codeEditorTester, renderer: JetCodeEditorControl },
  { tester: dynamicArgsTester, renderer: JetDynamicArgsControl },
  ...jetFormsBaseRenderers
];
//# sourceMappingURL=index.cjs.map
