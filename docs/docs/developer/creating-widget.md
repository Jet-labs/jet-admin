---
sidebar_position: 3
title: Creating a Widget
description: How to add a new visualization widget type
---

# Creating a Custom Widget

This guide explains how to add a new widget type (e.g., a Heatmap, Gauge, or custom visualization).

## Overview

Widget creation involves three packages:

1. **`widget-types`**: Define the widget type constant
2. **`widgets-logic`**: Create the data transformer (backend)
3. **`widgets`**: Build the React renderer component (frontend)

## Step 1: Define the Widget Type

In `packages/widget-types/src/index.js`:

```javascript
export const WIDGET_TYPES = {
  // ... existing types
  HEATMAP: {
    name: 'Heatmap',
    value: 'heatmap',
    icon: 'HeatmapIcon',
    description: 'Display data intensity across two dimensions'
  }
};
```

## Step 2: Create the Data Transformer

The transformer converts raw workflow output into the widget's expected format.

```javascript
// packages/widgets-logic/src/processors/heatmap.processor.js

export function processHeatmapData(rawData, config) {
  const { xField, yField, valueField } = config;
  
  // Transform to heatmap format: { x, y, value }
  return rawData.map(row => ({
    x: row[xField],
    y: row[yField],
    value: row[valueField]
  }));
}
```

Register in the processor index:

```javascript
// packages/widgets-logic/src/index.js
import { processHeatmapData } from './processors/heatmap.processor';

export const PROCESSORS = {
  // ... existing
  heatmap: processHeatmapData
};
```

## Step 3: Create the React Component

```jsx
// packages/widgets/src/heatmap/HeatmapWidget.jsx

import React from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap'; // Example library

export function HeatmapWidget({ data, config }) {
  if (!data || data.length === 0) {
    return <div className="widget-empty">No data available</div>;
  }

  return (
    <div className="widget-container">
      <ResponsiveHeatMap
        data={data}
        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
        valueFormat=">-.2s"
        axisTop={{
          tickSize: 5,
          legend: config.xLabel || '',
          legendPosition: 'middle'
        }}
        colors={{
          type: 'sequential',
          scheme: config.colorScheme || 'blues'
        }}
      />
    </div>
  );
}
```

Export from package:

```javascript
// packages/widgets/src/index.js
export { HeatmapWidget } from './heatmap/HeatmapWidget';
```

## Step 4: Create Configuration UI (Optional)

In `packages/widgets-ui/src/heatmap/`:

```jsx
// HeatmapConfig.jsx
export function HeatmapConfig({ config, onChange }) {
  return (
    <div className="widget-config">
      <label>X-Axis Field</label>
      <select 
        value={config.xField} 
        onChange={(e) => onChange({ ...config, xField: e.target.value })}
      >
        {/* Field options */}
      </select>
      
      <label>Y-Axis Field</label>
      <select 
        value={config.yField}
        onChange={(e) => onChange({ ...config, yField: e.target.value })}
      >
        {/* Field options */}
      </select>
      
      <label>Value Field</label>
      <select 
        value={config.valueField}
        onChange={(e) => onChange({ ...config, valueField: e.target.value })}
      >
        {/* Field options */}
      </select>
    </div>
  );
}
```

## Step 5: Register in Widget Factory

In the frontend app, register the widget renderer:

```javascript
// apps/frontend/src/presentation/components/widgets/WidgetRenderer.jsx

import { HeatmapWidget } from '@jet-admin/widgets';

const WIDGET_COMPONENTS = {
  // ... existing
  heatmap: HeatmapWidget
};

export function WidgetRenderer({ type, data, config }) {
  const Component = WIDGET_COMPONENTS[type];
  if (!Component) return <div>Unknown widget type</div>;
  return <Component data={data} config={config} />;
}
```

## Widget Interface

All widget components should accept these props:

```typescript
interface WidgetProps {
  data: any[];           // Processed data from workflow
  config: {              // User configuration
    title?: string;
    [key: string]: any;
  };
  isLoading?: boolean;
  error?: string;
}
```

## Best Practices

- **Responsive Design**: Use percentage-based sizing
- **Loading States**: Show skeleton/spinner while loading
- **Empty States**: Display helpful message when no data
- **Error Handling**: Gracefully handle malformed data
- **Accessibility**: Include ARIA labels and keyboard navigation
