---
sidebar_position: 4
title: Creating a Workflow Node
description: How to add a new node type to the workflow builder
---

# Creating a Custom Workflow Node

This guide shows how to add a new node type to Jet Admin's visual workflow builder and execution engine (e.g., an Email Node, Webhook Node, or AI Node).

## Overview

A Workflow Node requires two parts:
1. **Frontend Component**: A React Flow node UI and configuration panel in `@jet-admin/workflow-nodes`.
2. **Backend Executor**: The logic that runs inside the pg-boss worker in `apps/backend/modules/workflow/handlers/`.

---

## Step 1: Define and Register the Frontend Node

In `packages/workflow-nodes/src/nodes/`, create the visual representation of your node on the DAG canvas.

```jsx
// packages/workflow-nodes/src/nodes/EmailNode.jsx

import React from 'react';
import { Handle, Position } from 'reactflow';

export function EmailNode({ data, selected }) {
  return (
    <div className={`workflow-node ${selected ? 'selected' : ''}`}>
      {/* Input Handle */}
      <Handle type="target" position={Position.Top} />
      
      <div className="node-header">
        <span>📧 Send Email</span>
      </div>
      
      <div className="node-body">
        <p className="text-sm text-gray-500">
          {data.to || 'No recipient configured'}
        </p>
      </div>
      
      {/* Output Handle */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

### Map the Node

In `packages/workflow-nodes/src/map.js`, register the node type, schema, and its configuration UI form.

```javascript
// packages/workflow-nodes/src/map.js
import { EmailNode } from './nodes/EmailNode';
import { EmailNodeConfigurator } from './configs/EmailNodeConfigurator';

export const WORKFLOW_NODE_MAP = {
  // ... existing nodes
  email: {
    label: 'Send Email',
    value: 'email',
    component: EmailNode,
    configurator: EmailNodeConfigurator, // The right-sidebar form
    defaultValue: {
      title: "Send Email",
      to: "",
      subject: "",
      body: ""
    },
    // Used to generate the property panel
    schema: {
      type: "object",
      properties: {
        to: { type: "string", title: "Recipient Email" },
        subject: { type: "string", title: "Subject" },
        body: { type: "string", title: "Body" }
      }
    }
  }
};
```

---

## Step 2: Implement the Backend Executor

When the Orchestrator reaches your node, it passes the job to a worker. The worker looks up the handler by the node's type.

Create `apps/backend/modules/workflow/handlers/emailHandler.js`:

```javascript
// apps/backend/modules/workflow/handlers/emailHandler.js

const nodemailer = require('nodemailer');
const { resolveTemplate } = require('@jet-admin/expression-engine');

async function execute({ nodeConfig, context, isTestRun }) {
  // 1. Evaluate template bindings safely
  const to = await resolveTemplate(nodeConfig.to, context, { mode: 'safe-path' });
  const subject = await resolveTemplate(nodeConfig.subject, context, { mode: 'safe-path' });
  const body = await resolveTemplate(nodeConfig.body, context, { mode: 'safe-path' });
  
  if (isTestRun) {
    console.log(`[TEST RUN] Would send email to ${to}`);
    return { status: 'success', output: { simulated: true, to } };
  }

  // 2. Perform the action
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    // ... auth config
  });
  
  try {
    await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text: body });

    // 3. Return the result to be appended to the workflow context log
    return {
      status: 'success',
      output: { deliveredTo: to, timestamp: new Date().toISOString() }
    };
  } catch (error) {
    return {
      status: 'error',
      output: { message: error.message }
    };
  }
}

module.exports = { execute };
```

---

## Step 3: Register the Handler

Add your handler to the main registry so the worker knows how to process jobs of type `email`.

```javascript
// apps/backend/modules/workflow/handlers/index.js

const emailHandler = require('./emailHandler');

const handlers = {
  // ... existing handlers
  email: emailHandler,
};

function getHandler(nodeType) {
  const handler = handlers[nodeType];
  if (!handler) throw new Error(`No handler found for node type: ${nodeType}`);
  return handler;
}

module.exports = { handlers, getHandler };
```

**Note:** You must also register the handler in the worker process registry (`apps/backend/modules/workflow/workers/handlers/index.js`) if it uses a separate worker pool.

---

## Best Practices

- **Context Isolation**: Do not modify the `context` object directly inside your handler. Return an `output` object; the Orchestrator will append it to the context log under the node's ID.
- **Template Resolution**: Always pass user-configured string fields through the `expression-engine` to ensure `{{bindings}}` are evaluated against upstream node outputs before you use them.
- **Test Mode**: Check `isTestRun`. If true, consider mocking the action (like sending an email or charging a credit card) or interacting with a sandbox environment.
- **Error Boundaries**: Catch exceptions and return `{ status: 'error', output: ... }` rather than letting the Node.js process crash. The Orchestrator handles retry limits based on the node's definition.
