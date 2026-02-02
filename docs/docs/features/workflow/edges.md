---
sidebar_position: 4
---

# 🔗 Edge Reference

Edges define the causal and data flow relationships between nodes in the workflow graph. In Jet Admin, edges are more than just visual lines; they carry semantic meaning regarding execution paths (Success, Error, Branching).

## Edge Types

Jet Admin supports 4 visual styles of edges. Under the hood, they are all managed by the `DeletableEdge` wrapper component which adds interactive functionality.

| Edge Type | Internal Value | Description | Best Use Case |
|-----------|----------------|-------------|---------------|
| **Bezier** | `default` | A smooth cubic bezier curve. | Standard, default connections. Natural look. |
| **Straight** | `straight` | A direct linear connection. | Simple, short-distance connections. |
| **Step** | `step` | Orthogonal lines with sharp 90-degree turns. | "Circuit-board" style flow diagrams. |
| **Smooth Step**| `smoothstep` | Orthogonal lines with rounded corners. | Clean, organized layouts; standard for flowcharts. |

## Edge Handles & semantics

Every edge connects a **Source Handle** (upstream node) to a **Target Handle** (downstream node). The *Source Handle ID* is critical for the Orchestrator's decision-making process.

### 🟢 Success / Default Handle
- **ID**: `success` (or sometimes `output` or `default`)
- **Color**: Green
- **Position**: Bottom Center
- **Semantics**: "Execute this path if the node completes successfully."

### 🔴 Error Handle
- **ID**: `error`
- **Color**: Red
- **Position**: Bottom Right
- **Semantics**: "Execute this path if the node throws an uncaught error."
- **Availability**: Available on nodes that support specific error handling logic (JavaScript, Data Query).
- **Configuration**: Enabled when `errorHandling` is set to `continue` or similar strategies.

### 🔀 Branch Handles (Conditional)
- **ID**: Custom string (e.g., `branch_1`, `true_path`)
- **Color**: Yellow/Variable
- **Position**: Bottom (Multiple)
- **Semantics**: Used exclusively by the **Condition Node**. The node handler returns the ID of the matched handle, and the Orchestrator follows ONLY the edge connected to that specific handle.

## Data Structure

In the database/API, an Edge is represented as follows:

```json
{
  "id": "e1-2",
  "source": "node_1",
  "target": "node_2",
  "sourceHandle": "success", 
  "targetHandle": null,
  "type": "smoothstep",
  "animated": false,
  "style": { "stroke": "#555" }
}
```

- **`sourceHandle`**: This property tells the DAG Scheduler which path to follow. If `node_1` returns `nextHandle: 'error'`, the scheduler looks for an edge where `source === 'node_1'` AND `sourceHandle === 'error'`.

## Interaction Features

All edges in the editor support:
- **Selection**: Click to select (highlighted blue).
- **Deletion**: Hovering shows a delete (×) button (via `DeletableEdge` component).
- **Animation**: Active paths can be animated (marching ants effect) during execution visualization.
