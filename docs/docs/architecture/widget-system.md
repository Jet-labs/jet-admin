---
id: widget-system
title: Widget System
sidebar_label: Widget System
sidebar_position: 3
description: Architecture of the UI components, reactivity, state model, and available widgets.
---

# Widget System

Widgets are the atomic UI building blocks of Jet Admin. They are React components that have been wrapped to participate in Jet Admin's layout engine, state management, and event system.

## Widget Architecture

### Widget Definitions
Every widget is defined by a schema that describes its capabilities to the platform. A widget definition (found in `@jet-admin/widget-types`) includes:
- **Type Identifier:** e.g., `table`, `button`, `date-picker`.
- **Default Properties:** The initial state when dragged onto the canvas.
- **Events:** The interactions it supports (e.g., `onClick`, `onRowSelect`).
- **Methods:** Callable actions (e.g., `refresh()`, `clearSelection()`).
- **Property Panel Config:** A JSON Schema defining the form used to configure the widget in the builder.

### The Widget Registry
When the frontend application boots, it loads the Widget Registry. This registry maps a string type (`"table"`) to its corresponding React component (`<TableWidget />`) and its metadata.

### Rendering Pipeline
When a Page loads:
1. The Layout Engine reads the array of widget definitions from the `appPageConfig`.
2. For each widget, it finds the matching React component in the Registry.
3. The component is wrapped in a generic `<WidgetContainer>` that handles standard behaviors:
   - Drag-and-drop handles.
   - Resizing logic.
   - Evaluating `{{bindings}}` in properties.
   - Injecting evaluated properties into the underlying React component as props.

## Widget State Model

Widgets must share data with the rest of the application. For example, a Query needs to read the selected text from an Input widget.

### Zustand Store
Widget state is stored in a normalized slice of the global Zustand store. The store maintains a flat object keyed by the unique Widget ID (assigned when the widget is placed on the canvas).

```json
{
  "widgets": {
    "TableWidget1": {
      "selectedRow": { "id": 42, "name": "Alice" },
      "page": 1
    },
    "SearchInput1": {
      "text": "Alice"
    }
  }
}
```

### Inter-Widget References
Because the state is centralized, widgets can reference each other using Template Expressions. If a Text widget's text property is set to `{{widgets.SearchInput1.text}}`, the Template Engine evaluates this against the global context.

### Reactivity
Jet Admin uses a reactive dependency graph. When a user types in `SearchInput1`:
1. The widget calls its internal `onChange` handler.
2. The handler dispatches an action to update `widgets.SearchInput1.text` in the Zustand store.
3. Zustand notifies subscribed listeners.
4. The Template Engine detects that the Text widget depends on this value, re-evaluates the expression, and passes the new value to the Text widget, causing a re-render.

## Widget Property Panel

The Property Panel on the right side of the builder allows users to configure a widget.

### Schema-Driven Generation
The UI of the property panel is generated automatically based on the widget's schema. This means adding a new configurable property to a widget does not require writing new UI code; you simply update the JSON Schema for that widget type.

### Property Types
Properties fall into several categories:
- **Static Values:** Hardcoded strings, numbers, or booleans.
- **Bindings:** Strings containing `{{expressions}}` that must be evaluated dynamically.
- **Event Handlers:** Configurations dictating what happens when a widget event fires (e.g., "When `onClick` fires, Execute Query `getUsers`").

### Live Preview
Changes made in the Property Panel patch the widget's configuration in the Zustand store immediately. Because the widget on the canvas is subscribed to this configuration, it updates in real-time without requiring a full page reload.

---

## Built-in Widget Catalog

Jet Admin includes a rich set of built-in widgets. Below is a summary of the core components.

*(Note: Exact property names and events depend on the widget schemas defined in `packages/widget-types/src/index.js`)*

### Table (`table`)
- **Purpose:** Displaying arrays of objects in a tabular format. Supports pagination, sorting, and inline editing.
- **Key Events:** `onRowSelect`, `onPageChange`, `onSearch`, `onRowSave`, `onBulkDelete`.
- **Callable Methods:** `refresh`, `setSelectedRow`, `clearSelection`.

### Button (`button`)
- **Purpose:** Triggering actions.
- **Key Events:** `onSubmit`, `onClick`.
- **Callable Methods:** `click`.

### Form (`form`)
- **Purpose:** Collecting structured user input. Groups inputs and provides a unified submit event containing all field values.
- **Key Events:** `onSubmit` (emits the `formData` object), `onFieldChange`.

### Chart (`vega` / `vega-lite`)
- **Purpose:** Declarative data visualization using the Vega-Lite grammar.
- **Key Properties:** Vega specification JSON.
- **Callable Methods:** `refresh`, `resize`.

### Date Picker (`date-picker`) & Date Range (`date-range-picker`)
- **Purpose:** Selecting dates, times, or date ranges.
- **Key Events:** `onChange` (emits ISO date strings), `onClear`.

### HTML (`html`)
- **Purpose:** Rendering custom HTML or embedding external content via an iframe.
- **Key Events:** `onMessage` (listens for `postMessage` events dispatched from inside the iframe).
- **Callable Methods:** `refresh`.

### Alert (`alert`)
- **Purpose:** Displaying warning, success, or informational banners.
- **Key Events:** `onDismiss`.
