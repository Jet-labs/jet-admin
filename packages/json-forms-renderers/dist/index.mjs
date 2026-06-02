// src/renderers/index.js
import {
  withJsonFormsControlProps,
  withJsonFormsLayoutProps
} from "@jsonforms/react";

// src/renderers/CustomNumberInput.jsx
import React from "react";
import PropTypes from "prop-types";
import { Input, Label } from "@jet-admin/ui";
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
  return /* @__PURE__ */ React.createElement("div", { className: "" }, /* @__PURE__ */ React.createElement(
    Label,
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description
  ), /* @__PURE__ */ React.createElement(
    Input,
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
  ), hasErrors && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
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
import { Input as Input2, Textarea, Label as Label2 } from "@jet-admin/ui";
var CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const isMulti = uischema?.options?.multi;
  const isDisabled = enabled === false;
  const hasErrors = errors && errors.length > 0;
  return /* @__PURE__ */ React2.createElement("div", { className: "" }, /* @__PURE__ */ React2.createElement(
    Label2,
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description
  ), isMulti ? /* @__PURE__ */ React2.createElement(
    Textarea,
    {
      id: path,
      name: path,
      disabled: isDisabled,
      className: hasErrors ? "border-red-500 focus:border-red-500" : "",
      placeholder: hasErrors ? errors : uischema?.options?.placeholder || "",
      onChange: (ev) => handleChange(path, ev.target.value),
      value: typeof data === "object" ? JSON.stringify(data) : data || "",
      rows: uischema?.options?.rows || 3
    }
  ) : /* @__PURE__ */ React2.createElement(
    Input2,
    {
      size: "sm",
      type: uischema?.options?.format === "password" ? "password" : "text",
      id: path,
      name: path,
      disabled: isDisabled,
      className: hasErrors ? "border-red-500 focus:border-red-500" : "",
      placeholder: hasErrors ? errors : uischema?.options?.placeholder || "",
      onChange: (ev) => handleChange(path, ev.target.value),
      value: typeof data === "object" ? JSON.stringify(data) : data || ""
    }
  ), hasErrors && /* @__PURE__ */ React2.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
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
import { RefreshCw } from "lucide-react";
import { Button, Label as Label3, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
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
  const hasErrors = errors && errors.length > 0;
  return /* @__PURE__ */ React3.createElement("div", { className: "" }, /* @__PURE__ */ React3.createElement(
    Label3,
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description
  ), /* @__PURE__ */ React3.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React3.createElement(Select, { value: data || "", onValueChange: (val) => handleChange(path, val), disabled: isDisabled }, /* @__PURE__ */ React3.createElement(
    SelectTrigger,
    {
      id: path,
      size: "sm",
      className: `${hasErrors ? "border-red-500" : ""}`
    },
    /* @__PURE__ */ React3.createElement(SelectValue, { placeholder: uischema?.options?.placeholder || "Select an option" })
  ), /* @__PURE__ */ React3.createElement(SelectContent, null, options.map((optionValue) => /* @__PURE__ */ React3.createElement(SelectItem, { key: optionValue, value: optionValue }, getDisplayName(optionValue))))), showRefreshButton && onRefresh && /* @__PURE__ */ React3.createElement(
    Button,
    {
      type: "button",
      variant: "outline",
      size: "icon",
      square: true,
      onClick: handleRefreshClick,
      disabled: isRefreshing || isDisabled,
      title: "Refresh list"
    },
    /* @__PURE__ */ React3.createElement(RefreshCw, { className: `w-4 h-4 ${isRefreshing ? "animate-spin" : ""}` })
  )), hasErrors && /* @__PURE__ */ React3.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
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
import { Checkbox, Label as Label4 } from "@jet-admin/ui";
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
  return /* @__PURE__ */ React4.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React4.createElement(
    Checkbox,
    {
      id: path,
      checked: !!data,
      disabled: !enabled,
      onCheckedChange: onToggle
    }
  ), /* @__PURE__ */ React4.createElement(Label4, { htmlFor: path, className: "ml-2 text-sm font-medium text-foreground" }, label || description || uischema.label), errors && errors.length > 0 && /* @__PURE__ */ React4.createElement("p", { className: "text-red-500 text-xs mt-1 ml-2" }, errors));
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

// src/renderers/CustomCodeEditorControl.jsx
import React5, { useEffect, useMemo, useRef } from "react";
import PropTypes5 from "prop-types";
import { CodeEditor, Label as Label5 } from "@jet-admin/ui";

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
    hint,
    intellisenseFeed = [],
    showHeader = false
  } = uischema.options || {};
  const format = schema?.format || "";
  const language = useMemo(() => {
    if (["code-pgsql", "code-sql", "code-mysql"].includes(format)) return "sql";
    if (format === "code-javascript") return "javascript";
    if (format === "code-json") return "json";
    if (format === "code-html") return "html";
    if (format === "code-css") return "css";
    if (format.startsWith("code-")) return format.replace("code-", "");
    return "javascript";
  }, [format]);
  const tablesMap = useMemo(() => {
    if (language !== "sql" || !databaseMetadata?.schemas) return {};
    const map = {};
    databaseMetadata.schemas.forEach((schemaItem) => {
      schemaItem.tables?.forEach((t) => {
        map[t.databaseTableName] = t.databaseTableColumns?.map((c) => c.databaseTableColumnName) || [];
      });
    });
    return map;
  }, [databaseMetadata, language]);
  const schemaRef = useRef(tablesMap);
  const queryArgsRef = useRef(queryArgs);
  const intellisenseFeedRef = useRef(intellisenseFeed);
  useEffect(() => {
    schemaRef.current = tablesMap;
  }, [tablesMap]);
  useEffect(() => {
    queryArgsRef.current = queryArgs;
  }, [queryArgs]);
  useEffect(() => {
    intellisenseFeedRef.current = intellisenseFeed;
  }, [intellisenseFeed]);
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
          const textBeforeWord = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: wordInfo.startColumn
          });
          const pathMatch = textBeforeWord.match(/([a-zA-Z0-9_$]+(?:\.[a-zA-Z0-9_$]+)*)\.$/);
          const feed = intellisenseFeedRef.current || [];
          if (pathMatch) {
            const parentPath = pathMatch[1];
            const matchingItems = feed.filter((item) => item.parentPath === parentPath);
            if (matchingItems.length > 0) {
              matchingItems.forEach((item) => {
                let priority = "03";
                if (item.kind === "Property") priority = "01";
                if (item.kind === "Field") priority = "02";
                suggestions.push({
                  label: item.label,
                  kind: monaco.languages.CompletionItemKind[item.kind] || monaco.languages.CompletionItemKind.Property,
                  insertText: item.insertText || item.label,
                  detail: item.detail,
                  sortText: `${priority}_${item.label}`,
                  range
                });
              });
            }
          } else {
            const rootItems = feed.filter((item) => !item.parentPath);
            rootItems.forEach((item) => {
              let priority = "03";
              if (item.kind === "Property") priority = "01";
              if (item.kind === "Field") priority = "02";
              suggestions.push({
                label: item.label,
                kind: monaco.languages.CompletionItemKind[item.kind] || monaco.languages.CompletionItemKind.Variable,
                insertText: item.insertText || item.label,
                detail: item.detail,
                sortText: `${priority}_${item.label}`,
                range
              });
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
              sortText: `09_${kw.label}`,
              range
            });
          });
          return { suggestions };
        }
      });
    }
  };
  const hasErrors = errors && errors.length > 0;
  return /* @__PURE__ */ React5.createElement("div", { className: "" }, /* @__PURE__ */ React5.createElement(
    Label5,
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description
  ), hint && /* @__PURE__ */ React5.createElement("p", { className: "text-[10px] text-muted-foreground mb-1" }, hint), /* @__PURE__ */ React5.createElement(
    CodeEditor,
    {
      value: typeof data === "object" ? JSON.stringify(data, null, 2) : data || placeholder || "",
      onChange: (val) => handleChange(path, val || ""),
      language,
      height,
      disabled: !enabled,
      showHeader,
      beforeMount: handleBeforeMount,
      status: hasErrors ? "error" : null
    }
  ), hasErrors && /* @__PURE__ */ React5.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
};
CustomCodeEditorControl.propTypes = {
  data: PropTypes5.string,
  path: PropTypes5.string.isRequired,
  handleChange: PropTypes5.func.isRequired,
  enabled: PropTypes5.bool.isRequired,
  uischema: PropTypes5.object,
  schema: PropTypes5.object,
  label: PropTypes5.string,
  description: PropTypes5.string,
  errors: PropTypes5.arrayOf(PropTypes5.string)
};

// src/renderers/CustomSuggestionInput.jsx
import React6, { useState as useState2 } from "react";
import PropTypes6 from "prop-types";
import { Button as Button2, Input as Input3, Label as Label6 } from "@jet-admin/ui";
var CustomSuggestionInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const { suggestions, placeholder } = uischema.options || {};
  const [isOpen, setIsOpen] = useState2(false);
  const hasErrors = errors && errors.length > 0;
  const handleSelect = (value) => {
    const currentVal = data || "";
    handleChange(path, currentVal + value);
    setIsOpen(false);
  };
  return /* @__PURE__ */ React6.createElement("div", { className: "relative mb-3" }, /* @__PURE__ */ React6.createElement(
    Label6,
    {
      htmlFor: path,
      className: `block mb-1 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"} flex justify-between items-center`
    },
    /* @__PURE__ */ React6.createElement("span", null, label || description),
    suggestions && suggestions.length > 0 && /* @__PURE__ */ React6.createElement(
      Button2,
      {
        type: "button",
        variant: "ghost",
        size: "sm",
        onClick: () => setIsOpen(!isOpen),
        disabled: !enabled
      },
      "Map +"
    )
  ), /* @__PURE__ */ React6.createElement(
    Input3,
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
  ), hasErrors && /* @__PURE__ */ React6.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors), isOpen && suggestions && /* @__PURE__ */ React6.createElement("div", { className: "absolute right-0 top-6 w-48 bg-background border border-border shadow-xl rounded-sm z-[50] max-h-40 overflow-y-auto" }, /* @__PURE__ */ React6.createElement("div", { className: "p-2 border-b border-border flex justify-between items-center bg-muted/50" }, /* @__PURE__ */ React6.createElement("span", { className: "text-[10px] font-semibold text-muted-foreground" }, "Pick a node"), /* @__PURE__ */ React6.createElement(Button2, { type: "button", variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => setIsOpen(false) }, "\xD7")), suggestions.length === 0 ? /* @__PURE__ */ React6.createElement("div", { className: "px-2 py-1 text-[10px] text-muted-foreground italic" }, "No suggestions") : suggestions.map((item, idx) => /* @__PURE__ */ React6.createElement(
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
  data: PropTypes6.string,
  path: PropTypes6.string.isRequired,
  handleChange: PropTypes6.func.isRequired,
  label: PropTypes6.string,
  description: PropTypes6.string,
  errors: PropTypes6.arrayOf(PropTypes6.string),
  uischema: PropTypes6.object.isRequired,
  enabled: PropTypes6.bool
};

// src/renderers/DynamicArgsControl.jsx
import React7, { useState as useState3, useRef as useRef2, useEffect as useEffect2, useMemo as useMemo2 } from "react";
import PropTypes7 from "prop-types";
import { Variable } from "lucide-react";
import { Button as Button3, Input as Input4, Label as Label7 } from "@jet-admin/ui";
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
  const getUpstreamNodeIds = useMemo2(() => {
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
  return /* @__PURE__ */ React7.createElement("div", { className: "border border-border rounded-sm p-2 bg-background" }, /* @__PURE__ */ React7.createElement(Label7, { className: "block mb-2 text-xs font-medium text-muted-foreground" }, "Arguments"), /* @__PURE__ */ React7.createElement("div", { className: "space-y-2" }, args.map((arg, index) => {
    const argName = arg.key;
    return /* @__PURE__ */ React7.createElement(
      ArgInputWithVariablePicker,
      {
        key: `arg-${index}`,
        argName,
        value: argsData[argName] || "",
        onChange: (value) => handleArgChange(argName, value),
        availableVariables
      }
    );
  })), errors && errors.length > 0 && /* @__PURE__ */ React7.createElement("p", { className: "text-red-500 text-xs mt-1" }, errors));
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
  return /* @__PURE__ */ React7.createElement("div", { className: "flex flex-row justify-between items-center gap-2" }, /* @__PURE__ */ React7.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React7.createElement(Label7, { className: "block mb-1 text-[10px] font-medium text-muted-foreground" }, argName), /* @__PURE__ */ React7.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React7.createElement(
    Input4,
    {
      size: "sm",
      ref: inputRef,
      type: "text",
      id: `arg-${argName}`,
      placeholder: `Value for ${argName}`,
      value,
      onChange: (e) => onChange(e.target.value)
    }
  ), /* @__PURE__ */ React7.createElement("div", { className: "relative", ref: dropdownRef }, /* @__PURE__ */ React7.createElement(
    Button3,
    {
      type: "button",
      variant: "outline",
      size: "icon",
      square: true,
      onClick: () => setShowDropdown(!showDropdown),
      title: "Insert variable from previous node"
    },
    /* @__PURE__ */ React7.createElement(Variable, { className: "w-4 h-4" })
  ), showDropdown && /* @__PURE__ */ React7.createElement("div", { className: "absolute right-0 top-full mt-1 w-64 bg-background border border-border rounded-sm shadow-lg z-50 max-h-64 overflow-y-auto" }, availableVariables.length === 0 ? /* @__PURE__ */ React7.createElement("div", { className: "px-2 py-3 text-xs text-muted-foreground text-center" }, "No variables available yet.", /* @__PURE__ */ React7.createElement("br", null), /* @__PURE__ */ React7.createElement("span", { className: "text-[10px]" }, "Add workflow inputs or connect upstream nodes.")) : /* @__PURE__ */ React7.createElement(React7.Fragment, null, inputVariables.length > 0 && /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement("div", { className: "px-2 py-1.5 text-[10px] font-semibold text-primary uppercase tracking-wider border-b border-border bg-primary/5" }, "\u{1F4E5} Workflow Inputs"), inputVariables.map((variable, idx) => /* @__PURE__ */ React7.createElement(
    Button3,
    {
      key: `input-${idx}`,
      type: "button",
      variant: "ghost",
      onClick: () => insertVariable(variable.contextPath),
      className: "w-full text-left px-2 py-1.5 hover:bg-primary/5 rounded-none border-b border-border/50"
    },
    /* @__PURE__ */ React7.createElement("div", { className: "text-xs font-medium text-foreground font-mono" }, variable.contextPath),
    /* @__PURE__ */ React7.createElement("div", { className: "text-[10px] text-muted-foreground truncate" }, "type: ", variable.type || "any")
  ))), nodeVariables.length > 0 && /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement("div", { className: "px-2 py-1.5 text-[10px] font-semibold text-primary uppercase tracking-wider border-b border-border bg-primary/5" }, "\u{1F4E4} Upstream Node Outputs"), nodeVariables.map((variable, idx) => /* @__PURE__ */ React7.createElement(
    Button3,
    {
      key: `node-${idx}`,
      type: "button",
      variant: "ghost",
      onClick: () => insertVariable(variable.contextPath),
      className: "w-full text-left px-2 py-1.5 hover:bg-primary/5 rounded-none border-b border-border/50 last:border-b-0"
    },
    /* @__PURE__ */ React7.createElement("div", { className: "text-xs font-medium text-foreground font-mono" }, variable.contextPath),
    /* @__PURE__ */ React7.createElement("div", { className: "text-[10px] text-muted-foreground truncate" }, "from: ", variable.nodeTitle)
  )))))))));
};
DynamicArgsControl.propTypes = {
  data: PropTypes7.object,
  path: PropTypes7.string.isRequired,
  handleChange: PropTypes7.func.isRequired,
  uischema: PropTypes7.object.isRequired,
  errors: PropTypes7.arrayOf(PropTypes7.string)
};

// src/renderers/CustomKeyValueArrayRenderer.jsx
import React8 from "react";
import PropTypes8 from "prop-types";
import { JsonFormsDispatch } from "@jsonforms/react";
import { Trash2 } from "lucide-react";
import { Button as Button4, Label as Label8 } from "@jet-admin/ui";
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
  return /* @__PURE__ */ React8.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React8.createElement(Label8, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React8.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React8.createElement("div", { className: "gap-2" }, items.map((item, index) => /* @__PURE__ */ React8.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ React8.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React8.createElement(
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
  )), /* @__PURE__ */ React8.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React8.createElement(
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
  )), /* @__PURE__ */ React8.createElement(
    Button4,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ React8.createElement(Trash2, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ React8.createElement(
    Button4,
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
  data: PropTypes8.arrayOf(PropTypes8.object),
  path: PropTypes8.string.isRequired,
  handleChange: PropTypes8.func.isRequired,
  schema: PropTypes8.object.isRequired,
  uischema: PropTypes8.object.isRequired,
  label: PropTypes8.string,
  description: PropTypes8.string,
  errors: PropTypes8.arrayOf(PropTypes8.string),
  enabled: PropTypes8.bool,
  renderers: PropTypes8.arrayOf(PropTypes8.object).isRequired
};

// src/renderers/CustomKeyValueTypeArrayRenderer.jsx
import React9 from "react";
import PropTypes9 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch2 } from "@jsonforms/react";
import { Trash2 as Trash22 } from "lucide-react";
import { Button as Button5, Label as Label9 } from "@jet-admin/ui";
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
  return /* @__PURE__ */ React9.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React9.createElement(Label9, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React9.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React9.createElement("div", { className: "gap-2" }, items.map((item, index) => /* @__PURE__ */ React9.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ React9.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React9.createElement(
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
  )), /* @__PURE__ */ React9.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React9.createElement(
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
  )), /* @__PURE__ */ React9.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React9.createElement(
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
  )), /* @__PURE__ */ React9.createElement(
    Button5,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ React9.createElement(Trash22, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ React9.createElement(
    Button5,
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

// src/renderers/CustomKeyTypeArrayRenderer.jsx
import React10 from "react";
import PropTypes10 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch3 } from "@jsonforms/react";
import { Trash2 as Trash23 } from "lucide-react";
import { Button as Button6, Label as Label10 } from "@jet-admin/ui";
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
  return /* @__PURE__ */ React10.createElement("div", { className: "p-3 border mt-3 border-border rounded-sm bg-background" }, /* @__PURE__ */ React10.createElement(Label10, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React10.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React10.createElement("div", { className: "flex flex-col gap-2" }, items.map((item, index) => /* @__PURE__ */ React10.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, /* @__PURE__ */ React10.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React10.createElement(
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
  )), /* @__PURE__ */ React10.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React10.createElement(
    JsonFormsDispatch3,
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
  )), /* @__PURE__ */ React10.createElement(
    Button6,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ React10.createElement(Trash23, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ React10.createElement(
    Button6,
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

// src/renderers/CustomStringArrayRenderer.jsx
import React11 from "react";
import PropTypes11 from "prop-types";
import { Trash2 as Trash24 } from "lucide-react";
import { Button as Button7, Input as Input5, Label as Label11 } from "@jet-admin/ui";
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
  return /* @__PURE__ */ React11.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React11.createElement(Label11, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema?.label || "Items"), /* @__PURE__ */ React11.createElement("div", { className: "gap-2" }, arrayData.map((item, index) => /* @__PURE__ */ React11.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2 mb-2" }, /* @__PURE__ */ React11.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React11.createElement(
    Input5,
    {
      size: "sm",
      type: "text",
      value: item || "",
      onChange: (e) => handleItemChange(index, e.target.value),
      disabled: !enabled,
      placeholder: "Enter value..."
    }
  )), /* @__PURE__ */ React11.createElement(
    Button7,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index),
      disabled: !enabled
    },
    /* @__PURE__ */ React11.createElement(Trash24, { className: "w-4 h-4" })
  )))), arrayData.length === 0 && /* @__PURE__ */ React11.createElement("div", { className: "text-xs text-muted-foreground italic py-2" }, "No items added yet."), /* @__PURE__ */ React11.createElement(
    Button7,
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
  data: PropTypes11.array,
  path: PropTypes11.string.isRequired,
  handleChange: PropTypes11.func.isRequired,
  label: PropTypes11.string,
  uischema: PropTypes11.object,
  enabled: PropTypes11.bool,
  visible: PropTypes11.bool
};

// src/renderers/CustomFieldOperatorValueArrayRenderer.jsx
import React12 from "react";
import PropTypes12 from "prop-types";
import { Trash2 as Trash25 } from "lucide-react";
import { Button as Button8, Input as Input6, Label as Label12, Select as Select2, SelectContent as SelectContent2, SelectItem as SelectItem2, SelectTrigger as SelectTrigger2, SelectValue as SelectValue2 } from "@jet-admin/ui";
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
  return /* @__PURE__ */ React12.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React12.createElement(Label12, { className: "block mb-2 text-sm font-medium text-foreground" }, label || uischema.label || "Conditions"), errors && errors.length > 0 && /* @__PURE__ */ React12.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React12.createElement("div", { className: "space-y-2" }, items.map((item, index) => /* @__PURE__ */ React12.createElement("div", { key: `${path}-${index}`, className: "flex items-center gap-2" }, /* @__PURE__ */ React12.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React12.createElement(
    Input6,
    {
      size: "sm",
      type: "text",
      placeholder: "Field",
      value: item.field || "",
      disabled: isDisabled,
      onChange: (e) => handleItemChange(index, "field", e.target.value),
      className: errors && errors.length > 0 ? "border-red-500" : ""
    }
  )), /* @__PURE__ */ React12.createElement("div", { className: "w-36" }, /* @__PURE__ */ React12.createElement(Select2, { value: item.operator || "==", onValueChange: (val) => handleItemChange(index, "operator", val), disabled: isDisabled }, /* @__PURE__ */ React12.createElement(SelectTrigger2, { size: "sm" }, /* @__PURE__ */ React12.createElement(SelectValue2, null)), /* @__PURE__ */ React12.createElement(SelectContent2, null, operatorOptions.map((op) => /* @__PURE__ */ React12.createElement(SelectItem2, { key: op, value: op }, op))))), /* @__PURE__ */ React12.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React12.createElement(
    Input6,
    {
      size: "sm",
      type: "text",
      placeholder: "Value",
      value: item.value || "",
      disabled: isDisabled,
      onChange: (e) => handleItemChange(index, "value", e.target.value)
    }
  )), /* @__PURE__ */ React12.createElement(
    Button8,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index),
      disabled: isDisabled
    },
    /* @__PURE__ */ React12.createElement(Trash25, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ React12.createElement(
    Button8,
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
  data: PropTypes12.arrayOf(PropTypes12.object),
  path: PropTypes12.string.isRequired,
  handleChange: PropTypes12.func.isRequired,
  schema: PropTypes12.object.isRequired,
  uischema: PropTypes12.object.isRequired,
  label: PropTypes12.string,
  errors: PropTypes12.arrayOf(PropTypes12.string),
  enabled: PropTypes12.bool
};

// src/renderers/CustomGenericObjectArrayRenderer.jsx
import React13 from "react";
import PropTypes13 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch4 } from "@jsonforms/react";
import { Trash2 as Trash26 } from "lucide-react";
import { Button as Button9, Label as Label13 } from "@jet-admin/ui";
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
  return /* @__PURE__ */ React13.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React13.createElement(Label13, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React13.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React13.createElement("div", { className: "flex flex-col gap-2" }, items.map((item, index) => /* @__PURE__ */ React13.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2" }, propertyKeys.map((propKey) => /* @__PURE__ */ React13.createElement("div", { key: propKey, className: "flex-grow" }, /* @__PURE__ */ React13.createElement(
    JsonFormsDispatch4,
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
  ))), /* @__PURE__ */ React13.createElement(
    Button9,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ React13.createElement(Trash26, { className: "w-4 h-4" })
  )))), items.length === 0 && /* @__PURE__ */ React13.createElement("div", { className: "text-xs text-muted-foreground italic py-2" }, "No items added yet."), /* @__PURE__ */ React13.createElement(
    Button9,
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
  data: PropTypes13.arrayOf(PropTypes13.object),
  path: PropTypes13.string.isRequired,
  handleChange: PropTypes13.func.isRequired,
  schema: PropTypes13.object.isRequired,
  uischema: PropTypes13.object.isRequired,
  label: PropTypes13.string,
  errors: PropTypes13.arrayOf(PropTypes13.string),
  enabled: PropTypes13.bool,
  renderers: PropTypes13.arrayOf(PropTypes13.object).isRequired
};

// src/renderers/CustomGroupLayout.jsx
import React14 from "react";
import PropTypes14 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch5 } from "@jsonforms/react";
var CustomGroupLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];
  const customClass = uischema.options?.customClass || "";
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React14.createElement("div", { className: `border border-border rounded-sm p-2 bg-background ${customClass}` }, uischema.label && /* @__PURE__ */ React14.createElement("h3", { className: "text-xs font-medium text-muted-foreground mb-2" }, uischema.label), /* @__PURE__ */ React14.createElement("div", { className: "flex flex-col gap-2" }, elements.map((element, index) => /* @__PURE__ */ React14.createElement(
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
  ))));
};
CustomGroupLayout.propTypes = {
  uischema: PropTypes14.object.isRequired,
  schema: PropTypes14.object.isRequired,
  path: PropTypes14.string.isRequired,
  visible: PropTypes14.bool.isRequired,
  enabled: PropTypes14.bool.isRequired,
  renderers: PropTypes14.arrayOf(PropTypes14.object).isRequired,
  cells: PropTypes14.arrayOf(PropTypes14.object)
};

// src/renderers/CustomRadioInput.jsx
import React15 from "react";
import PropTypes15 from "prop-types";
import { Label as Label14, RadioGroup, RadioGroupItem } from "@jet-admin/ui";
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
  return /* @__PURE__ */ React15.createElement("div", { className: "" }, /* @__PURE__ */ React15.createElement(
    Label14,
    {
      className: `block mb-2 text-xs font-medium ${hasErrors ? "text-red-500" : "text-muted-foreground"}`
    },
    label || description
  ), /* @__PURE__ */ React15.createElement(
    RadioGroup,
    {
      value: data || "",
      onValueChange: (val) => handleChange(path, val),
      disabled: isDisabled,
      className: `flex ${orientation === "vertical" ? "flex-col gap-2" : "flex-row flex-wrap gap-4"}`
    },
    options.map((optionValue) => /* @__PURE__ */ React15.createElement("div", { key: optionValue, className: "flex items-center gap-2" }, /* @__PURE__ */ React15.createElement(RadioGroupItem, { value: optionValue, id: `${path}-${optionValue}` }), /* @__PURE__ */ React15.createElement(
      Label14,
      {
        htmlFor: `${path}-${optionValue}`,
        className: `text-sm ${data === optionValue ? "text-foreground font-medium" : "text-muted-foreground"}`
      },
      getDisplayName(optionValue)
    )))
  ), hasErrors && /* @__PURE__ */ React15.createElement("p", { className: "text-xs text-red-500 mt-1" }, errors));
};
CustomRadioInput.propTypes = {
  data: PropTypes15.string,
  path: PropTypes15.string.isRequired,
  handleChange: PropTypes15.func.isRequired,
  label: PropTypes15.string,
  description: PropTypes15.string,
  errors: PropTypes15.arrayOf(PropTypes15.string),
  schema: PropTypes15.object.isRequired,
  uischema: PropTypes15.object.isRequired,
  enabled: PropTypes15.bool
};

// src/renderers/CustomVerticalLayout.jsx
import React16 from "react";
import PropTypes16 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch6 } from "@jsonforms/react";
var CustomVerticalLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React16.createElement("div", { className: "flex flex-col gap-2" }, elements.map((element, index) => /* @__PURE__ */ React16.createElement(
    JsonFormsDispatch6,
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
  uischema: PropTypes16.object.isRequired,
  schema: PropTypes16.object.isRequired,
  path: PropTypes16.string.isRequired,
  visible: PropTypes16.bool.isRequired,
  enabled: PropTypes16.bool.isRequired,
  renderers: PropTypes16.arrayOf(PropTypes16.object).isRequired,
  cells: PropTypes16.arrayOf(PropTypes16.object)
};

// src/renderers/CustomTabRenderer.jsx
import React17, { useState as useState4 } from "react";
import PropTypes17 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch7 } from "@jsonforms/react";
import { Button as Button10 } from "@jet-admin/ui";
var CustomTabRenderer = (props) => {
  const { uischema, schema, path, enabled, renderers, cells } = props;
  const categories = uischema.elements || [];
  const [activeTab, setActiveTab] = useState4(0);
  if (!categories || categories.length === 0) {
    return null;
  }
  const activeCategory = categories[activeTab];
  return /* @__PURE__ */ React17.createElement("div", { className: "custom-tabs-container" }, /* @__PURE__ */ React17.createElement("div", { className: "flex border-border" }, categories.map((category, index) => /* @__PURE__ */ React17.createElement(
    Button10,
    {
      key: category.label || `tab-${index}`,
      variant: "ghost",
      className: `px-4 mr-2 py-2 text-sm font-medium rounded-sm ${index === activeTab ? "text-primary bg-primary/5" : "text-foreground"}`,
      onClick: () => setActiveTab(index),
      type: "button"
    },
    category.label
  ))), /* @__PURE__ */ React17.createElement("div", { className: "p-3 border mt-3 border-border rounded-sm bg-background flex flex-col gap-2" }, activeCategory?.elements.map((element, i) => /* @__PURE__ */ React17.createElement(
    JsonFormsDispatch7,
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
  uischema: PropTypes17.shape({
    type: PropTypes17.string.isRequired,
    elements: PropTypes17.arrayOf(PropTypes17.object).isRequired
  }).isRequired,
  schema: PropTypes17.object.isRequired,
  path: PropTypes17.string.isRequired,
  enabled: PropTypes17.bool.isRequired,
  renderers: PropTypes17.arrayOf(PropTypes17.object).isRequired,
  cells: PropTypes17.arrayOf(PropTypes17.object)
};

// src/renderers/CustomHorizontalLayout.jsx
import React18 from "react";
import PropTypes18 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch8 } from "@jsonforms/react";
var CustomHorizontalLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];
  if (!visible) {
    return null;
  }
  return /* @__PURE__ */ React18.createElement("div", { className: "flex flex-row gap-2" }, elements.map((element, index) => /* @__PURE__ */ React18.createElement("div", { key: index, className: "flex-1 min-w-0" }, /* @__PURE__ */ React18.createElement(
    JsonFormsDispatch8,
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
  uischema: PropTypes18.object.isRequired,
  schema: PropTypes18.object.isRequired,
  path: PropTypes18.string.isRequired,
  visible: PropTypes18.bool.isRequired,
  enabled: PropTypes18.bool.isRequired,
  renderers: PropTypes18.arrayOf(PropTypes18.object).isRequired,
  cells: PropTypes18.arrayOf(PropTypes18.object)
};

// src/renderers/index.js
var JetNumberControl = withJsonFormsControlProps(CustomNumberInput);
var JetTextControl = withJsonFormsControlProps(CustomTextInput);
var JetSelectControl = withJsonFormsControlProps(CustomSelectInput);
var JetCheckboxControl = withJsonFormsControlProps(CustomCheckboxInput);
var JetCodeEditorControl = withJsonFormsControlProps(CustomCodeEditorControl);
var JetSuggestionControl = withJsonFormsControlProps(CustomSuggestionInput);
var JetDynamicArgsControl = withJsonFormsControlProps(DynamicArgsControl);
var JetKeyValueArrayControl = withJsonFormsControlProps(CustomKeyValueArrayRenderer);
var JetKeyValueTypeArrayControl = withJsonFormsControlProps(CustomKeyValueTypeArrayRenderer);
var JetKeyTypeArrayControl = withJsonFormsControlProps(CustomKeyTypeArrayRenderer);
var JetStringArrayControl = withJsonFormsControlProps(CustomStringArrayRenderer);
var JetFieldOperatorValueArrayControl = withJsonFormsControlProps(CustomFieldOperatorValueArrayRenderer);
var JetGenericObjectArrayControl = withJsonFormsControlProps(CustomGenericObjectArrayRenderer);
var JetGroupLayout = withJsonFormsLayoutProps(CustomGroupLayout);
var JetRadioControl = withJsonFormsControlProps(CustomRadioInput);
var JetVerticalLayout = withJsonFormsLayoutProps(CustomVerticalLayout);
var JetTabLayout = withJsonFormsLayoutProps(CustomTabRenderer);
var JetHorizontalLayout = withJsonFormsLayoutProps(CustomHorizontalLayout);

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
var codeEditorTester = rankWith(
  100,
  and(
    isControl,
    (uischema, rootSchema) => {
      try {
        const currentSchema = Resolve.schema(rootSchema, uischema.scope, rootSchema);
        return typeof currentSchema?.format === "string" && currentSchema.format.startsWith("code-");
      } catch (e) {
        console.warn(`Error resolving schema for scope ${uischema.scope} in codeEditorTester:`, e);
        return false;
      }
    }
  )
);
var suggestionInputTester = rankWith(
  50,
  and(isControl, (uischema) => uischema.options && uischema.options.suggestionType === "nodeOutput")
);
var dynamicArgsTester = rankWith(
  20,
  and(isControl, (uischema) => uischema?.options?.isDynamicArgs === true)
);
var stringArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const schemaAtScope = Resolve.schema(rootSchema, uischema.scope, rootSchema);
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
var radioInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  if (uischema.options && uischema.options.format === "radio") {
    try {
      const currentSchema = Resolve.schema(rootSchema, uischema.scope, rootSchema);
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
    const schemaAtScope = Resolve.schema(rootSchema, uischema.scope, rootSchema);
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
var groupLayoutTester = rankWith(100, uiTypeIs("Group"));
var verticalLayoutTester = (uischema) => {
  return uischema.type === "VerticalLayout" ? 10 : -1;
};
var horizontalLayoutTester = (uischema) => {
  return uischema.type === "HorizontalLayout" ? 10 : -1;
};
var genericObjectArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") return -1;
  try {
    const schemaAtScope = Resolve.schema(rootSchema, uischema.scope, rootSchema);
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
export {
  CustomCheckboxInput,
  CustomCodeEditorControl,
  CustomCodeEditorControl as CustomCodeJavascriptControl,
  CustomCodeEditorControl as CustomCodePgsqlControl,
  CustomFieldOperatorValueArrayRenderer,
  CustomGenericObjectArrayRenderer,
  CustomGroupLayout,
  CustomHorizontalLayout,
  CustomKeyTypeArrayRenderer,
  CustomKeyValueArrayRenderer,
  CustomKeyValueTypeArrayRenderer,
  CustomNumberInput,
  CustomRadioInput,
  CustomSelectInput,
  CustomStringArrayRenderer,
  CustomSuggestionInput,
  CustomTabRenderer,
  CustomTextInput,
  CustomVerticalLayout,
  DynamicArgsControl,
  JetCheckboxControl,
  JetCodeEditorControl,
  JetCodeEditorControl as JetCodeJavascriptControl,
  JetCodeEditorControl as JetCodePgsqlControl,
  JetDynamicArgsControl,
  JetFieldOperatorValueArrayControl,
  JetGenericObjectArrayControl,
  JetGroupLayout,
  JetHorizontalLayout,
  JetKeyTypeArrayControl,
  JetKeyValueArrayControl,
  JetKeyValueTypeArrayControl,
  JetNumberControl,
  JetRadioControl,
  JetSelectControl,
  JetStringArrayControl,
  JetSuggestionControl,
  JetTabLayout,
  JetTextControl,
  JetVerticalLayout,
  checkboxTester,
  codeEditorTester,
  codeEditorTester as codeJavascriptTester,
  codeEditorTester as codePgsqlTester,
  dynamicArgsTester,
  fieldOperatorValueArrayTester,
  genericObjectArrayTester,
  groupLayoutTester,
  jetFormsBaseRenderers,
  jetFormsRenderers,
  keyTypeArrayTester,
  keyValueArrayTester,
  keyValueTypeArrayTester,
  numberInputTester,
  radioInputTester,
  selectInputTester,
  stringArrayTester,
  suggestionInputTester,
  tabRendererTester,
  textInputTester,
  verticalLayoutTester
};
//# sourceMappingURL=index.mjs.map
