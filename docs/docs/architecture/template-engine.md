---
id: template-engine
title: Template Engine & Bindings
sidebar_label: Template Engine
sidebar_position: 6
description: How dynamic expressions are evaluated across Jet Admin.
---

# Template Engine & Bindings

Jet Admin's power comes from its ability to link data and UI reactively. This is accomplished using **Template Expressions**—snippets of JavaScript wrapped in double curly braces (`{{ }}`) that are evaluated at runtime.

The underlying system powering this is the `@jet-admin/expression-engine` package.

## Expression Syntax

A template expression allows you to write JavaScript that evaluates against the current application context.

### Anatomy of an Expression
Everything inside the `{{ }}` markers is evaluated.

```javascript
// Valid expressions:
{{ widgets.Table1.selectedRow.id }}                  // Property access
{{ queries.getUsers.data.length > 0 ? 'Yes' : 'No' }} // Ternary logic
{{ moment(widgets.DatePicker1.value).format('LL') }}  // Function calls
```

### Evaluation Modes
The Expression Engine operates in different security modes depending on where it is running:

1. **`js-template` (Frontend UI):** Evaluates expressions in the browser using a sandboxed `new Function()`. It has access to the global `state` and `event` objects, as well as utility libraries like `moment` and `_` (lodash).
2. **`safe-path` (Backend Queries):** The most restrictive mode. Used to parse query parameters (e.g., `{{inputs.status}}`). It only allows strict object path traversal. It forbids arithmetic, function calls, or logical operators to guarantee safety against injection attacks.
3. **`isolated-js` (Backend Workflows/Transformers):** Used to execute arbitrary JavaScript (like data transformers or workflow JS nodes). This runs securely on the Node.js backend using the `isolated-vm` native C++ addon, ensuring user-provided code cannot access the Node.js environment, file system, or memory space of the main process.

## Evaluation Context

When an expression is evaluated, it is provided a "context" object. In the frontend builder, this context contains:

- `widgets`: The state of all widgets on the current page (e.g., `widgets.Table1.selectedRow`).
- `queries`: The state and data of all queries (e.g., `queries.getUsers.data`, `queries.getUsers.isLoading`).
- `inputs`: URL parameters or form inputs (e.g., `inputs.pageId`).
- `jetadmin`: Global app-level helpers and metadata.
- **Utilities:** Global libraries like `moment` (date parsing), `_` (lodash utilities), and standard Math functions.

## Reactivity & Re-evaluation

Jet Admin ensures the UI stays up-to-date instantly.

### The Dependency Graph
The frontend maintains a reactive dependency graph. When a property is configured with a binding (e.g., a Text widget displaying `{{widgets.Input1.text}}`), the Expression Engine extracts the dependencies (`widgets.Input1.text`).

### Re-evaluation Trigger
When the user types in `Input1`, the Zustand store updates. The frontend observes this update, checks the dependency graph, identifies that the Text widget depends on this changed value, and re-evaluates the expression. The new value is passed to the Text widget, triggering a React re-render.

## Autocomplete & IntelliSense

Writing expressions is supported by a robust IntelliSense system built into the Expression Engine.

### Context Awareness
When a user types `{{` in a property panel, the `TemplateAutocompleteInput` component queries the Expression Engine. The engine introspects the current live schema of the Zustand store and provides autocomplete suggestions.

If the user types `{{widgets.T`, the engine suggests `widgets.Table1`.

### Dual-Mode UX
The autocomplete system supports both single-line inputs (for simple properties like a text label) and multi-line textareas (for writing longer JSON configurations or transformer functions).
