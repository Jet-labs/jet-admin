// src/renderers/index.js
import {
  withJsonFormsControlProps,
  withJsonFormsLayoutProps
} from "@jsonforms/react";

// src/renderers/CustomNumberInput.jsx
import React from "react";
import PropTypes from "prop-types";
import { Label, TemplateAutocompleteInput } from "@jet-admin/ui";
var CustomNumberInput = (props) => {
  const {
    data,
    path,
    handleChange,
    label,
    description,
    errors,
    uischema,
    schema,
    enabled
  } = props;
  const options = uischema?.options || {};
  const isDisabled = enabled === false;
  const stateTree = options.stateTree || null;
  const templateMode = options.templateMode;
  const handleInputChange = (valueString) => {
    if (valueString === "") {
      handleChange(path, void 0);
    } else if (valueString.includes("{{")) {
      handleChange(path, valueString);
    } else {
      const numValue = schema.type === "integer" ? parseInt(valueString, 10) : parseFloat(valueString);
      if (!isNaN(numValue) && String(numValue) === valueString.trim()) {
        handleChange(path, numValue);
      } else {
        handleChange(path, valueString);
      }
    }
  };
  const stringValue = data === void 0 || data === null ? "" : String(data);
  const isTemplateString = stringValue.includes("{{");
  let displayErrors = errors || "";
  if (isTemplateString && (displayErrors.includes("must be integer") || displayErrors.includes("must be number"))) {
    displayErrors = "";
  }
  const hasErrors = displayErrors.length > 0;
  const placeholder = hasErrors ? displayErrors : uischema?.options?.placeholder || "";
  return /* @__PURE__ */ React.createElement("div", { className: "" }, /* @__PURE__ */ React.createElement(
    Label,
    {
      htmlFor: path,
      className: `block mb-1 ${hasErrors ? "text-red-500" : ""}`
    },
    label || description
  ), /* @__PURE__ */ React.createElement(
    TemplateAutocompleteInput,
    {
      value: stringValue,
      onChange: handleInputChange,
      placeholder,
      liveStateTree: stateTree,
      mode: templateMode,
      readOnly: isDisabled,
      className: hasErrors ? "ring-1 ring-red-500 rounded-sm" : ""
    }
  ), hasErrors && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-red-500 mt-1" }, displayErrors));
};
CustomNumberInput.propTypes = {
  data: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  uischema: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  enabled: PropTypes.bool
};

// src/renderers/CustomTextInput.jsx
import React2 from "react";
import PropTypes2 from "prop-types";
import { Input, Label as Label2, TemplateAutocompleteInput as TemplateAutocompleteInput2 } from "@jet-admin/ui";
var CustomTextInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const options = uischema?.options || {};
  const isMulti = options.multi;
  const isPassword = options.format === "password";
  const isDisabled = enabled === false;
  const hasErrors = errors && errors.length > 0;
  const stateTree = options.stateTree || null;
  const templateMode = options.templateMode;
  const placeholder = hasErrors ? errors : options.placeholder || "";
  const stringValue = typeof data === "object" ? JSON.stringify(data) : data || "";
  return /* @__PURE__ */ React2.createElement("div", { className: "" }, /* @__PURE__ */ React2.createElement(
    Label2,
    {
      htmlFor: path,
      className: `block mb-1 ${hasErrors ? "text-red-500" : ""}`
    },
    label || description
  ), isPassword ? /* @__PURE__ */ React2.createElement(
    Input,
    {
      size: "sm",
      type: "password",
      id: path,
      name: path,
      disabled: isDisabled,
      className: hasErrors ? "border-red-500 focus:border-red-500" : "",
      placeholder,
      onChange: (ev) => handleChange(path, ev.target.value),
      value: stringValue
    }
  ) : /* @__PURE__ */ React2.createElement(
    TemplateAutocompleteInput2,
    {
      value: stringValue,
      onChange: (val) => handleChange(path, val),
      placeholder,
      liveStateTree: stateTree,
      mode: templateMode,
      isTextArea: !!isMulti,
      rows: options.rows || 3,
      readOnly: isDisabled,
      className: hasErrors ? "ring-1 ring-red-500 rounded-sm" : ""
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
      className: `block mb-1 ${hasErrors ? "text-red-500" : ""}`
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
import React5, { useMemo } from "react";
import PropTypes5 from "prop-types";
import { CodeEditor, Label as Label5 } from "@jet-admin/ui";
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
    height = "140px",
    placeholder,
    hint,
    showHeader = false,
    stateTree = null,
    templateMode
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
  let displayErrors = typeof errors === "string" ? errors : errors ? errors.join(", ") : "";
  const hasErrors = displayErrors.length > 0;
  return /* @__PURE__ */ React5.createElement("div", { className: "" }, /* @__PURE__ */ React5.createElement(
    Label5,
    {
      htmlFor: path,
      className: `block mb-1 ${hasErrors ? "text-red-500" : ""}`
    },
    label || description
  ), hint && /* @__PURE__ */ React5.createElement("p", { className: "text-[10px] text-muted-foreground mb-1" }, hint), /* @__PURE__ */ React5.createElement(
    CodeEditor,
    {
      value: typeof data === "object" ? JSON.stringify(data, null, 2) : data || placeholder || "",
      onChange: (val) => handleChange(path, val || ""),
      language,
      height,
      disabled: enabled === false,
      showHeader,
      stateTree,
      templateMode,
      status: hasErrors ? "error" : null,
      statusMessage: hasErrors ? displayErrors : null
    }
  ));
};
CustomCodeEditorControl.propTypes = {
  data: PropTypes5.oneOfType([PropTypes5.string, PropTypes5.object]),
  path: PropTypes5.string.isRequired,
  handleChange: PropTypes5.func.isRequired,
  enabled: PropTypes5.bool,
  uischema: PropTypes5.object,
  schema: PropTypes5.object,
  label: PropTypes5.string,
  description: PropTypes5.string,
  errors: PropTypes5.oneOfType([PropTypes5.string, PropTypes5.array])
};

// src/renderers/CustomSuggestionInput.jsx
import React6, { useState as useState2 } from "react";
import PropTypes6 from "prop-types";
import { Button as Button2, Input as Input2, Label as Label6 } from "@jet-admin/ui";
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
      className: `block mb-1 ${hasErrors ? "text-red-500" : ""} flex justify-between items-center`
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
    Input2,
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

// src/renderers/CustomDynamicKeyValueInputRenderer.jsx
import React7 from "react";
import PropTypes7 from "prop-types";
import { TemplateAutocompleteInput as TemplateAutocompleteInput3, Label as Label7 } from "@jet-admin/ui";
var CustomDynamicKeyValueInputRenderer = (props) => {
  const { data, path, handleChange, uischema, errors, enabled } = props;
  const keys = uischema?.options?.keys || uischema?.options?.args || [];
  const stateTree = uischema?.options?.stateTree || {};
  const formData = data || {};
  const handleArgChange = (argKey, value) => {
    const childPath = path ? `${path}.${argKey}` : argKey;
    handleChange(childPath, value);
  };
  if (keys.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React7.createElement("div", { className: "border border-border rounded-sm p-3 bg-background" }, /* @__PURE__ */ React7.createElement(Label7, { className: "block mb-2 text-sm font-medium text-foreground" }, uischema.label || "Dynamic Inputs"), /* @__PURE__ */ React7.createElement("div", { className: "space-y-3" }, keys.map((arg, index) => {
    const argName = arg.key;
    return /* @__PURE__ */ React7.createElement("div", { key: `arg-${index}`, className: "flex flex-col gap-1.5" }, /* @__PURE__ */ React7.createElement(Label7, { className: "text-xs font-medium text-muted-foreground flex items-center justify-between" }, /* @__PURE__ */ React7.createElement("span", null, argName), arg.type && /* @__PURE__ */ React7.createElement("span", { className: "text-[10px] bg-muted/50 px-1 rounded-sm text-muted-foreground/80 font-mono" }, arg.type)), /* @__PURE__ */ React7.createElement(
      TemplateAutocompleteInput3,
      {
        value: formData[argName] || "",
        onChange: (value) => handleArgChange(argName, value),
        liveStateTree: stateTree,
        placeholder: `Value for ${argName}...`,
        size: "sm",
        readOnly: enabled === false
      }
    ));
  })), errors && errors.length > 0 && /* @__PURE__ */ React7.createElement("p", { className: "text-red-500 text-xs mt-2" }, errors.join(", ")));
};
CustomDynamicKeyValueInputRenderer.propTypes = {
  data: PropTypes7.object,
  path: PropTypes7.string.isRequired,
  handleChange: PropTypes7.func.isRequired,
  uischema: PropTypes7.object.isRequired,
  errors: PropTypes7.arrayOf(PropTypes7.string),
  enabled: PropTypes7.bool
};

// src/renderers/CustomKeyValueArrayRenderer.jsx
import React8 from "react";
import PropTypes8 from "prop-types";
import { JsonFormsDispatch } from "@jsonforms/react";
import { Trash2 } from "lucide-react";
import { Button as Button3, Label as Label8 } from "@jet-admin/ui";
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
  const templateOptions = {
    stateTree: uischema.options?.stateTree,
    templateMode: uischema.options?.templateMode
  };
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
  return /* @__PURE__ */ React8.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React8.createElement(Label8, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React8.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col gap-2" }, items.map((item, index) => /* @__PURE__ */ React8.createElement("div", { key: `${path}-${index}`, className: "flex items-end space-x-2" }, /* @__PURE__ */ React8.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React8.createElement(
    JsonFormsDispatch,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/key",
        label: "Key",
        options: { ...uischema.options?.keyOptions, ...templateOptions }
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
        options: { ...uischema.options?.valueOptions, ...templateOptions }
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ React8.createElement(
    Button3,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ React8.createElement(Trash2, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ React8.createElement(
    Button3,
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
  errors: PropTypes8.arrayOf(PropTypes8.string),
  enabled: PropTypes8.bool,
  renderers: PropTypes8.arrayOf(PropTypes8.object).isRequired
};

// src/renderers/CustomKeyValueTypeArrayRenderer.jsx
import React9 from "react";
import PropTypes9 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch2 } from "@jsonforms/react";
import { Trash2 as Trash22 } from "lucide-react";
import { Button as Button4, Label as Label9 } from "@jet-admin/ui";
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
  const templateOptions = {
    stateTree: uischema.options?.stateTree,
    templateMode: uischema.options?.templateMode
  };
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
  return /* @__PURE__ */ React9.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React9.createElement(Label9, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React9.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React9.createElement("div", { className: "flex flex-col gap-2" }, items.map((item, index) => /* @__PURE__ */ React9.createElement("div", { key: `${path}-${index}`, className: "flex items-end space-x-2" }, /* @__PURE__ */ React9.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React9.createElement(
    JsonFormsDispatch2,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/key",
        label: "Key",
        options: { ...uischema.options?.keyOptions, ...templateOptions }
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
        options: { ...uischema.options?.typeOptions, ...templateOptions }
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
        options: { ...uischema.options?.valueOptions, ...templateOptions }
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ React9.createElement(
    Button4,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ React9.createElement(Trash22, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ React9.createElement(
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
CustomKeyValueTypeArrayRenderer.propTypes = {
  data: PropTypes9.arrayOf(PropTypes9.object),
  path: PropTypes9.string.isRequired,
  handleChange: PropTypes9.func.isRequired,
  schema: PropTypes9.object.isRequired,
  uischema: PropTypes9.object.isRequired,
  label: PropTypes9.string,
  errors: PropTypes9.arrayOf(PropTypes9.string),
  enabled: PropTypes9.bool,
  renderers: PropTypes9.arrayOf(PropTypes9.object).isRequired
};

// src/renderers/CustomKeyTypeArrayRenderer.jsx
import React10 from "react";
import PropTypes10 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch3 } from "@jsonforms/react";
import { Trash2 as Trash23 } from "lucide-react";
import { Button as Button5, Label as Label10 } from "@jet-admin/ui";
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
  const templateOptions = {
    stateTree: uischema.options?.stateTree,
    templateMode: uischema.options?.templateMode
  };
  const handleAddItem = () => {
    const newItem = itemSchema?.properties ? {
      key: itemSchema.properties.key?.default !== void 0 ? itemSchema.properties.key.default : "",
      type: itemSchema.properties.type?.default !== void 0 ? itemSchema.properties.type.default : ""
    } : { key: "", type: "" };
    handleChange(path, [...items, newItem]);
  };
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    handleChange(path, newItems);
  };
  return /* @__PURE__ */ React10.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React10.createElement(Label10, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React10.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React10.createElement("div", { className: "flex flex-col gap-2" }, items.map((item, index) => /* @__PURE__ */ React10.createElement("div", { key: `${path}-${index}`, className: "flex items-end space-x-2" }, /* @__PURE__ */ React10.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React10.createElement(
    JsonFormsDispatch3,
    {
      uischema: {
        type: "Control",
        scope: "#/properties/key",
        label: "Key",
        options: { ...uischema.options?.keyOptions, ...templateOptions }
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
        options: { ...uischema.options?.typeOptions, ...templateOptions }
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  )), /* @__PURE__ */ React10.createElement(
    Button5,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ React10.createElement(Trash23, { className: "w-4 h-4" })
  )))), /* @__PURE__ */ React10.createElement(
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
CustomKeyTypeArrayRenderer.propTypes = {
  data: PropTypes10.arrayOf(PropTypes10.object),
  path: PropTypes10.string.isRequired,
  handleChange: PropTypes10.func.isRequired,
  schema: PropTypes10.object.isRequired,
  uischema: PropTypes10.object.isRequired,
  label: PropTypes10.string,
  errors: PropTypes10.arrayOf(PropTypes10.string),
  enabled: PropTypes10.bool,
  renderers: PropTypes10.arrayOf(PropTypes10.object).isRequired
};

// src/renderers/CustomStringArrayRenderer.jsx
import React11 from "react";
import PropTypes11 from "prop-types";
import { Trash2 as Trash24 } from "lucide-react";
import { Button as Button6, Label as Label11, TemplateAutocompleteInput as TemplateAutocompleteInput4 } from "@jet-admin/ui";
var CustomStringArrayRenderer = (props) => {
  const { data, path, handleChange, label, uischema, enabled, visible } = props;
  const arrayData = Array.isArray(data) ? data : [];
  const stateTree = uischema?.options?.stateTree || null;
  const templateMode = uischema?.options?.templateMode;
  const handleAddItem = () => {
    handleChange(path, [...arrayData, ""]);
  };
  const handleRemoveItem = (index) => {
    const newData = arrayData.filter((_, i) => i !== index);
    handleChange(path, newData);
  };
  const handleItemChange = (index, value) => {
    handleChange(`${path}.${index}`, value);
  };
  if (visible === false) {
    return null;
  }
  return /* @__PURE__ */ React11.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React11.createElement(Label11, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema?.label || "Items"), /* @__PURE__ */ React11.createElement("div", { className: "gap-2" }, arrayData.map((item, index) => /* @__PURE__ */ React11.createElement("div", { key: `${path}-${index}`, className: "flex items-center space-x-2 mb-2" }, /* @__PURE__ */ React11.createElement("div", { className: "flex-grow" }, /* @__PURE__ */ React11.createElement(
    TemplateAutocompleteInput4,
    {
      value: item || "",
      onChange: (val) => handleItemChange(index, val),
      placeholder: "Enter value...",
      liveStateTree: stateTree,
      mode: templateMode,
      readOnly: !enabled
    }
  )), /* @__PURE__ */ React11.createElement(
    Button6,
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
    Button6,
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
import { Button as Button7, Label as Label12, Select as Select2, SelectContent as SelectContent2, SelectItem as SelectItem2, SelectTrigger as SelectTrigger2, SelectValue as SelectValue2, TemplateAutocompleteInput as TemplateAutocompleteInput5 } from "@jet-admin/ui";
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
  const stateTree = uischema?.options?.stateTree || null;
  const templateMode = uischema?.options?.templateMode;
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
    handleChange(`${path}.${index}.${field}`, value);
  };
  return /* @__PURE__ */ React12.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React12.createElement(Label12, { className: "block mb-2 text-sm font-medium text-foreground" }, label || uischema.label || "Conditions"), errors && errors.length > 0 && /* @__PURE__ */ React12.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React12.createElement("div", { className: "space-y-2" }, items.map((item, index) => /* @__PURE__ */ React12.createElement("div", { key: `${path}-${index}`, className: "flex items-center gap-2" }, /* @__PURE__ */ React12.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React12.createElement(
    TemplateAutocompleteInput5,
    {
      placeholder: "Field",
      value: item.field || "",
      readOnly: isDisabled,
      onChange: (val) => handleItemChange(index, "field", val),
      liveStateTree: stateTree,
      mode: templateMode,
      className: errors && errors.length > 0 ? "ring-1 ring-red-500 rounded-sm" : ""
    }
  )), /* @__PURE__ */ React12.createElement("div", { className: "w-36" }, /* @__PURE__ */ React12.createElement(Select2, { value: item.operator || "==", onValueChange: (val) => handleItemChange(index, "operator", val), disabled: isDisabled }, /* @__PURE__ */ React12.createElement(SelectTrigger2, { size: "sm" }, /* @__PURE__ */ React12.createElement(SelectValue2, null)), /* @__PURE__ */ React12.createElement(SelectContent2, null, operatorOptions.map((op) => /* @__PURE__ */ React12.createElement(SelectItem2, { key: op, value: op }, op))))), /* @__PURE__ */ React12.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React12.createElement(
    TemplateAutocompleteInput5,
    {
      placeholder: "Value",
      value: item.value || "",
      readOnly: isDisabled,
      onChange: (val) => handleItemChange(index, "value", val),
      liveStateTree: stateTree,
      mode: templateMode
    }
  )), /* @__PURE__ */ React12.createElement(
    Button7,
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
    Button7,
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
import { Button as Button8, Label as Label13 } from "@jet-admin/ui";
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
  const templateOptions = {
    stateTree: uischema.options?.stateTree,
    templateMode: uischema.options?.templateMode
  };
  const handleAddItem = () => {
    if (!itemSchema) return;
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
  return /* @__PURE__ */ React13.createElement("div", { className: "p-3 border border-border rounded-sm bg-background" }, /* @__PURE__ */ React13.createElement(Label13, { className: "block mb-1 text-sm font-medium text-foreground" }, label || uischema.label || "Items"), errors && errors.length > 0 && /* @__PURE__ */ React13.createElement("p", { className: "text-red-500 text-xs mb-2" }, errors), /* @__PURE__ */ React13.createElement("div", { className: "flex flex-col gap-2" }, propertyKeys.length > 0 ? items.map((item, index) => /* @__PURE__ */ React13.createElement("div", { key: `${path}-${index}`, className: "flex items-end space-x-2" }, propertyKeys.map((propKey) => /* @__PURE__ */ React13.createElement("div", { key: propKey, className: "flex-grow" }, /* @__PURE__ */ React13.createElement(
    JsonFormsDispatch4,
    {
      uischema: {
        type: "Control",
        scope: `#/properties/${propKey}`,
        label: propKey.charAt(0).toUpperCase() + propKey.slice(1),
        options: { ...templateOptions }
      },
      schema: itemSchema,
      path: `${path}.${index}`,
      enabled,
      renderers
    }
  ))), /* @__PURE__ */ React13.createElement(
    Button8,
    {
      type: "button",
      variant: "destructive-ghost",
      size: "icon",
      square: true,
      onClick: () => handleRemoveItem(index)
    },
    /* @__PURE__ */ React13.createElement(Trash26, { className: "w-4 h-4" })
  ))) : /* @__PURE__ */ React13.createElement("div", { className: "text-xs text-muted-foreground italic py-2" }, "Schema has no properties defined.")), items.length === 0 && propertyKeys.length > 0 && /* @__PURE__ */ React13.createElement("div", { className: "text-xs text-muted-foreground italic py-2" }, "No items added yet."), /* @__PURE__ */ React13.createElement(
    Button8,
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
      key: element.scope || index,
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
      className: `block mb-2 ${hasErrors ? "text-red-500" : ""}`
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
      key: element.scope || index,
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
import React17, { useState as useState3 } from "react";
import PropTypes17 from "prop-types";
import { JsonFormsDispatch as JsonFormsDispatch7 } from "@jsonforms/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@jet-admin/ui";
var CustomTabRenderer = (props) => {
  const { uischema, schema, path, enabled, renderers, cells } = props;
  const categories = uischema.elements || [];
  const [activeTab, setActiveTab] = useState3("0");
  if (!categories || categories.length === 0) {
    return null;
  }
  return /* @__PURE__ */ React17.createElement("div", { className: "custom-tabs-container bg-background  !rounded-md" }, /* @__PURE__ */ React17.createElement(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full flex flex-col" }, /* @__PURE__ */ React17.createElement(TabsList, { className: "h-auto" }, categories.map((category, index) => /* @__PURE__ */ React17.createElement(
    TabsTrigger,
    {
      key: category.label || `tab-${index}`,
      value: String(index)
    },
    category.label
  ))), /* @__PURE__ */ React17.createElement("div", { className: "p-2 rounded-md bg-background" }, categories.map((category, index) => /* @__PURE__ */ React17.createElement(
    TabsContent,
    {
      key: category.label || `tab-content-${index}`,
      value: String(index),
      className: "mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none flex flex-col space-y-2"
    },
    category.elements.map((element, i) => /* @__PURE__ */ React17.createElement(
      JsonFormsDispatch7,
      {
        key: `${category.label}-${i}`,
        uischema: element,
        schema,
        path,
        enabled,
        renderers,
        cells
      }
    ))
  )))));
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
  return /* @__PURE__ */ React18.createElement("div", { className: "flex flex-row gap-2" }, elements.map((element, index) => /* @__PURE__ */ React18.createElement("div", { key: element.scope || index, className: "flex-1 min-w-0" }, /* @__PURE__ */ React18.createElement(
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

// src/renderers/CustomFileUploadInput.jsx
import React20, { useState as useState4, useContext } from "react";
import PropTypes19 from "prop-types";
import { CloudUpload, FileSpreadsheet, Trash2 as Trash27, AlertCircle } from "lucide-react";
import { Button as Button9, Label as Label15 } from "@jet-admin/ui";

// src/context.js
import React19 from "react";
var FileUploadContext = React19.createContext({
  uploadFile: async (file) => {
    console.warn("No FileUploadContext provider. Please wrap your application in a FileUploadProvider.");
    return null;
  }
});
FileUploadContext.displayName = "FileUploadContext";
var OAuthContext = React19.createContext({
  startOAuth: () => {
    console.warn("No OAuthContext provider. Please wrap your application in an OAuthProvider.");
  },
  loading: false
});
OAuthContext.displayName = "OAuthContext";

// src/renderers/CustomFileUploadInput.jsx
var CustomFileUploadInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const { uploadFile } = useContext(FileUploadContext);
  const [isUploading, setIsUploading] = useState4(false);
  const [dragActive, setDragActive] = useState4(false);
  const [errorMsg, setErrorMsg] = useState4("");
  const isDisabled = enabled === false;
  const hasErrors = errors && errors.length > 0 || !!errorMsg;
  const fileOptions = data || {};
  const { fileUrl, fileName, fileSize, fileType } = fileOptions;
  const handleUpload = async (file) => {
    if (!file) return;
    setErrorMsg("");
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size exceeds 10MB limit.");
      return;
    }
    const fileExt = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileExt)) {
      setErrorMsg("Invalid file type. Please upload a CSV, XLSX, or XLS file.");
      return;
    }
    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      handleChange(path, {
        fileUrl: response.url,
        filePath: response.filePath,
        fileName: response.fileName,
        fileSize: response.fileSize,
        fileType: response.fileType
      });
    } catch (err) {
      setErrorMsg(err.message || err || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };
  const handleChangeInput = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };
  const handleRemove = () => {
    handleChange(path, {
      fileUrl: "",
      filePath: "",
      fileName: "",
      fileSize: 0,
      fileType: ""
    });
  };
  const formatBytes = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };
  return /* @__PURE__ */ React20.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React20.createElement(
    Label15,
    {
      htmlFor: path,
      className: `block ${hasErrors ? "text-destructive" : ""}`
    },
    label || description || "Upload File",
    " ",
    /* @__PURE__ */ React20.createElement("span", { className: "text-destructive" }, "*")
  ), fileUrl ? /* @__PURE__ */ React20.createElement("div", { className: "flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-md" }, /* @__PURE__ */ React20.createElement("div", { className: "flex items-center gap-3 overflow-hidden" }, /* @__PURE__ */ React20.createElement("div", { className: "p-2 bg-primary/10 rounded-md text-primary" }, /* @__PURE__ */ React20.createElement(FileSpreadsheet, { className: "h-5 w-5" })), /* @__PURE__ */ React20.createElement("div", { className: "overflow-hidden" }, /* @__PURE__ */ React20.createElement("p", { className: "text-sm font-medium text-foreground truncate max-w-sm" }, fileName || "Uploaded File"), /* @__PURE__ */ React20.createElement("p", { className: "text-xs text-muted-foreground" }, formatBytes(fileSize), " \u2022 ", fileType || "Spreadsheet"))), /* @__PURE__ */ React20.createElement(
    Button9,
    {
      type: "button",
      variant: "destructive",
      size: "sm",
      onClick: handleRemove,
      disabled: isDisabled,
      className: "flex items-center gap-1.5 shrink-0"
    },
    /* @__PURE__ */ React20.createElement(Trash27, { className: "h-3 w-3" }),
    "Remove"
  )) : /* @__PURE__ */ React20.createElement(
    "div",
    {
      onDragEnter: handleDrag,
      onDragOver: handleDrag,
      onDragLeave: handleDrag,
      onDrop: handleDrop,
      className: `relative flex flex-col items-center justify-center p-6 border border-dashed rounded-md transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-border bg-background hover:border-muted-foreground/50 hover:bg-muted/50"}`
    },
    /* @__PURE__ */ React20.createElement(
      "input",
      {
        type: "file",
        id: `file-upload-${path}`,
        className: "hidden",
        accept: ".csv, .xlsx, .xls",
        onChange: handleChangeInput,
        disabled: isUploading || isDisabled
      }
    ),
    /* @__PURE__ */ React20.createElement(
      "label",
      {
        htmlFor: `file-upload-${path}`,
        className: "flex flex-col items-center justify-center cursor-pointer space-y-3 w-full h-full"
      },
      isUploading ? /* @__PURE__ */ React20.createElement("div", { className: "flex flex-col items-center space-y-2" }, /* @__PURE__ */ React20.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }), /* @__PURE__ */ React20.createElement("p", { className: "text-sm font-medium text-muted-foreground" }, "Uploading file\u2026")) : /* @__PURE__ */ React20.createElement(React20.Fragment, null, /* @__PURE__ */ React20.createElement("div", { className: "p-3 bg-primary/10 text-primary rounded-lg" }, /* @__PURE__ */ React20.createElement(CloudUpload, { className: "h-6 w-6" })), /* @__PURE__ */ React20.createElement("div", { className: "text-center" }, /* @__PURE__ */ React20.createElement("p", { className: "text-sm font-medium text-foreground" }, "Click to upload or drag & drop"), /* @__PURE__ */ React20.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Excel (.xlsx, .xls) or CSV up to 10MB")))
    )
  ), (errors?.length > 0 || errorMsg) && /* @__PURE__ */ React20.createElement("p", { className: "text-xs text-destructive mt-1 flex items-center gap-1" }, /* @__PURE__ */ React20.createElement(AlertCircle, { className: "h-3 w-3" }), errorMsg || errors));
};
CustomFileUploadInput.propTypes = {
  data: PropTypes19.object,
  path: PropTypes19.string.isRequired,
  handleChange: PropTypes19.func.isRequired,
  label: PropTypes19.string,
  description: PropTypes19.string,
  errors: PropTypes19.arrayOf(PropTypes19.string),
  uischema: PropTypes19.object.isRequired,
  enabled: PropTypes19.bool
};

// src/renderers/CustomGoogleOAuthButtonControl.jsx
import React21, { useContext as useContext2 } from "react";
import PropTypes20 from "prop-types";
import { GoogleOAuthButton } from "@jet-admin/ui";
var CustomGoogleOAuthButtonControlComponent = (props) => {
  const { data, path, handleChange, label, description, errors, enabled } = props;
  const { startOAuth, loading } = useContext2(OAuthContext);
  const hasErrors = errors && errors.length > 0;
  const isConnected = !!data;
  const handleOAuthClick = () => {
    if (startOAuth) {
      startOAuth((vaultCredentialID) => {
        handleChange(path, vaultCredentialID);
      });
    } else {
      console.error("OAuthContext missing startOAuth handler");
    }
  };
  return /* @__PURE__ */ React21.createElement(
    GoogleOAuthButton,
    {
      isConnected,
      credentialId: data,
      onClick: handleOAuthClick,
      loading,
      disabled: !enabled,
      label,
      description,
      hasErrors,
      errors
    }
  );
};
CustomGoogleOAuthButtonControlComponent.propTypes = {
  data: PropTypes20.string,
  path: PropTypes20.string.isRequired,
  handleChange: PropTypes20.func.isRequired,
  label: PropTypes20.string,
  description: PropTypes20.string,
  errors: PropTypes20.arrayOf(PropTypes20.string),
  enabled: PropTypes20.bool
};
var CustomGoogleOAuthButtonControl = CustomGoogleOAuthButtonControlComponent;

// src/renderers/index.js
var JetNumberControl = withJsonFormsControlProps(CustomNumberInput);
var JetTextControl = withJsonFormsControlProps(CustomTextInput);
var JetSelectControl = withJsonFormsControlProps(CustomSelectInput);
var JetCheckboxControl = withJsonFormsControlProps(CustomCheckboxInput);
var JetCodeEditorControl = withJsonFormsControlProps(CustomCodeEditorControl);
var JetSuggestionControl = withJsonFormsControlProps(CustomSuggestionInput);
var JetCustomDynamicKeyValueInputRenderer = withJsonFormsControlProps(CustomDynamicKeyValueInputRenderer);
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
var JetFileUploadControl = withJsonFormsControlProps(CustomFileUploadInput);
var JetGoogleOAuthControl = withJsonFormsControlProps(CustomGoogleOAuthButtonControl);

// src/testers.js
import {
  rankWith,
  isControl,
  and,
  uiTypeIs,
  Resolve
} from "@jsonforms/core";
var numberInputTester = (uischema, rootSchema) => {
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
var textInputTester = (uischema, rootSchema) => {
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
var selectInputTester = (uischema, rootSchema) => {
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
var dynamicKeyValueInputTester = rankWith(
  20,
  and(isControl, (uischema) => uischema?.options?.isDynamicKeyValueInput === true)
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
    if (!itemSchema) {
      return -1;
    }
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
    if (!itemSchema) {
      return -1;
    }
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
    if (!itemSchema) {
      return -1;
    }
    if (itemSchema.type !== "object" || itemSchema.properties?.key?.type !== "string" || itemSchema.properties?.type?.type !== "string" || !!itemSchema.properties?.value?.type) {
      return -1;
    }
    return 60;
  } catch (e) {
    console.warn("Error in key/type tester:", e);
    return -1;
  }
};
var radioInputTester = (uischema, rootSchema) => {
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
    if (!itemSchema) {
      return -1;
    }
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
var verticalLayoutTester = rankWith(10, uiTypeIs("VerticalLayout"));
var horizontalLayoutTester = rankWith(10, uiTypeIs("HorizontalLayout"));
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
var fileUploadTester = rankWith(
  150,
  and(
    isControl,
    (uischema, rootSchema) => {
      try {
        const currentSchema = Resolve.schema(rootSchema, uischema.scope, rootSchema);
        return currentSchema?.format === "file" || uischema.options?.fileUpload === true;
      } catch (e) {
        return false;
      }
    }
  )
);
var googleOAuthTester = rankWith(
  200,
  and(
    isControl,
    (uischema) => uischema.options && uischema.options.googleOAuth === true
  )
);

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
  { tester: horizontalLayoutTester, renderer: JetHorizontalLayout },
  { tester: fileUploadTester, renderer: JetFileUploadControl },
  { tester: googleOAuthTester, renderer: JetGoogleOAuthControl }
];
var jetFormsRenderers = [
  { tester: suggestionInputTester, renderer: JetSuggestionControl },
  { tester: codeEditorTester, renderer: JetCodeEditorControl },
  { tester: dynamicKeyValueInputTester, renderer: JetCustomDynamicKeyValueInputRenderer },
  ...jetFormsBaseRenderers
];
export {
  CustomCheckboxInput,
  CustomCodeEditorControl,
  CustomCodeEditorControl as CustomCodeJavascriptControl,
  CustomCodeEditorControl as CustomCodePgsqlControl,
  CustomDynamicKeyValueInputRenderer,
  CustomFieldOperatorValueArrayRenderer,
  CustomFileUploadInput,
  CustomGenericObjectArrayRenderer,
  CustomGoogleOAuthButtonControl,
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
  FileUploadContext,
  JetCheckboxControl,
  JetCodeEditorControl,
  JetCodeEditorControl as JetCodeJavascriptControl,
  JetCodeEditorControl as JetCodePgsqlControl,
  JetCustomDynamicKeyValueInputRenderer,
  JetFieldOperatorValueArrayControl,
  JetFileUploadControl,
  JetGenericObjectArrayControl,
  JetGoogleOAuthControl,
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
  OAuthContext,
  checkboxTester,
  codeEditorTester,
  codeEditorTester as codeJavascriptTester,
  codeEditorTester as codePgsqlTester,
  dynamicKeyValueInputTester,
  fieldOperatorValueArrayTester,
  fileUploadTester,
  genericObjectArrayTester,
  googleOAuthTester,
  groupLayoutTester,
  horizontalLayoutTester,
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
