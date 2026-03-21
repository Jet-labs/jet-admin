# Widget-Workflow Integration Analysis


> **Generated:** 2026-01-18 | **Version:** 1.0  
> **Purpose:** Comprehensive analysis of tight integration between Widgets and Workflows as the primary data source

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Proposed Architecture](#3-proposed-architecture)
4. [Data Flow Design](#4-data-flow-design)
5. [Workflow Context Exposure](#5-workflow-context-exposure)
6. [WebSocket Connection Design](#6-websocket-connection-design)
7. [Variable Access System](#7-variable-access-system)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [API Contract Changes](#9-api-contract-changes)
10. [Database Schema Changes](#10-database-schema-changes)
11. [Risk Analysis](#11-risk-analysis)

---

## 1. Executive Summary

### 1.1 Current State

The Jet Admin platform currently has two separate subsystems:

| System | Purpose | Data Source | Connectivity |
|--------|---------|-------------|--------------|
| **Widgets** | Visualization (charts, tables, text) | Static queries or basic workflow execution | One-shot REST + polling |
| **Workflows** | Multi-step automation with DAG execution | DataQueries, JavaScript, conditions | RabbitMQ + Socket.IO real-time |

Currently, widgets can:
- Reference a single workflow via `workflowID` + `workflowConfig`
- Execute that workflow when widget data is requested
- Poll or wait for workflow completion

### 1.2 Vision: Tight Integration

The goal is to transform widgets into **workflow-powered visualization endpoints** where:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WIDGET ←→ WORKFLOW INTEGRATION                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐      Constant WebSocket        ┌─────────────────────┐    │
│  │   WIDGET    │◄════════════════════════════►│     WORKFLOW        │    │
│  │             │                                 │                     │    │
│  │  • Bar Chart│     1. Full Context Access     │  • Start Node       │    │
│  │  • Table    │     2. Variable Bindings       │  • DataQuery Node   │    │
│  │  • Text     │     3. Real-time Updates       │  • JavaScript Node  │    │
│  │  • IFrame   │     4. Async Execution         │  • Condition Node   │    │
│  │             │     5. Bidirectional Events    │  • End Node         │    │
│  └─────────────┘                                 └─────────────────────┘    │
│                                                                             │
│  Key Capabilities:                                                          │
│  ────────────────                                                           │
│  ✓ Widget has access to complete workflow ctx                               │
│  ✓ Constant WebSocket for real-time + async execution                       │
│  ✓ Variables accessible from any node output                                │
│  ✓ Workflow input parameters bound to widget interactions                   │
│  ✓ Workflow outputs directly feed widget visualization                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Current State Analysis

### 2.1 Existing Widget Architecture

```
Frontend (Widget Display)                    Backend (Widget Service)
════════════════════════                    ═══════════════════════
                                                    
DashboardWidget.jsx                         widget.service.js
  │                                           │
  ├─► useQuery: getWidgetByIDAPI            ├─► getWidgetByID()
  │     (fetches widget config)              │     (widget metadata)
  │                                           │
  ├─► useQuery: getWidgetDataByIDAPI        ├─► getWidgetDataByID()
  │     (triggers workflow execution)         │     └─► _executeWorkflowMode()
  │                                           │           └─► workflowService.executeWorkflow()
  │                                           │                 └─► Returns: { instanceID }
  │                                           │
  └─► useWidgetWorkflowData()               
        ├─► Polls for workflow status        
        ├─► Listens to socket events         
        └─► Returns: workflowData            
```

### 2.2 Existing Workflow Architecture

```
Workflow Execution Flow
═══════════════════════

1. StartWorkflow Request
   │
   ▼
2. stateManager.createInstance()
   │  → Creates tblWorkflowInstances
   │  → Initial context: { input: inputParams }
   │
   ▼
3. dagScheduler.getStartNode()
   │
   ▼
4. addNodeJob() → RabbitMQ (workflow.tasks)
   │
   ▼
5. TaskWorker consumes job
   │  → handler.execute()
   │  → Produces result
   │
   ▼
6. addResult() → RabbitMQ (workflow.results)
   │
   ▼
7. Orchestrator consumes result
   │  → stateManager.updateContext()
   │  → Socket.IO: emit("workflow_node_update")
   │  → dagScheduler.calculateNextNodes()
   │  → Loop to step 4 if more nodes
   │
   ▼
8. On End Node:
   │  → stateManager.completeInstance()
   │  → Socket.IO: emit("workflow_status_update")
   │
   ▼
9. Final Output
```

### 2.3 Current Widget-Workflow Coupling (Limited)

**Current tblWidgets Schema:**
```prisma
model tblWidgets {
  widgetID          String        @id
  workflowID        String?       @db.Uuid    // References one workflow
  workflowConfig    Json?                     // Contains:
  // {
  //   title: "Data Source",
  //   workflowArgValues: { param1: "value1" },
  //   datasetFields: { xAxis: "ctx.data.x", yAxis: "ctx.data.y" },
  //   parameters: { ... }
  // }
}
```

**Current Limitations:**
1. ❌ Widget can only access **final output** of workflow
2. ❌ No access to intermediate node outputs
3. ❌ No bidirectional communication (widget → workflow)
4. ❌ One-shot execution model (no persistent connection)
5. ❌ No variable exploration UI for binding
6. ❌ Cannot trigger workflow with widget-driven inputs

---

## 3. Proposed Architecture

### 3.1 High-Level Integration Model

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           WIDGET-WORKFLOW BRIDGE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                         WIDGET LAYER                                      │  │
│  │                                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │  Bar Chart  │  │    Table    │  │    Text     │  │   IFrame    │      │  │
│  │  │             │  │             │  │             │  │             │      │  │
│  │  │ xAxis: {{   │  │ data: {{    │  │ text: {{    │  │ url: {{     │      │  │
│  │  │   ctx.node1 │  │   ctx.query │  │   ctx.calc  │  │   ctx.link  │      │  │
│  │  │   .labels   │  │   Result    │  │   Result    │  │   Result    │      │  │
│  │  │ }}          │  │ }}          │  │ }}          │  │ }}          │      │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │  │
│  └─────────┼────────────────┼────────────────┼────────────────┼─────────────┘  │
│            │                │                │                │                 │
│            └────────────────┴────────────────┴────────────────┘                 │
│                                      │                                          │
│                           ┌──────────▼──────────┐                               │
│                           │    WIDGET BRIDGE    │                               │
│                           │ (WorkflowConnector) │                               │
│                           │                     │                               │
│                           │ • Manages connection│                               │
│                           │ • Syncs context     │                               │
│                           │ • Variable resolver │                               │
│                           │ • Event dispatcher  │                               │
│                           └──────────┬──────────┘                               │
│                                      │                                          │
│                           WebSocket (Constant)                                  │
│                                      │                                          │
│  ┌───────────────────────────────────▼──────────────────────────────────────┐  │
│  │                         WORKFLOW LAYER                                    │  │
│  │                                                                            │  │
│  │    WorkflowContext (Complete Access)                                      │  │
│  │    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                      │  │
│  │                                                                            │  │
│  │    {                                                                       │  │
│  │      input: { param1: "...", param2: "..." },                             │  │
│  │                                                                            │  │
│  │      // Node outputs (keyed by outputVariable)                            │  │
│  │      queryResult: { ... },                                                 │  │
│  │      scriptResult: { ... },                                                │  │
│  │      calculatedValue: 42,                                                  │  │
│  │                                                                            │  │
│  │      // Node metadata (prefixed with __)                                  │  │
│  │      __node_abc123: { output: {...}, status: "success" },                 │  │
│  │      __node_def456: { output: {...}, status: "running" },                 │  │
│  │                                                                            │  │
│  │      // Workflow metadata                                                  │  │
│  │      __workflowStatus: "RUNNING",                                          │  │
│  │      __executionProgress: { completed: 3, total: 5 }                       │  │
│  │    }                                                                       │  │
│  │                                                                            │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Integration Modes

| Mode | Use Case | Connection | Behavior |
|------|----------|------------|----------|
| **Execution Mode** | Widget needs fresh data | WebSocket + Workflow Run | Execute workflow, widget receives real-time updates |
| **Subscription Mode** | Widget monitors ongoing workflow | WebSocket only | Attach to existing workflow instance |
| **Replay Mode** | Widget displays historical data | REST API | Fetch completed workflow's final context |
| **Interactive Mode** | Widget drives workflow inputs | Bidirectional WebSocket | Widget sends events, workflow responds |

---

## 4. Data Flow Design

### 4.1 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           WIDGET ↔ WORKFLOW DATA FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

  WIDGET (Frontend)               BRIDGE LAYER                    WORKFLOW (Backend)
  ═════════════════               ════════════                    ══════════════════

  ┌───────────────┐                                                                   
  │ DashboardWidget│                                                                   
  │    .jsx        │                                                                   
  └───────┬───────┘                                                                   
          │                                                                            
          │ 1. Widget mounts                                                          
          ▼                                                                            
  ┌───────────────┐    2. Establish connection     ┌───────────────────────────────┐   
  │ useWidgetWork │ ═══════════════════════════════► Widget-Workflow Bridge       │   
  │ flowConnection│    Socket.IO                   │ (New Backend Handler)         │   
  └───────┬───────┘                                 └───────────────┬───────────────┘   
          │                                                         │                  
          │ 3. Subscribe to workflow                               │                  
          │    { workflowID, widgetID,                             │                  
          │      mode: 'execute' | 'subscribe' }                   │                  
          │                                                         │                  
          ▼                                                         ▼                  
  ┌───────────────┐                                 ┌───────────────────────────────┐   
  │ WorkflowConn  │                                 │ 4. Create/Attach Instance     │   
  │ Context       │◄─────────────────────────────────  orchestrator.startWorkflow() │   
  │               │                                 │  OR                            │   
  │ Provides:     │                                 │  stateManager.getInstance()    │   
  │ • ctx         │                                 └───────────────┬───────────────┘   
  │ • variables   │                                                 │                  
  │ • nodeStatus  │                                                 │                  
  │ • actions     │                                                 ▼                  
  └───────┬───────┘                                 ┌───────────────────────────────┐   
          │                                         │ 5. Execute Nodes              │   
          │                                         │    TaskWorker                  │   
          │                                         │    - handler.execute()         │   
          │                                         └───────────────┬───────────────┘   
          │                                                         │                  
          │ 6. Real-time context updates                           │                  
          │    (on every node completion)                          │                  
          │                                                         │                  
          │    {                                                    │                  
          │      type: 'CONTEXT_UPDATE',                           ▼                  
          │      nodeID: '...',                     ┌───────────────────────────────┐   
          │      outputVariable: 'queryResult',    │ 7. Emit to Widget Room        │   
          │      value: { ... },                   │    socket.to(widgetID).emit() │   
          │      nodeStatus: 'completed'           └───────────────────────────────┘   
          │    }                                                                       
          ▼                                                                            
  ┌───────────────┐                                                                   
  │ Widget renders│                                                                   
  │ with live data│                                                                   
  │               │                                                                   
  │ Variables:    │                                                                   
  │ {{ctx.query   │                                                                   
  │   Result}}    │                                                                   
  └───────────────┘                                                                   
```

### 4.2 Context Synchronization Protocol

```typescript
// Message types for Widget ↔ Workflow communication

interface WidgetToWorkflowMessage {
  type: 
    | 'CONNECT'           // Initial connection
    | 'EXECUTE'           // Trigger workflow execution
    | 'SUBSCRIBE'         // Subscribe to existing instance
    | 'SEND_INPUT'        // Send interactive input
    | 'DISCONNECT';       // Clean disconnect
  
  payload: {
    workflowID?: string;
    instanceID?: string;
    inputParams?: Record<string, any>;
    interactiveData?: any;
  };
}

interface WorkflowToWidgetMessage {
  type:
    | 'CONNECTED'         // Connection established
    | 'CONTEXT_INITIAL'   // Full context snapshot
    | 'CONTEXT_UPDATE'    // Incremental update
    | 'NODE_STATUS'       // Node execution status
    | 'WORKFLOW_STATUS'   // Overall workflow status
    | 'ERROR'             // Error notification
    | 'DISCONNECTED';     // Clean disconnect
  
  payload: {
    instanceID?: string;
    context?: WorkflowContext;
    nodeID?: string;
    status?: string;
    outputVariable?: string;
    value?: any;
    error?: string;
  };
}
```

---

## 5. Workflow Context Exposure

### 5.1 Context Structure Available to Widgets

```typescript
interface WorkflowContext {
  // ═══════════════════════════════════════════════════════════
  // INPUT PARAMETERS (from workflow start)
  // ═══════════════════════════════════════════════════════════
  input: {
    [paramName: string]: any;
    // Example:
    // userId: "abc123",
    // dateRange: { start: "2026-01-01", end: "2026-01-31" },
    // filters: ["active", "premium"]
  };

  // ═══════════════════════════════════════════════════════════
  // NODE OUTPUTS (keyed by outputVariable name)
  // ═══════════════════════════════════════════════════════════
  // Each node's output is stored with its configured outputVariable
  
  // From DataQuery nodes:
  queryResult: {
    rows: Array<Record<string, any>>;
    rowCount: number;
    fields: Array<{ name: string; dataTypeID: number }>;
  };
  
  // From JavaScript nodes:
  scriptResult: any; // User-defined return value
  
  calculatedMetrics: {
    total: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
  };

  // ═══════════════════════════════════════════════════════════
  // NODE METADATA (prefixed with __ for internal use)
  // ═══════════════════════════════════════════════════════════
  __node_: {
    [nodeID: string]: {
      output: any;
      status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
      outputVariable: string;
      executedAt?: string;
      duration?: number;
    };
  };

  // ═══════════════════════════════════════════════════════════
  // WORKFLOW METADATA
  // ═══════════════════════════════════════════════════════════
  __workflow: {
    instanceID: string;
    workflowID: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    startedAt: string;
    completedAt?: string;
    progress: {
      completedNodes: number;
      totalNodes: number;
      currentNode?: string;
    };
  };

  // ═══════════════════════════════════════════════════════════
  // WIDGET-SPECIFIC CONTEXT (NEW)
  // ═══════════════════════════════════════════════════════════
  __widget: {
    widgetID: string;
    lastRefresh: string;
    interactiveState?: any; // For interactive widgets
  };
}
```

### 5.2 Variable Path Examples

| Widget Field | Variable Path | Resolved Value |
|--------------|---------------|----------------|
| Chart X-Axis | `{{ctx.queryResult.rows}}` | Array of objects |
| Chart Y Values | `{{ctx.queryResult.rows[*].value}}` | Extracted values |
| Text Content | `{{ctx.calculatedMetrics.total}}` | Number |
| Table Data | `{{ctx.scriptResult}}` | Array/Object |
| Dynamic URL | `{{ctx.input.baseUrl}}/{{ctx.reportId}}` | Interpolated string |
| Conditional Text | `{{ctx.calculatedMetrics.trend === 'up' ? '📈' : '📉'}}` | Expression result |

---

## 6. WebSocket Connection Design

### 6.1 Connection Lifecycle

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                        WEBSOCKET CONNECTION LIFECYCLE                               │
└────────────────────────────────────────────────────────────────────────────────────┘

  WIDGET MOUNT                         ACTIVE STATE                         UNMOUNT
  ════════════                         ════════════                         ════════
       │                                    │                                   │
       │ 1. Component mounts                │                                   │
       ▼                                    │                                   │
  ┌─────────────┐                           │                                   │
  │ useWidget   │                           │                                   │
  │ Workflow    │                           │                                   │
  │ Connection()│                           │                                   │
  └──────┬──────┘                           │                                   │
         │                                  │                                   │
         │ 2. socket.emit('widget_workflow_connect')                           │
         │    { widgetID, workflowID, mode }│                                   │
         │                                  │                                   │
         ▼                                  │                                   │
  ┌─────────────┐                           │                                   │
  │ CONNECTION  │                           │                                   │
  │ ESTABLISHING│                           │                                   │
  │ ...         │                           │                                   │
  └──────┬──────┘                           │                                   │
         │                                  │                                   │
         │ 3. Receive 'widget_workflow_connected'                              │
         │    { instanceID, initialContext }│                                   │
         │                                  │                                   │
         ▼                                  │                                   │
  ┌─────────────┐                           │                                   │
  │ CONNECTED   │                           │                                   │
  │             │◄──────────────────────────┤                                   │
  │ Listeners:  │     Events:               │                                   │
  │             │     • workflow_context_update                                │
  │ onContext   │     • workflow_node_update│                                   │
  │ Update()    │     • workflow_status_update                                 │
  │             │     • workflow_error      │                                   │
  │ onNode      │                           │                                   │
  │ Update()    │                           │                                   │
  │             │                           │                                   │
  │ onWorkflow  │                           │                                   │
  │ Complete()  │                           │                                   │
  └──────┬──────┘                           │                                   │
         │                                  │                                   │
         │ 4. Widget can send:              │                                   │
         │    • 'widget_send_input' (interactive mode)                         │
         │    • 'widget_refresh' (re-execute)                                  │
         │    • 'widget_disconnect'         │                                   │
         │                                  │                                   │
         │                                  │ 5. Cleanup                        │
         │                                  ├────────────────────────────────────►
         │                                  │    socket.emit('widget_workflow_disconnect')
         │                                  │                                   │
         └──────────────────────────────────┴───────────────────────────────────┘
```

### 6.2 Socket Event Definitions

**Frontend → Backend:**

```javascript
// 1. Connect widget to workflow
socket.emit('widget_workflow_connect', {
  widgetID: 'uuid',
  workflowID: 'uuid',
  mode: 'execute' | 'subscribe' | 'replay',
  inputParams: { ... },   // For execute mode
  instanceID: 'uuid',     // For subscribe/replay mode
});

// 2. Send interactive input
socket.emit('widget_send_input', {
  widgetID: 'uuid',
  instanceID: 'uuid',
  inputType: 'form_submission' | 'user_action' | 'filter_change',
  data: { ... },
});

// 3. Request refresh
socket.emit('widget_refresh', {
  widgetID: 'uuid',
  inputParams: { ... }, // Optional updated params
});

// 4. Disconnect
socket.emit('widget_workflow_disconnect', {
  widgetID: 'uuid',
  instanceID: 'uuid',
});
```

**Backend → Frontend:**

```javascript
// 1. Connection established
socket.emit('widget_workflow_connected', {
  widgetID: 'uuid',
  instanceID: 'uuid',
  workflowID: 'uuid',
  initialContext: { ... },
  workflowMeta: {
    title: 'Sales Dashboard Data',
    inputSchema: [...],
    outputSchema: [...],
  },
});

// 2. Context update (on every node completion)
socket.emit('widget_context_update', {
  widgetID: 'uuid',
  instanceID: 'uuid',
  update: {
    type: 'NODE_COMPLETE',
    nodeID: 'uuid',
    outputVariable: 'queryResult',
    value: { ... },
    contextSnapshot: { ... }, // Full context after update
  },
});

// 3. Workflow status change
socket.emit('widget_workflow_status', {
  widgetID: 'uuid',
  instanceID: 'uuid',
  status: 'COMPLETED',
  finalOutput: { ... },
});

// 4. Error notification
socket.emit('widget_workflow_error', {
  widgetID: 'uuid',
  instanceID: 'uuid',
  error: {
    code: 'NODE_EXECUTION_FAILED',
    nodeID: 'uuid',
    message: 'Database connection timeout',
    recoverable: true,
  },
});
```

---

## 7. Variable Access System

### 7.1 Variable Binding Configuration

When configuring a widget, users can bind any widget field to a workflow variable:

```typescript
interface WidgetDatasetFieldBinding {
  field: string;              // Widget field (e.g., 'xAxis', 'data', 'text')
  variablePath: string;       // Full path (e.g., 'ctx.queryResult.rows')
  transform?: {
    type: 'map' | 'filter' | 'reduce' | 'format' | 'custom';
    expression?: string;      // For custom transforms
    mapPath?: string;         // For map: '$.value'
    filterCondition?: string; // For filter: 'item.status === "active"'
  };
  fallback?: any;             // Default value if path not found
  refreshOn?: string[];       // Which outputVariables trigger refresh
}
```

### 7.2 Variable Explorer UI

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        VARIABLE EXPLORER (Widget Editor)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Selected Workflow: Sales Dashboard Pipeline                                    │
│  Instance Status: ● COMPLETED                                                   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 📁 ctx                                                                   │   │
│  │  ├── 📁 input                                                            │   │
│  │  │    ├── 📄 startDate: "2026-01-01"                                    │   │
│  │  │    ├── 📄 endDate: "2026-01-31"                                      │   │
│  │  │    └── 📄 region: "north"                                            │   │
│  │  │                                                                       │   │
│  │  ├── 📁 salesData (from: DataQuery Node)                                │   │
│  │  │    ├── 📁 rows [147 items]                                           │   │
│  │  │    │    ├── 📁 [0]                                                   │   │
│  │  │    │    │    ├── 📄 date: "2026-01-01"                              │   │
│  │  │    │    │    ├── 📄 amount: 15420.50                                │   │
│  │  │    │    │    └── 📄 product: "Widget Pro"                           │   │
│  │  │    │    └── ... 146 more                                             │   │
│  │  │    └── 📄 rowCount: 147                                              │   │
│  │  │                                                                       │   │
│  │  ├── 📁 analytics (from: JavaScript Node)                               │   │
│  │  │    ├── 📄 totalSales: 2345678.90                                     │   │
│  │  │    ├── 📄 averageDaily: 75667.38                                     │   │
│  │  │    ├── 📄 growthRate: 12.5                                           │   │
│  │  │    └── 📁 topProducts [5 items]                                      │   │
│  │  │                                                                       │   │
│  │  └── 📁 __workflow                                                       │   │
│  │       ├── 📄 status: "COMPLETED"                                        │   │
│  │       └── 📄 completedAt: "2026-01-18T10:30:00Z"                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  🔍 Search: [salesData.rows_________________]  [Insert Variable]               │
│                                                                                 │
│  Preview:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Path: ctx.salesData.rows                                                 │   │
│  │ Type: Array[147]                                                         │   │
│  │ Sample: [{"date":"2026-01-01","amount":15420.5,"product":"Widget Pro"}]│   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Variable Resolution Engine (workerSDK Extension)

```javascript
// Extended widget variable resolver for workflow-backed bindings

/**
 * Resolves a variable path from workflow context for widget consumption
 * Enhanced with support for:
 * - Array indexing with wildcards (rows[*].value)
 * - Null-safe navigation (data?.nested?.value)
 * - Default values (data.value ?? 'N/A')
 * - Transforms (data.amount | formatCurrency)
 */
function resolveWidgetVariable(context, bindingConfig) {
  const { variablePath, transform, fallback } = bindingConfig;
  
  let value = navigatePath(context, variablePath);
  
  if (value === undefined && fallback !== undefined) {
    return fallback;
  }
  
  if (transform) {
    value = applyTransform(value, transform);
  }
  
  return value;
}

/**
 * Navigate context using enhanced path notation
 * Supports: ctx.data.rows[*].value, ctx.input?.param
 */
function navigatePath(context, path) {
  // Implementation with wildcard and null-safe support
}

/**
 * Apply transforms to extracted values
 */
function applyTransform(value, transform) {
  switch (transform.type) {
    case 'map':
      return Array.isArray(value) 
        ? value.map(item => get(item, transform.mapPath))
        : value;
    case 'filter':
      return Array.isArray(value)
        ? value.filter(item => evalCondition(item, transform.filterCondition))
        : value;
    case 'format':
      return formatValue(value, transform.formatType);
    case 'custom':
      return evalCustomExpression(value, transform.expression);
  }
}
```

---

## 8. Implementation Roadmap

### 8.1 Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          IMPLEMENTATION PHASES                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

  Phase 1                    Phase 2                    Phase 3
  Foundation                 Real-time                  Advanced
  (2 weeks)                  (2 weeks)                  (2 weeks)
  ═══════════════════════    ═══════════════════════   ═══════════════════════
  
  □ Database schema          □ Widget-Workflow          □ Variable Explorer UI
    updates                    Socket Bridge            
                                                        □ Advanced transforms
  □ Enhanced workflowConfig  □ Context streaming        
                                                        □ Interactive widgets
  □ Variable path resolver   □ Incremental updates      
                             for widgets                □ Multi-workflow
  □ Basic context exposure                               composition
                             □ Connection lifecycle     
  □ Frontend hooks update    management                □ Caching & optimization
                             
                             □ Error handling &        □ Testing infrastructure
                               reconnection
```

### 8.2 Phase 1: Foundation (Week 1-2)

**Backend Tasks:**

| Task | File(s) | Description |
|------|---------|-------------|
| 1.1 | `schema.prisma` | Extend `tblWidgets.workflowConfig` schema |
| 1.2 | `widget.service.js` | Add `getWorkflowContextSchema()` method |
| 1.3 | `workerSDK.js` | Add `resolveWidgetVariable()` and path navigation |
| 1.4 | `stateManager.js` | Add `getContextSnapshot()` for widgets |
| 1.5 | New: `widgetBridge.js` | Create Widget-Workflow Bridge module |

**Frontend Tasks:**

| Task | File(s) | Description |
|------|---------|-------------|
| 1.6 | `useWidgetWorkflowData.jsx` | Enhance with context awareness |
| 1.7 | `widgetDatasetField.jsx` | Add variable path editor |
| 1.8 | New: `variablePathPicker.jsx` | Create variable explorer component |
| 1.9 | `widgetsContext.jsx` | Add workflow context state |

### 8.3 Phase 2: Real-time Bridge (Week 3-4)

**Socket Infrastructure:**

```javascript
// New file: apps/backend/modules/widget/widget.socket.controller.js

const widgetSocketController = {
  
  /**
   * Handle widget connecting to workflow
   */
  onWidgetWorkflowConnect: async ({ socket, widgetID, workflowID, mode, inputParams }) => {
    // 1. Join widget-specific room
    await socket.join(`widget:${widgetID}`);
    
    // 2. Based on mode, start or attach to workflow
    let instanceID, initialContext;
    
    if (mode === 'execute') {
      const result = await orchestrator.startWorkflow({
        workflowID,
        tenantID: socket.tenantID,
        inputParams,
        widgetID, // Tag instance with widgetID
      });
      instanceID = result.instanceID;
      initialContext = { input: inputParams };
    } else if (mode === 'subscribe') {
      // Attach to existing instance
    }
    
    // 3. Register widget for context updates
    widgetBridge.registerWidget(widgetID, instanceID, socket);
    
    // 4. Send connection confirmation
    socket.emit('widget_workflow_connected', {
      widgetID,
      instanceID,
      initialContext,
    });
  },
  
  /**
   * Called by orchestrator when context updates
   */
  onContextUpdate: (instanceID, update) => {
    // Find all widgets subscribed to this instance
    const widgets = widgetBridge.getWidgetsForInstance(instanceID);
    
    for (const widgetID of widgets) {
      io.to(`widget:${widgetID}`).emit('widget_context_update', {
        widgetID,
        instanceID,
        update,
      });
    }
  },
};
```

### 8.4 Phase 3: Advanced Features (Week 5-6)

- Variable Explorer UI with tree navigation
- Transform pipeline editor
- Interactive widget support (forms that feed workflow inputs)
- Multi-workflow composition (widget consuming from multiple workflows)
- Caching layer for frequently accessed contexts
- Testing and validation tools

---

## 9. API Contract Changes

### 9.1 REST API Changes

**GET /widgets/:widgetID**
```json
{
  "widgetID": "uuid",
  "widgetTitle": "Sales Dashboard",
  "widgetType": "bar",
  "workflowID": "uuid",
  "workflowConfig": {
    "mode": "execute",
    "inputBindings": {
      "startDate": "{{widget.dateRange.start}}",
      "endDate": "{{widget.dateRange.end}}"
    },
    "datasetFields": {
      "xAxis": {
        "variablePath": "ctx.salesData.rows[*].date",
        "transform": { "type": "format", "formatType": "date:short" }
      },
      "yAxis": {
        "variablePath": "ctx.salesData.rows[*].amount",
        "transform": { "type": "map", "mapPath": "$.amount" }
      }
    },
    "refreshOn": ["salesData", "analytics"],
    "autoRefreshInterval": 60000
  },
  "workflow": {
    "workflowID": "uuid",
    "title": "Sales Data Pipeline",
    "workflowOptions": {
      "args": [
        { "key": "startDate", "type": "date" },
        { "key": "endDate", "type": "date" }
      ]
    }
  }
}
```

**GET /widgets/:widgetID/workflow-schema**
```json
{
  "inputs": [
    { "key": "startDate", "type": "date", "required": true },
    { "key": "endDate", "type": "date", "required": true }
  ],
  "outputs": {
    "salesData": {
      "type": "object",
      "nodeType": "dataQuery",
      "schema": {
        "rows": { "type": "array", "items": { "type": "object" } },
        "rowCount": { "type": "number" }
      }
    },
    "analytics": {
      "type": "object",
      "nodeType": "javascript",
      "schema": {
        "totalSales": { "type": "number" },
        "growthRate": { "type": "number" }
      }
    }
  }
}
```

### 9.2 WebSocket Events

See [Section 6.2](#62-socket-event-definitions) for complete event definitions.

---

## 10. Database Schema Changes

### 10.1 Enhanced workflowConfig Structure

```prisma
// No schema changes needed - workflowConfig is already Json type
// Update the expected JSON structure:

model tblWidgets {
  workflowConfig    Json?
  // Enhanced structure:
  // {
  //   "mode": "execute" | "subscribe" | "replay",
  //   "inputBindings": {
  //     "param1": "static_value" | "{{widget.field}}"
  //   },
  //   "datasetFields": {
  //     "xAxis": {
  //       "variablePath": "ctx.path.to.data",
  //       "transform": { ... },
  //       "fallback": any,
  //       "refreshOn": ["outputVar1"]
  //     }
  //   },
  //   "connectionConfig": {
  //     "autoReconnect": true,
  //     "keepAliveInterval": 30000
  //   }
  // }
}
```

### 10.2 Widget-Workflow Session Tracking (New Table)

```prisma
model tblWidgetWorkflowSessions {
  sessionID         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  widgetID          String    @db.Uuid
  instanceID        String    @db.Uuid
  status            String    @db.VarChar  // 'active', 'completed', 'disconnected'
  connectedAt       DateTime  @default(now()) @db.Timestamptz(6)
  disconnectedAt    DateTime? @db.Timestamptz(6)
  lastActivityAt    DateTime  @default(now()) @db.Timestamptz(6)
  socketID          String?   @db.VarChar
  
  tblWidgets        tblWidgets @relation(fields: [widgetID], references: [widgetID])
  tblWorkflowInstances tblWorkflowInstances @relation(fields: [instanceID], references: [instanceID])
  
  @@index([widgetID])
  @@index([instanceID])
  @@index([status])
}
```

---

## 11. Risk Analysis

### 11.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebSocket connection instability | Medium | High | Auto-reconnect, fallback to polling |
| Context size exceeds memory | Low | High | Implement context pruning, pagination |
| Race conditions in updates | Medium | Medium | Optimistic locking, version tracking |
| Security: unauthorized context access | Low | Critical | Token validation per socket, tenant isolation |

### 11.2 Performance Considerations

```
Context Update Frequency Analysis
═════════════════════════════════

Scenario: Widget bound to workflow with 10 nodes

Current Flow (Polling):
  Widget → REST → Poll every 2s until complete
  Network calls: ~15 (for 30s workflow)
  Latency: Up to 2s per update

Proposed Flow (WebSocket):
  Widget → Socket → Real-time updates
  Network calls: 1 (initial) + 10 (node updates)
  Latency: <100ms per update

Optimization Strategies:
  1. Debounce rapid updates (batch within 50ms window)
  2. Delta transmission (only changed values)
  3. Compression for large contexts
  4. Lazy loading for deep context trees
```

### 11.3 Backward Compatibility

- Existing widgets with simple workflow bindings continue to work
- New features are opt-in via enhanced workflowConfig
- Polling fallback if WebSocket unavailable
- Migration script for converting legacy datasetFields to new format

---

## Summary

This integration transforms widgets from passive data displayers into **active workflow consumers** with:

1. **Full Context Access** - Widgets can bind to any workflow variable
2. **Real-time Updates** - WebSocket streams context changes as they happen
3. **Bidirectional Communication** - Widgets can send inputs, trigger refreshes
4. **Advanced Binding** - Transforms, fallbacks, conditional rendering
5. **Visual Configuration** - Variable Explorer for point-and-click binding

The implementation follows a phased approach, starting with foundational context exposure and building up to advanced interactive features.
