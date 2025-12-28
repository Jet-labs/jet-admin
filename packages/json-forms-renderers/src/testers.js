// JSON Forms Testers
import {
  rankWith,
  isControl,
  and,
  formatIs,
  uiTypeIs,
  Resolve,
} from '@jsonforms/core';

// ============================================================================
// Number Input Tester
// ============================================================================
export const numberInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }

  try {
    const currentSchema = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!currentSchema) {
      return -1;
    }

    if (
      (currentSchema.type === "number" || currentSchema.type === "integer") &&
      !currentSchema.enum
    ) {
      return 10;
    }
  } catch (e) {
    console.warn(`Error resolving schema for scope ${uischema.scope} in numberInputTester:`, e);
    return -1;
  }
  return -1;
};

// ============================================================================
// Text Input Tester
// ============================================================================
export const textInputTester = (uischema, rootSchema, context) => {
  if (uischema.type !== "Control") {
    return -1;
  }

  try {
    const currentSchema = Resolve.schema(rootSchema, uischema.scope, rootSchema);

    if (!currentSchema) {
      return -1;
    }

    if (
      (currentSchema.format === "password" && uischema.options?.format === "password") ||
      (currentSchema.type === "string" && !currentSchema.enum)
    ) {
      return 50;
    }
  } catch (e) {
    console.warn(`Error resolving schema for scope ${uischema.scope} in textInputTester:`, e);
    return -1;
  }
  return -1;
};

// ============================================================================
// Select Input Tester
// ============================================================================
export const selectInputTester = (uischema, rootSchema, context) => {
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

// ============================================================================
// Checkbox Tester
// ============================================================================
export const checkboxTester = (uischema, schema) => {
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

// ============================================================================
// Code PGSQL Tester (for Monaco Editor SQL)
// ============================================================================
export const codePgsqlTester = rankWith(
  100,
  and(isControl, formatIs("code-pgsql"))
);

// ============================================================================
// Code JavaScript Tester (for Monaco Editor JavaScript)
// ============================================================================
export const codeJavascriptTester = rankWith(
  100,
  and(isControl, formatIs("code-javascript"))
);

// ============================================================================
// Suggestion Input Tester
// ============================================================================
export const suggestionInputTester = rankWith(
  50,
  and(isControl, (uischema) => uischema.options && uischema.options.suggestionType === 'nodeOutput')
);

// ============================================================================
// Dynamic Args Tester (for workflow nodes)
// ============================================================================
export const dynamicArgsTester = rankWith(
  20,
  and(isControl, (uischema) => uischema?.options?.isDynamicArgs === true)
);

// ============================================================================
// Key-Value Array Tester
// ============================================================================
export const keyValueArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const schemaAtScope = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    const itemSchema = schemaAtScope.items;
    if (
      itemSchema.type !== "object" ||
      itemSchema.properties?.key?.type !== "string" ||
      itemSchema.properties?.value?.type !== "string"
    ) {
      return -1;
    }
    return 50;
  } catch (e) {
    console.warn("Error in key/value tester:", e);
    return -1;
  }
};

// ============================================================================
// Key-Value-Type Array Tester
// ============================================================================
export const keyValueTypeArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const schemaAtScope = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    const itemSchema = schemaAtScope.items;
    if (
      itemSchema.type !== "object" ||
      itemSchema.properties?.key?.type !== "string" ||
      itemSchema.properties?.value?.type !== "string" ||
      itemSchema.properties?.type?.type !== "string"
    ) {
      return -1;
    }
    return 60;
  } catch (e) {
    console.warn("Error in key/value/type tester:", e);
    return -1;
  }
};

// ============================================================================
// Key-Type Array Tester (no value)
// ============================================================================
export const keyTypeArrayTester = (uischema, rootSchema) => {
  if (uischema.type !== "Control") {
    return -1;
  }
  try {
    const schemaAtScope = Resolve.schema(rootSchema, uischema.scope, rootSchema);
    if (!schemaAtScope || schemaAtScope.type !== "array") {
      return -1;
    }
    const itemSchema = schemaAtScope.items;
    if (
      itemSchema.type !== "object" ||
      itemSchema.properties?.key?.type !== "string" ||
      itemSchema.properties?.type?.type !== "string" ||
      itemSchema.properties?.value?.type
    ) {
      return -1;
    }
    return 60;
  } catch (e) {
    console.warn("Error in key/type tester:", e);
    return -1;
  }
};

// ============================================================================
// Group Layout Tester
// ============================================================================
export const groupLayoutTester = (uischema) => {
  return rankWith(10, uiTypeIs("Group"))(uischema);
};

// ============================================================================
// Vertical Layout Tester
// ============================================================================
export const verticalLayoutTester = (uischema) => {
  return uischema.type === "VerticalLayout" ? 10 : -1;
};

// ============================================================================
// Tab Renderer Tester (Categorization)
// ============================================================================
export const tabRendererTester = (uischema) => {
  if (uischema.type === "Categorization") {
    return 50;
  }
  return -1;
};
