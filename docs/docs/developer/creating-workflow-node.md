---
sidebar_position: 4
title: Creating a Workflow Node
description: How to add a new node type to the workflow builder
---

# Creating a Custom Workflow Node

This guide shows how to add a new node type to the visual workflow builder (e.g., an Email Node, Webhook Node, or AI Node).

## Overview

Workflow nodes consist of:

1. **Frontend Component**: React Flow node UI (`packages/workflow-nodes/`)
2. **Backend Executor**: Node processing logic (`apps/backend/modules/workflow/`)

## Step 1: Create the Node Component

```jsx
// packages/workflow-nodes/src/nodes/EmailNode.jsx

import React from 'react';
import { Handle, Position } from 'reactflow';
import { EmailIcon } from '@heroicons/react/24/outline';

export function EmailNode({ data, selected }) {
  return (
    <div className={`workflow-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <div className="node-header">
        <EmailIcon className="node-icon" />
        <span>Send Email</span>
      </div>
      
      <div className="node-body">
        <p className="text-sm text-gray-500">
          {data.to || 'No recipient configured'}
        </p>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Node type metadata
EmailNode.nodeType = 'email';
EmailNode.displayName = 'Send Email';
EmailNode.category = 'integrations';
EmailNode.defaultData = {
  to: '',
  subject: '',
  body: ''
};
```

Register the node:

```javascript
// packages/workflow-nodes/src/index.js
export { EmailNode } from './nodes/EmailNode';

export const NODE_TYPES = {
  // ... existing
  email: EmailNode
};
```

## Step 2: Create Node Config Panel

For the sidebar that appears when a node is selected:

```jsx
// packages/workflow-nodes/src/configs/EmailNodeConfig.jsx

export function EmailNodeConfig({ data, onChange }) {
  return (
    <div className="node-config">
      <label>To (Email)</label>
      <input
        type="email"
        value={data.to}
        onChange={(e) => onChange({ ...data, to: e.target.value })}
        placeholder="recipient@example.com"
      />
      
      <label>Subject</label>
      <input
        type="text"
        value={data.subject}
        onChange={(e) => onChange({ ...data, subject: e.target.value })}
        placeholder="Email subject"
      />
      
      <label>Body</label>
      <textarea
        value={data.body}
        onChange={(e) => onChange({ ...data, body: e.target.value })}
        placeholder="Email body (supports {{ variables }})"
        rows={5}
      />
    </div>
  );
}
```

## Step 3: Implement Backend Executor

```javascript
// apps/backend/modules/workflow/nodeExecutors/email.executor.js

const nodemailer = require('nodemailer');

async function executeEmailNode(nodeData, context) {
  const { to, subject, body } = nodeData;
  
  // Replace template variables
  const processedBody = body.replace(
    /\{\{(\w+)\}\}/g, 
    (_, key) => context[key] || ''
  );
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html: processedBody
  });
  
  return {
    success: true,
    sentTo: to,
    timestamp: new Date().toISOString()
  };
}

module.exports = { executeEmailNode };
```

Register the executor:

```javascript
// apps/backend/modules/workflow/nodeExecutors/index.js

const { executeEmailNode } = require('./email.executor');

const NODE_EXECUTORS = {
  // ... existing
  email: executeEmailNode
};

async function executeNode(type, nodeData, context) {
  const executor = NODE_EXECUTORS[type];
  if (!executor) throw new Error(`Unknown node type: ${type}`);
  return executor(nodeData, context);
}

module.exports = { executeNode, NODE_EXECUTORS };
```

## Step 4: Add Node to Palette

Register in the frontend node palette:

```javascript
// apps/frontend/src/constants.js

export const WORKFLOW_NODE_PALETTE = [
  // ... existing categories
  {
    category: 'Integrations',
    nodes: [
      { type: 'email', label: 'Send Email', icon: 'EmailIcon' },
      { type: 'webhook', label: 'Webhook', icon: 'WebhookIcon' }
    ]
  }
];
```

## Node Executor Interface

All executors receive:

```javascript
async function executeNode(nodeData, context) {
  // nodeData: { ...user configuration from React Flow node }
  // context: { ...accumulated data from previous nodes }
  
  // Return value is merged into context for next nodes
  return { outputKey: 'value' };
}
```

## Best Practices

- **Validation**: Validate required fields before execution
- **Error Messages**: Provide clear messages on failure
- **Idempotency**: Handle re-runs gracefully where possible
- **Secrets**: Never log or expose API keys/passwords
- **Testing**: Add both component tests and executor unit tests
