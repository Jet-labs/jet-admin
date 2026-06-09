---
sidebar_position: 3
title: Creating a Widget
description: How to add a new visualization widget type
---

# Creating a Custom Widget

This guide explains how to add a new widget type (e.g., a Heatmap, Gauge, or custom visualization) to Jet Admin.

## Overview

Widget creation involves updating packages to ensure the UI component, its configuration panel, and its backend properties are recognized by the Jet Admin engine.

1. **`@jet-admin/widget-types`**: Define the widget type, schema, and events.
2. **`@jet-admin/widgets-ui`**: Create the React renderer component and its configuration panel.
3. **`apps/frontend`**: (Optional) Register the widget if it requires app-level integration.

---

## Step 1: Define the Widget Schema and Metadata

Open `packages/widget-types/src/index.js` to register your new widget type. This tells Jet Admin what properties the widget accepts and what events it can emit.

```javascript
// packages/widget-types/src/index.js

export const WIDGET_TYPES = {
  // ... existing types
  HEATMAP: {
    label: 'Heatmap',
    value: 'heatmap',
    description: 'Display data intensity across two dimensions',
    defaultProps: {
      title: 'Activity Map',
      data: [],
      xField: 'date',
      yField: 'hour',
      valueField: 'count'
    }
  }
};

// Add events if your widget emits specific actions (e.g. clicking a cell)
export const WIDGET_EVENT_TYPES = {
  // ...
  heatmap: [
    {
      value: "onCellClick", label: "On Cell Click", desc: "Fires when a heatmap cell is clicked",
      inputDefinitions: [
        { key: "event.cell", description: "The clicked cell object" },
      ],
    },
  ]
};
```

---

## Step 2: Create the React Component

In the `@jet-admin/widgets-ui` package, create the visual component that users will see on the canvas.

```jsx
// packages/widgets-ui/src/heatmap/HeatmapWidget.jsx

import React from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap'; // Example library

// The wrapper automatically evaluates bindings in props before passing them here
export function HeatmapWidget({ id, title, data, xField, yField, valueField, onEvent }) {
  if (!data || data.length === 0) {
    return <div className="widget-empty">No data available</div>;
  }

  // Transform flat array to Heatmap format if necessary
  const processedData = React.useMemo(() => {
    // ... transformation logic
    return data;
  }, [data]);

  return (
    <div className="widget-container" style={{ width: '100%', height: '100%' }}>
      {title && <h3>{title}</h3>}
      <ResponsiveHeatMap
        data={processedData}
        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
        onClick={(cell) => onEvent('onCellClick', { cell })}
      />
    </div>
  );
}
```

---

## Step 3: Create the Configuration UI

Jet Admin uses a configuration schema to automatically build the property panel on the right sidebar.

In `packages/widgets-ui/src/widget.config.js` (or a specific config file), define the property panel sections:

```javascript
// packages/widgets-ui/src/heatmap/heatmap.config.js

export const heatmapPropertyPanel = {
  type: "Categorization",
  elements: [
    {
      type: "Category",
      label: "Data",
      elements: [
        { type: "Control", scope: "#/properties/data" },
        { type: "Control", scope: "#/properties/xField" },
        { type: "Control", scope: "#/properties/yField" },
        { type: "Control", scope: "#/properties/valueField" },
      ]
    },
    {
      type: "Category",
      label: "Events",
      elements: [
        { type: "Control", scope: "#/properties/onCellClick" },
      ]
    }
  ]
};
```

---

## Step 4: Register in the Widget Map

Ensure the Layout Engine can find your new component. In `packages/widgets-ui/src/widget.map.js`:

```javascript
// packages/widgets-ui/src/widget.map.js

import { HeatmapWidget } from './heatmap/HeatmapWidget';
import { heatmapPropertyPanel } from './heatmap/heatmap.config';

export const WIDGET_MAP = {
  // ... existing widgets
  heatmap: {
    component: HeatmapWidget,
    configPanel: heatmapPropertyPanel
  }
};
```

---

## Step 5: Test in the Builder

1. If you haven't already, start the package watcher: `npm run dev:all-packages`
2. Start the frontend: `npm run dev` in `apps/frontend`.
3. Open a Page in Edit mode. You should see "Heatmap" in the Add Widget sidebar.
4. Drag it onto the canvas, configure the data binding, and test the `onCellClick` event.

---

## Best Practices

- **Responsive Design**: Always use `width: 100%` and `height: 100%` on the root element of your widget so it fills the Layout Engine's grid cells.
- **Error Boundaries**: If your widget uses an external library that might crash on bad data, wrap it in a `try/catch` or an Error Boundary.
- **Empty States**: Display a helpful message (e.g., "Connect data to view heatmap") when `data` is empty, rather than rendering a blank square.
- **Event Forwarding**: Always use the `onEvent(eventName, payload)` prop provided by the WidgetContainer to ensure events trigger Jet Admin actions.
