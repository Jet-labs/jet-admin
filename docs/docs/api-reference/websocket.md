---
sidebar_position: 100
title: WebSocket API
description: Real-time API reference for Jet Admin
---

# WebSocket API

The Jet Admin backend provides a real-time WebSocket API using [Socket.IO](https://socket.io/). This API is used for features that require instant updates, such as:

- **AI Chat**: Real-time communication with the AI assistant.
- **Workflow Execution**: Streaming updates on workflow node execution and status.
- **Widget-Workflow Bridge**: Interactive visualization and control of workflows from the dashboard.
- **Monitoring**: System logs and metrics (admin only).

:::info AsyncAPI Specification
The complete WebSocket API is documented using AsyncAPI 2.6  specification. Download the specification file: **[socket-events.yaml](/specs/socket-events.yaml)**
:::

## Connection

Connect to the WebSocket server using a Socket.IO client.

### Base URL
\`\`\`javascript
const socket = io('http://localhost:3000');
// or for monitoring namespace
const monitorSocket = io('http://localhost:3000/monitor');
\`\`\`

### Authentication
Authentication is handled via the handshake. Ensure you pass the `Authorization` header or query parameter as required by the implementation (typically a Bearer token or API key).

---

## AI Module Events

### `ai_chat_room_join` (Emit)
Join a chat room to start or resume a conversation.

**Payload:**
\`\`\`json
{
  "firebaseID": "user-firebase-uid"
}
\`\`\`

### `ai_chat_room_id` (Receive)
Confirmation of joining the room.

**Payload:**
\`\`\`json
{
  "chatRoomID": "uuid-string"
}
\`\`\`

### `ai_chat_user_message` (Emit)
Send a message to the AI.

**Payload:**
\`\`\`json
{
  "message": {
    "text": "Show me sales for last month",
    "action": "test" // or 'approve', 'reject'
  },
  "chatRoomID": "uuid-string",
  "firebaseID": "user-firebase-uid",
  "tenantID": "tenant-uuid"
}
\`\`\`

### `ai_chat_bot_message` (Receive)
Receive a response from the AI.

**Payload:**
\`\`\`json
{
  "text": "Here is the sales data..."
}
\`\`\`

---

## Workflow Module Events

### `workflow_run_join` (Emit)
Subscribe to updates for a specific workflow run.

**Payload:**
\`\`\`json
{
  "runId": "uuid-string",
  "firebaseID": "user-firebase-uid"
}
\`\`\`

### `workflow_node_update` (Receive)
Triggered when a workflow node completes execution.

**Payload:**
\`\`\`json
{
  "instanceID": "uuid-string",
  "nodeID": "string",
  "status": "success" | "failed",
  "output": { ... },
  "error": "Error message if failed"
}
\`\`\`

### `workflow_status_update` (Receive)
Triggered when the workflow finishes.

**Payload:**
\`\`\`json
{
  "instanceID": "uuid-string",
  "status": "COMPLETED" | "FAILED",
  "contextData": { ... }
}
\`\`\`

---

## Widget Interface (Widget-Workflow Bridge)

Used for widgets that interact directly with workflows.

### `widget_workflow_connect` (Emit)
Connect a widget to a workflow instance.

**Payload:**
\`\`\`json
{
  "widgetID": "uuid",
  "workflowID": "uuid",
  "mode": "execute" | "subscribe" | "replay",
  "inputParams": { ... },
  "widgetType": "bar" | "line" | ...
}
\`\`\`

### `widget_workflow_connected` (Receive)
Confirmation of connection.

**Payload:**
\`\`\`json
{
  "widgetID": "uuid",
  "instanceID": "uuid",
  "mode": "execute",
  "initialContext": { ... }
}
\`\`\`

### `widget_send_input` (Emit)
Send user input (e.g., form submit) from the widget to the workflow.

**Payload:**
\`\`\`json
{
  "widgetID": "uuid",
  "inputType": "form_submit",
  "data": { ... }
}
\`\`\`

### `widget_input_received` (Receive)
Acknowledgment of input.

---

## Monitoring (Namespace `/monitor`)

### `log` (Receive)
Stream of system logs (requires admin permissions).

**Payload:**
\`\`\`json
{
  "routingKey": "log.info",
  "content": { ... },
  "timestamp": 1234567890
}
\`\`\`
