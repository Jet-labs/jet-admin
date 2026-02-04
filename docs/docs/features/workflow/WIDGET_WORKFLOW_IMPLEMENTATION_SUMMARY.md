# Widget-Workflow Integration - Implementation Summary

> **Completed:** 2026-01-18  
> **Status:** ✅ Implemented

---

## Overview

This document summarizes the complete Widget-Workflow integration implementation for Jet Admin, enabling widgets to use workflows as their primary data source with real-time WebSocket connectivity.

---

## Components Implemented

### Backend Components

| Component | File | Purpose |
|-----------|------|---------|
| **Widget-Workflow Bridge** | `apps/backend/modules/widget/widgetWorkflowBridge.js` | Core bridge managing connections between widgets and workflow instances |
| **Widget Socket Controller** | `apps/backend/modules/widget/widget.socket.controller.js` | Handles WebSocket events for widget-workflow communication |
| **Enhanced workerSDK** | `apps/backend/modules/workflow/workers/workerSDK.js` | Extended with variable resolution, wildcards, transforms, and formatting |
| **Orchestrator Integration** | `apps/backend/modules/workflow/orchestrator/orchestrator.js` | Emits context updates to subscribed widgets |
| **Socket Event Registration** | `apps/backend/index.js` | Registered all widget-workflow socket events |
| **Constants Update** | `apps/backend/constants.js` | Added socket event constants |
| **Controller Endpoints** | `apps/backend/modules/widget/widget.controller.js` | Added schema and bridge stats endpoints |

### Frontend Components

| Component | File | Purpose |
|-----------|------|---------|
| **useWidgetWorkflowConnection** | `apps/frontend/src/logic/hooks/useWidgetWorkflowConnection.jsx` | React hook for WebSocket connection management |
| **VariableExplorer** | `apps/frontend/src/presentation/components/widgetComponents/variableExplorer.jsx` | Tree-view component for browsing workflow context |
| **VariablePathPicker** | `apps/frontend/src/presentation/components/widgetComponents/variablePathPicker.jsx` | Variable path selection with transforms |
| **Enhanced DashboardWidget** | `apps/frontend/src/presentation/components/dashboardComponents/dashboardWidget.jsx` | Dual-mode widget with WebSocket support |
| **Enhanced WidgetDatasetFieldMapping** | `apps/frontend/src/presentation/components/widgetComponents/widgetDatasetFieldMapping.jsx` | Field mapping with variable explorer integration |
| **Frontend Constants** | `apps/frontend/src/constants.js` | Added socket event constants |

---

## Features Implemented

### 1. Real-time WebSocket Connection

```javascript
// Widget connects to workflow via WebSocket
socket.emit('widget_workflow_connect', {
  widgetID: 'uuid',
  workflowID: 'uuid',
  mode: 'execute' | 'subscribe' | 'replay',
  inputParams: { ... },
});

// Widget receives real-time context updates
socket.on('widget_context_update', (data) => {
  // data.update.contextSnapshot contains latest workflow context
});
```

### 2. Connection Modes

| Mode | Description |
|------|-------------|
| **execute** | Start a new workflow execution and receive updates |
| **subscribe** | Attach to existing workflow instance |
| **replay** | Load completed workflow's final context (no live updates) |

### 3. Variable Resolution System

```javascript
// Enhanced path navigation with wildcards
navigatePathEnhanced(ctx, 'ctx.query.rows[*].value')
// Returns: [1, 2, 3, 4, 5]

// Null-safe navigation
navigatePathEnhanced(ctx, 'ctx.data?.nested?.value')
// Returns: undefined if path doesn't exist

// Transform support
applyTransform(value, {
  type: 'aggregate',
  aggregation: 'sum',
  path: 'amount'
})
// Returns: sum of all amount values
```

### 4. Widget Dataset Field Mapping

Users can now bind widget fields to workflow variables:

```json
{
  "xAxis": {
    "variablePath": "ctx.salesData.rows[*].date",
    "transform": { "type": "format", "formatType": "date:short" }
  },
  "yAxis": {
    "variablePath": "ctx.salesData.rows[*].amount"
  }
}
```

### 5. Transform Types Supported

| Transform | Description | Example |
|-----------|-------------|---------|
| `map` | Extract field from array | `rows[*].name` → `['a', 'b', 'c']` |
| `filter` | Filter by condition | `item.status === 'active'` |
| `slice` | Limit items | `start: 0, end: 10` |
| `sort` | Sort by field | `sortPath: 'value', ascending: true` |
| `aggregate` | Sum, avg, count, min, max | `aggregation: 'sum', path: 'amount'` |
| `format` | Format dates, numbers, strings | `formatType: 'date:short'` |

### 6. Format Types

**Dates:**
- `date:short`, `date:long`, `date:time`, `date:datetime`, `date:iso`

**Numbers:**
- `number:currency`, `number:percent`, `number:decimal`, `number:compact`

**Strings:**
- `string:uppercase`, `string:lowercase`, `string:capitalize`, `string:truncate`

---

## Socket Events

### Widget → Server

| Event | Purpose |
|-------|---------|
| `widget_workflow_connect` | Connect widget to workflow |
| `widget_send_input` | Send interactive input |
| `widget_refresh` | Re-execute workflow |
| `widget_workflow_disconnect` | Disconnect widget |

### Server → Widget

| Event | Purpose |
|-------|---------|
| `widget_workflow_connected` | Connection confirmed |
| `widget_context_update` | Context updated (node completed) |
| `widget_workflow_status` | Workflow status changed |
| `widget_workflow_error` | Error occurred |
| `widget_input_received` | Input acknowledged |

---

## Usage Example

### 1. Configure Widget with Workflow

```javascript
// In widget editor form
{
  workflowID: "uuid-of-sales-workflow",
  workflowConfig: {
    mode: "websocket",      // Enable WebSocket mode
    realtime: true,
    workflowArgValues: {
      startDate: "2026-01-01",
      endDate: "2026-01-31"
    },
    datasetFields: {
      xAxis: {
        variablePath: "ctx.salesQuery.rows[*].date",
        transform: { type: "format", formatType: "date:short" }
      },
      yAxis: {
        variablePath: "ctx.salesQuery.rows[*].revenue"
      }
    }
  }
}
```

### 2. Widget Rendering

The DashboardWidget automatically:
1. Detects WebSocket mode (`workflowConfig.mode === 'websocket'`)
2. Establishes WebSocket connection
3. Executes workflow with input params
4. Receives real-time context updates
5. Resolves dataset fields using variable bindings
6. Renders chart/table with resolved data

### 3. Using the React Hook

```javascript
import { useWidgetWorkflowConnection } from './hooks/useWidgetWorkflowConnection';

function MyWidget({ widgetID, workflowID }) {
  const {
    isConnected,
    context,
    workflowStatus,
    resolveVariable,
    refresh,
  } = useWidgetWorkflowConnection({
    widgetID,
    workflowID,
    tenantID: 1,
    mode: 'execute',
    autoConnect: true,
  });

  // Access workflow variables
  const salesData = resolveVariable('salesQuery.rows', []);
  const totalRevenue = resolveVariable('analytics.totalRevenue', 0);

  return (
    <div>
      <p>Status: {workflowStatus}</p>
      <p>Revenue: ${totalRevenue}</p>
      <button onClick={() => refresh()}>Refresh</button>
    </div>
  );
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DashboardWidget ─────► useWidgetWorkflowConnection                │
│       │                        │                                    │
│       │                        ▼                                    │
│       │                 Socket.IO Events                           │
│       │                 ┌──────────────┐                           │
│       │                 │ connect      │                           │
│       │                 │ subscribe    │                           │
│       │                 │ disconnect   │                           │
│       │                 └──────┬───────┘                           │
│       │                        │                                    │
│       ▼                        │                                    │
│  VariableExplorer ◄───── context updates ◄────────────────────────┤
│  VariablePathPicker                                                │
│                                                                     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ WebSocket
                                 ▼
┌────────────────────────────────┴────────────────────────────────────┐
│                          BACKEND                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Widget Socket Controller ◄───► widgetWorkflowBridge               │
│       │                              │                              │
│       │                              │                              │
│       ▼                              ▼                              │
│  Orchestrator ◄───────────► State Manager                          │
│       │                              │                              │
│       ▼                              ▼                              │
│  Task Workers ◄─────────────► RabbitMQ                             │
│       │                                                             │
│       ▼                                                             │
│  workerSDK (resolveWidgetVariable)                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Files Modified/Created

### Created Files
- `apps/backend/modules/widget/widgetWorkflowBridge.js`
- `apps/backend/modules/widget/widget.socket.controller.js`
- `apps/frontend/src/logic/hooks/useWidgetWorkflowConnection.jsx`
- `apps/frontend/src/presentation/components/widgetComponents/variableExplorer.jsx`
- `apps/frontend/src/presentation/components/widgetComponents/variablePathPicker.jsx`

### Modified Files
- `apps/backend/modules/workflow/workers/workerSDK.js`
- `apps/backend/modules/workflow/orchestrator/orchestrator.js`
- `apps/backend/modules/widget/widget.controller.js`
- `apps/backend/constants.js`
- `apps/backend/index.js`
- `apps/frontend/src/constants.js`
- `apps/frontend/src/presentation/components/dashboardComponents/dashboardWidget.jsx`
- `apps/frontend/src/presentation/components/widgetComponents/widgetDatasetFieldMapping.jsx`

---

## Next Steps (Optional Enhancements)

1. **Caching Layer**: Add Redis caching for frequently accessed workflow contexts
2. **Multi-Workflow Composition**: Allow widgets to consume from multiple workflows
3. **Interactive Widgets**: Forms that feed workflow inputs in real-time
4. **Workflow Templates**: Pre-built workflows for common widget patterns
5. **Connection Pooling**: Optimize WebSocket connections for many widgets
6. **Database Schema Migration**: Add `tblWidgetWorkflowSessions` for connection tracking

---

## Testing

To test the integration:

1. Create a workflow with data query nodes
2. Create a widget and select the workflow
3. Configure dataset field mappings using the Variable Path Picker
4. Enable WebSocket mode in workflowConfig: `{ "mode": "websocket", "realtime": true }`
5. View the widget on a dashboard - it should show real-time updates as the workflow executes
