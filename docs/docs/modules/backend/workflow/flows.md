---
id: flows
title: Execution Flows
sidebar_label: Logic Flows
sidebar_position: 3
description: Visual breakdown of complex logic flows in the Workflow module.
---

# Logic Flows

## Orchestrator State Machine

The following diagram illustrates the lifecycle of a single workflow execution step.

```mermaid
flowchart TB
    Start(["Task Result Arrives"]) --> Load{"Instance Exists?"}
    Load -- No --> Error(["Log Error & Stop"])
    Load -- Yes --> UpdateCtx["Update Context Data"]
    
    UpdateCtx --> EmitSocket["Emit Socket Event"]
    EmitSocket --> CheckEnd{"Is End Node?"}
    
    CheckEnd -- Yes --> Complete["Mark Instance COMPLETED"]
    Complete --> EmitFinal["Emit WORKFLOW_STATUS_UPDATE"]
    EmitFinal --> End(["Stop"])
    
    CheckEnd -- No --> Scheduler["Calculate Next Nodes"]
    Scheduler --> Loop{"For Each Next Node"}
    
    Loop --> Queue["Add Job to Queue"]
    Queue --> Loop
    Loop -- Done --> End
```

## Test Run vs Normal Run

How the Orchestrator distinguishes between saved workflows and test runs.

```mermaid
sequenceDiagram
    participant Orch as Orchestrator
    participant Context as Instance Context
    participant DB as Database
    
    Note over Orch: handleTaskResult()
    
    Orch->>Context: Check instance.isTest OR context.__isTestRun
    
    alt is Normal Run
        Orch->>DB: Query `tblWorkflowNodes` for next steps
        DB-->>Orch: Return Downstream Nodes
    else is Test Run
        Orch->>Context: Read `__workflowDefinition`
        Note right of Context: Uses in-memory graph passed at start
        Context-->>Orch: Return Nodes from Memory
    end
    
    Orch->>Orch: Queue Next Jobs
```

## Real-time Data Streaming

How data flows from the Worker to the Frontend Dashboard.

```mermaid
sequenceDiagram
    participant Worker
    participant Bridge as WidgetWorkflowBridge
    participant Socket as Socket.io
    participant Dashboard as Frontend Widget

    Worker->>Bridge: emitContextUpdate(nodeID, output)
    Bridge->>Bridge: Filter for Subscribed Widgets
    Bridge->>Socket: Emit WIDGET_DATA_UPDATE
    Socket->>Dashboard: Push JSON Payload
    
    Note right of Dashboard: Widget re-renders with new data
```
