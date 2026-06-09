---
id: realtime
title: Real-Time & Collaboration
sidebar_label: Real-Time Architecture
sidebar_position: 10
description: How Socket.IO powers real-time updates and collaboration.
---

# Real-Time & Collaboration

Jet Admin is designed as a real-time, event-driven platform. Rather than forcing the client to continuously poll the server for updates (like checking the status of a long-running workflow), Jet Admin utilizes WebSockets via **Socket.IO**.

## Socket.IO Architecture

Socket.IO provides a bidirectional, low-latency communication channel between the React frontend and the Express backend.

### Initialization & Authentication
1. When the frontend application boots, it initializes a Socket.IO client connection.
2. The initial handshake includes authentication tokens (e.g., JWT) to verify the user.
3. Once authenticated, the backend registers the socket connection.

### Namespaces and Rooms
To ensure messages are only sent to the relevant clients, Jet Admin heavily utilizes Socket.IO's "Rooms" concept.
- **Tenant Rooms:** Clients join a room specific to their `tenantID`. Global tenant updates (like role changes) are broadcast here.
- **App/Page Rooms:** When a user opens an App or Page, their socket joins a specific room (e.g., `room:app:123:page:456`). Edits to the page layout are broadcast to this room.
- **Workflow Instance Rooms:** When a workflow is triggered, the orchestrator creates a room for that specific instance (`room:workflow_instance:789`). The frontend joins this room to listen for node-by-node execution progress.

## Events & Payloads

Communication happens via strongly typed events.

### Server-to-Client Events (Emits)
The backend pushes data to the frontend for various reasons:
- `WORKFLOW_NODE_UPDATE`: Emitted by the Workflow Orchestrator as each node finishes. Payload includes `nodeID`, `status`, and the latest `contextData`.
- `WORKFLOW_STATUS_UPDATE`: Emitted when the entire instance completes or fails.
- `WIDGET_DATA_UPDATE`: Emitted if a backend listener (e.g., a Webhook or SSE source) receives new data meant for a live widget.

### Client-to-Client / State Mutations
When the frontend receives a socket event, the `useSocketStore` or specific bridge controllers (like `widgetWorkflowBridge`) intercept it.
1. The event payload is parsed.
2. The corresponding Zustand state slice is updated (e.g., updating a workflow progress bar).
3. React reactively re-renders the affected UI components instantly.

## Collaboration & Optimistic Updates

Because Jet Admin is a builder platform, multiple developers might edit an App simultaneously.

### Presence & Conflict
*[VERIFY: Standard implementation assumes last-write-wins unless a specific CRDT or locking mechanism is implemented.]*
Layout and configuration edits made by one user are typically debounced and sent via HTTP PUT/PATCH requests. Upon successful save, the backend emits a socket event to the Page room. Other connected clients receive the event and their Zustand store updates to reflect the new widget position or property.

### Optimistic UI
When a user drags a widget, the frontend updates the UI *optimistically* (immediately) to provide a snappy UX. If the underlying HTTP save request fails, the frontend rolls back the widget to its previous state.
