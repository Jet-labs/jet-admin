---
id: widgets-overview
title: Widgets - Complete Guide
sidebar_label: Overview
sidebar_position: 1
description: Complete guide to Widgets in Jet Admin. Widget types, configuration options, data binding, and every setting explained.
---

# Widgets - Complete Guide

<div align="center">

### 📊 Data Visualization Components

**Charts · Tables · Text · Configuration · Data Binding**

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Widget Types](#widget-types)
- [Creating a Widget](#creating-a-widget)
- [Widget Configuration](#widget-configuration)
- [Data Binding](#data-binding)
- [Chart Widgets](#chart-widgets)
- [Table Widgets](#table-widgets)
- [Advanced Features](#advanced-features)

---

## Overview

**Widgets** are visual components that display data on dashboards. They connect to queries or workflows and present results in various formats.

### Key Features

- ✅ **Multiple Widget Types** - Charts, tables, text, custom
- ✅ **Data Binding** - Connect to queries or workflows
- ✅ **Real-time Updates** - WebSocket-based refresh
- ✅ **Custom Styling** - Colors, sizes, layouts
- ✅ **Parameter Mapping** - Dynamic data filtering
- ✅ **Auto-refresh** - Scheduled data updates

### Widget Types

| Type | Purpose | Use Case |
|------|---------|----------|
| **Vega-Lite Chart** | Data visualization | Bar, line, pie charts |
| **Vega Chart** | Advanced visualization | Complex custom charts |
| **Data Table** | Tabular data | Lists, grids, reports |
| **Text** | Static/dynamic text | Labels, descriptions |
| **Button** | User actions | Triggers, forms |

---

## Widget Types

### 1. Vega-Lite Chart

**Purpose:** Create charts using Vega-Lite grammar of graphics.

**Chart Types:**
- Bar Chart
- Line Chart
- Area Chart
- Pie Chart
- Scatter Plot
- Bubble Chart

**Configuration:**
- Vega-Lite specification (JSON)
- Data binding to query/workflow
- Visual customization options

### 2. Vega Chart

**Purpose:** Advanced visualizations using Vega (lower-level than Vega-Lite).

**Use Cases:**
- Custom chart types
- Complex multi-view displays
- Interactive visualizations

**Configuration:**
- Vega specification (JSON)
- Advanced rendering options

### 3. Data Table

**Purpose:** Display tabular data with sorting, filtering, pagination.

**Features:**
- Column sorting
- Row pagination
- Search/filter
- Column visibility
- Export options

### 4. Text Widget

**Purpose:** Display static or dynamic text content.

**Use Cases:**
- Dashboard titles
- Descriptions
- KPI displays
- Markdown content

### 5. Button Widget

**Purpose:** Trigger actions or workflows.

**Use Cases:**
- Form submissions
- Workflow triggers
- Data refresh
- Navigation

---

## Creating a Widget

### Step-by-Step Guide

1. **Navigate** to Dashboards or Widgets section
2. **Click** "Create Widget" or drag from widget palette
3. **Select** widget type
4. **Configure** data source
5. **Map** fields
6. **Customize** appearance
7. **Save** widget

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Widget Title** | String | ✅ Yes | Widget name |
| **Widget Type** | String | ✅ Yes | Type of widget |
| **Data Source** | String | ✅ Yes | Query or workflow |

---

## Widget Configuration

### General Configuration

#### Widget Title

**Purpose:** Identify widget in dashboard.

**Validation:**
- Required: Yes
- Max Length: 255 characters

#### Widget Type

**Options:**
- `vega-lite` - Vega-Lite charts
- `vega` - Vega charts
- `table` - Data tables
- `text` - Text content
- `button` - Action buttons

### Data Source Configuration

#### Source Type

**Options:**

| Source | Description | Use Case |
|--------|-------------|----------|
| **Data Query** | Execute saved query | Simple data fetch |
| **Workflow** | Execute workflow | Complex logic, transformations |

#### Query/Workflow Selection

**Configuration:**
```json
{
  "dataSourceType": "query",
  "dataSourceId": "query-uuid-here"
}
```

**Or:**
```json
{
  "dataSourceType": "workflow",
  "dataSourceId": "workflow-uuid-here"
}
```

### Parameter Mapping

**Purpose:** Pass values to query/workflow parameters.

**Configuration:**
```json
{
  "parameters": {
    "userId": "{{ctx.input.userId}}",
    "status": "active",
    "startDate": "2024-01-01"
  }
}
```

**Value Sources:**
- Dashboard filters
- Other widget outputs
- URL parameters
- Fixed values

---

## Data Binding

### Binding to Queries

**Steps:**
1. Select "Data Query" as source
2. Choose query from dropdown
3. Map query parameters
4. Configure result path

**Example:**
```json
{
  "dataSourceType": "query",
  "dataSourceId": "get-users-query-uuid",
  "parameters": {
    "status": "active"
  },
  "resultPath": "data"
}
```

### Binding to Workflows

**Steps:**
1. Select "Workflow" as source
2. Choose workflow from dropdown
3. Map workflow input arguments
4. Configure execution mode

**Execution Modes:**

| Mode | Description | Use Case |
|------|-------------|----------|
| **Execute on Load** | Run when dashboard loads | Initial data fetch |
| **Execute on Trigger** | Run when triggered | User actions |
| **Execute on Schedule** | Run at intervals | Auto-refresh |

**Example:**
```json
{
  "dataSourceType": "workflow",
  "dataSourceId": "fetch-dashboard-data-workflow",
  "inputParameters": {
    "dateRange": "last_30_days"
  },
  "executionMode": "execute_on_load"
}
```

### Result Path

**Purpose:** Navigate nested result structures.

**Examples:**
```javascript
// Root level
"data"

// Nested object
"data.users"

// Array element
"data.orders[0]"

// Property access
"data.result.total"
```

---

## Chart Widgets

### Vega-Lite Configuration

#### Basic Chart Structure

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "name": "dataset"
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "category",
      "type": "nominal"
    },
    "y": {
      "field": "value",
      "type": "quantitative"
    },
    "color": {
      "field": "category",
      "type": "nominal"
    }
  }
}
```

#### Chart Types

**Bar Chart:**
```json
{
  "mark": "bar",
  "encoding": {
    "x": {"field": "category", "type": "nominal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}
```

**Line Chart:**
```json
{
  "mark": "line",
  "encoding": {
    "x": {"field": "date", "type": "temporal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}
```

**Pie Chart:**
```json
{
  "mark": "arc",
  "encoding": {
    "theta": {"field": "value", "type": "quantitative"},
    "color": {"field": "category", "type": "nominal"}
  }
}
```

### Advanced Options

#### Rendering Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Renderer** | String | "canvas" | "svg" or "canvas" |
| **Show Actions** | Boolean | false | Show Vega embed actions |

**Configuration:**
```json
{
  "advancedOptions": {
    "renderer": "svg",
    "showActions": true
  }
}
```

#### Chart Customization

**Title:**
```json
{
  "title": {
    "text": "Monthly Revenue",
    "fontSize": 16,
    "color": "#333"
  }
}
```

**Axes:**
```json
{
  "encoding": {
    "x": {
      "axis": {
        "labelAngle": 45,
        "labelFontSize": 12,
        "titleFontSize": 14
      }
    }
  }
}
```

**Legend:**
```json
{
  "encoding": {
    "color": {
      "legend": {
        "orient": "right",
        "title": "Category"
      }
    }
  }
}
```

---

## Table Widgets

### Configuration

#### Basic Settings

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| **Show Pagination** | Boolean | ❌ No | true | Enable pagination |
| **Page Size** | Integer | ❌ No | 10 | Rows per page |
| **Show Search** | Boolean | ❌ No | true | Enable search |
| **Show Filters** | Boolean | ❌ No | false | Enable column filters |
| **Sortable** | Boolean | ❌ No | true | Enable column sorting |
| **Striped** | Boolean | ❌ No | false | Alternating row colors |

#### Column Configuration

**Purpose:** Customize column display.

**Configuration:**
```json
{
  "columns": [
    {
      "field": "id",
      "title": "ID",
      "visible": true,
      "sortable": true,
      "width": 100
    },
    {
      "field": "name",
      "title": "Name",
      "visible": true,
      "sortable": true
    },
    {
      "field": "email",
      "title": "Email",
      "visible": true,
      "sortable": false
    }
  ]
}
```

#### Column Formatting

**Date Formatting:**
```json
{
  "field": "created_at",
  "title": "Created At",
  "format": "date",
  "formatOptions": {
    "year": "numeric",
    "month": "short",
    "day": "numeric"
  }
}
```

**Number Formatting:**
```json
{
  "field": "amount",
  "title": "Amount",
  "format": "currency",
  "formatOptions": {
    "currency": "USD",
    "minimumFractionDigits": 2
  }
}
```

**Boolean Formatting:**
```json
{
  "field": "active",
  "title": "Status",
  "format": "boolean",
  "formatOptions": {
    "trueLabel": "Active",
    "falseLabel": "Inactive"
  }
}
```

---

## Advanced Features

### Real-time Updates

**Purpose:** Automatically refresh widget data.

**Configuration:**
```json
{
  "refreshConfig": {
    "enabled": true,
    "interval": 30000
  }
}
```

**Interval Options:**
- 5000 (5 seconds)
- 10000 (10 seconds)
- 30000 (30 seconds)
- 60000 (1 minute)
- 300000 (5 minutes)

### Conditional Formatting

**Purpose:** Style cells based on values.

**Configuration:**
```json
{
  "conditionalFormatting": [
    {
      "field": "status",
      "rule": "equals",
      "value": "active",
      "style": {
        "backgroundColor": "#4CAF50",
        "color": "white"
      }
    },
    {
      "field": "amount",
      "rule": "greater_than",
      "value": 10000,
      "style": {
        "fontWeight": "bold",
        "color": "#FF5722"
      }
    }
  ]
}
```

### Export Options

**Purpose:** Allow users to export data.

**Available Formats:**
- CSV
- Excel (XLSX)
- PDF

**Configuration:**
```json
{
  "export": {
    "enabled": true,
    "formats": ["csv", "xlsx", "pdf"]
  }
}
```

---

## Examples

### Example 1: Bar Chart - Monthly Revenue

**Widget Type:** Vega-Lite

**Data Source:** Query "GetMonthlyRevenue"

**Configuration:**
```json
{
  "widgetType": "vega-lite",
  "dataSourceType": "query",
  "dataSourceId": "get-monthly-revenue-uuid",
  "spec": {
    "mark": "bar",
    "encoding": {
      "x": {"field": "month", "type": "ordinal"},
      "y": {"field": "revenue", "type": "quantitative"},
      "color": {"field": "month", "type": "nominal"}
    }
  }
}
```

### Example 2: Data Table - User List

**Widget Type:** Table

**Data Source:** Query "GetAllUsers"

**Configuration:**
```json
{
  "widgetType": "table",
  "dataSourceType": "query",
  "dataSourceId": "get-all-users-uuid",
  "tableOptions": {
    "pagination": true,
    "pageSize": 20,
    "search": true,
    "sortable": true,
    "columns": [
      {"field": "id", "title": "ID", "width": 80},
      {"field": "name", "title": "Name"},
      {"field": "email", "title": "Email"},
      {"field": "status", "title": "Status"}
    ]
  }
}
```

### Example 3: Line Chart with Workflow

**Widget Type:** Vega-Lite

**Data Source:** Workflow "FetchTimeSeriesData"

**Configuration:**
```json
{
  "widgetType": "vega-lite",
  "dataSourceType": "workflow",
  "dataSourceId": "fetch-time-series-uuid",
  "inputParameters": {
    "timeRange": "last_90_days"
  },
  "spec": {
    "mark": "line",
    "encoding": {
      "x": {"field": "date", "type": "temporal"},
      "y": {"field": "value", "type": "quantitative"}
    }
  }
}
```

---

## Next Steps

- [**Charts**](./charts) - Detailed chart configuration
- [**Tables**](./tables) - Table options and formatting
- [**Dashboard Builder**](../dashboard/overview) - Create dashboards
- [**Workflow Bridge**](./widget-workflow-bridge) - Widget-workflow integration

---

<div align="center">

### Need Help?

[Troubleshooting Guide](../../troubleshooting/troubleshooting) · [API Reference](../../api-reference/index) · [Community Support](#)

</div>
