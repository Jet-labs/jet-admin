# Consolidated Page Header UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a reusable `PageHeader` component and apply it to all 8 module update pages to standardize layout, text, and button order.

**Architecture:** Create a shared component in `packages/ui` that accepts title, ID, and action callbacks. Update the page components in `apps/frontend` to use this new component.

**Tech Stack:** React, Tailwind CSS.

---

### Task 1: Create Reusable PageHeader Component

**Files:**
- Create: `packages/ui/src/components/pageHeader.jsx`

- [ ] **Step 1: Create the PageHeader component**

```javascript
import React from "react";
import PropTypes from "prop-types";
import { Button } from "./button";
import { Spinner } from "./spinner";

export const PageHeader = ({
  title,
  id,
  onSave,
  onDelete,
  onClone,
  onHistory,
  isSaving = false,
  isDeleting = false,
  isCloning = false,
  hasHistory = false,
}) => {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {id && (
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            ID: {id}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {hasHistory && onHistory && (
          <Button variant="outline" size="sm" onClick={onHistory}>
            View History
          </Button>
        )}
        
        {onClone && (
          <Button variant="outline" size="sm" onClick={onClone} disabled={isCloning}>
            {isCloning && <Spinner size={14} className="mr-2" />}
            Clone
          </Button>
        )}

        {onDelete && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDelete} 
            disabled={isDeleting}
            className="text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            {isDeleting && <Spinner size={14} className="mr-2" />}
            Delete
          </Button>
        )}

        {onSave && (
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving && <Spinner size={14} className="mr-2" />}
            Update
          </Button>
        )}
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  id: PropTypes.string,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
  onClone: PropTypes.func,
  onHistory: PropTypes.func,
  isSaving: PropTypes.bool,
  isDeleting: PropTypes.bool,
  isCloning: PropTypes.bool,
  hasHistory: PropTypes.bool,
};
```

---

### Task 2: Update Listener Update Page

**Files:**
- Modify: `apps/frontend/src/presentation/components/listenerComponents/listenerUpdationForm.jsx`

- [ ] **Step 1: Replace manual header with PageHeader**

```jsx
import { PageHeader } from "@jet-admin/ui";

// Inside ListenerUpdationForm component:
return (
  <div className="flex h-full w-full flex-col items-center bg-background">
    <PageHeader
      title={CONSTANTS.STRINGS.UPDATE_LISTENER_FORM_TITLE}
      id={listenerID}
      onSave={listenerUpdationForm.handleSubmit}
      onDelete={() => {/* trigger delete */}}
      isSaving={isUpdatingListener}
    />
    {/* ... rest of the component */}
  </div>
);
```

---

### Task 3: Update Cron Job Update Page

**Files:**
- Modify: `apps/frontend/src/presentation/components/cronJobComponents/cronJobUpdationForm.jsx`

- [ ] **Step 1: Replace manual header with PageHeader**

```jsx
import { PageHeader } from "@jet-admin/ui";

// Inside CronJobUpdationForm component:
return (
  <section className="w-full bg-background">
    <PageHeader
      title={CONSTANTS.STRINGS.UPDATE_CRON_JOB_FORM_TITLE}
      id={cronJob?.cronJobID}
      onSave={cronJobUpdationForm.handleSubmit}
      onDelete={() => {/* trigger delete */}}
      onHistory={() => {/* navigate to history */}}
      hasHistory={true}
      isSaving={isUpdatingCronJob}
    />
    {/* ... rest of the component */}
  </section>
);
```

---

### Task 4: Update Workflow Update Page

**Files:**
- Modify: `apps/frontend/src/presentation/components/workflowComponents/workflowUpdationForm.jsx`

- [ ] **Step 1: Replace manual header with PageHeader**

```jsx
import { PageHeader } from "@jet-admin/ui";

// Inside WorkflowUpdationForm component:
return (
  <div className="flex h-full w-full flex-col items-center bg-background">
    <PageHeader
      title={CONSTANTS.STRINGS.UPDATE_WORKFLOW_FORM_TITLE}
      id={workflowID}
      onSave={workflowUpdationForm.handleSubmit}
      isSaving={isUpdatingWorkflow}
    />
    {/* ... rest of the component */}
  </div>
);
```

---

### Task 5: Update Data Query Update Page

**Files:**
- Modify: `apps/frontend/src/presentation/components/dataQueryComponents/dataQueryUpdationForm.jsx`

- [ ] **Step 1: Replace manual header with PageHeader**

```jsx
import { PageHeader } from "@jet-admin/ui";

// Inside DataQueryUpdationForm component:
return (
  <div className="flex h-full w-full flex-col items-center bg-background">
    <PageHeader
      title={CONSTANTS.STRINGS.UPDATE_DATA_QUERY_FORM_TITLE}
      id={dataQueryID}
      onSave={queryUpdationForm.handleSubmit}
      onDelete={() => {/* trigger delete */}}
      onClone={() => {/* trigger clone */}}
      isSaving={isUpdatingQuery}
    />
    {/* ... rest of the component */}
  </div>
);
```

---

### Task 6: Update Datasource Update Page

**Files:**
- Modify: `apps/frontend/src/presentation/components/datasourceComponents/datasourceUpdationForm.jsx`

- [ ] **Step 1: Replace manual header with PageHeader**

```jsx
import { PageHeader } from "@jet-admin/ui";

// Inside DatasourceUpdationForm component:
return (
  <div className="flex h-full w-full flex-col items-center bg-background">
    <PageHeader
      title={CONSTANTS.STRINGS.UPDATE_DATASOURCE_FORM_TITLE}
      id={datasourceID}
      onSave={datasourceUpdationForm.handleSubmit}
      onDelete={() => {/* trigger delete */}}
      onClone={() => {/* trigger clone */}}
      isSaving={isUpdatingDatasource}
    />
    {/* ... rest of the component */}
  </div>
);
```

---

### Task 7: Update Widget Update Page

**Files:**
- Modify: `apps/frontend/src/presentation/components/widgetComponents/widgetUpdationForm.jsx`

- [ ] **Step 1: Replace manual header with PageHeader**

```jsx
import { PageHeader } from "@jet-admin/ui";

// Inside WidgetUpdationForm component:
return (
  <div className="flex h-full w-full flex-col items-center bg-background">
    <PageHeader
      title={CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_TITLE}
      id={widgetID}
      onSave={widgetUpdationForm.handleSubmit}
      onDelete={() => {/* trigger delete */}}
      onClone={() => {/* trigger clone */}}
      isSaving={isUpdatingWidget}
    />
    {/* ... rest of the component */}
  </div>
);
```

---

### Task 8: Update Dashboard Update Page

**Files:**
- Modify: `apps/frontend/src/presentation/components/dashboardComponents/dashboardUpdationForm.jsx`

- [ ] **Step 1: Replace manual header with PageHeader**

```jsx
import { PageHeader } from "@jet-admin/ui";

// Inside DashboardUpdationForm component:
return (
  <div className="flex h-full w-full flex-col items-center bg-background">
    <PageHeader
      title={CONSTANTS.STRINGS.UPDATE_DASHBOARD_FORM_TITLE}
      id={dashboard?.dashboardID}
      onSave={dashboardUpdationForm.handleSubmit}
      onDelete={() => {/* trigger delete */}}
      onClone={() => {/* trigger clone */}}
      isSaving={isUpdatingDashboard}
    />
    {/* ... rest of the component */}
  </div>
);
```

---

### Task 9: Update API Key Update Page

**Files:**
- Modify: `apps/frontend/src/presentation/components/apiKeyComponents/apiKeyUpdationForm.jsx`

- [ ] **Step 1: Replace manual header with PageHeader**

```jsx
import { PageHeader } from "@jet-admin/ui";

// Inside APIKeyUpdationForm component:
return (
  <div className="flex h-full w-full flex-col items-center bg-background">
    <PageHeader
      title={CONSTANTS.STRINGS.UPDATE_API_KEY_FORM_TITLE}
      id={apiKeyID}
      onSave={apiKeyUpdationForm.handleSubmit}
      onDelete={() => {/* trigger delete */}}
      isSaving={isUpdatingAPIKey}
    />
    {/* ... rest of the component */}
  </div>
);
```
