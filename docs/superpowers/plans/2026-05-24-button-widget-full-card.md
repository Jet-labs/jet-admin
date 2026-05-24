# Button Widget Full Card Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the button widget so that the button element expands to fill the entire card layout slot, and default its header visibility to off while preserving the toggle functionality.

**Architecture:** 
1. Modify default `showHeader` in `widget.map.js` to `false` for button widget.
2. Remove padding from the widget content wrapper inside `appPageWidgetSlot.jsx` when the widget type is `'button'`.
3. Make the root of `buttonWidget.jsx` the `@jet-admin/ui` `Button` styled to be full width/height (`!w-full !h-full rounded-none border-0 px-4`).

**Tech Stack:** React, TailwindCSS, ESBuild, Lerna/NPM Workspaces.

---

### Task 1: Update Widget Default Map
Update the default `sampleConfig` for the button widget in `widget.map.js` so `showHeader` defaults to `false`.

**Files:**
- Modify: `packages/widgets-ui/src/widget.map.js`

- [ ] **Step 1: Edit sampleConfig in `widget.map.js`**

Replace `showHeader: true` with `showHeader: false` in the `button` block of `WIDGETS_MAP`.

Lines around 93-98:
```javascript
    sampleConfig: {
      text: "Click Me",
      variant: "default",
      size: "default",
      showHeader: false,
    },
```

- [ ] **Step 2: Verify compiling of widgets-ui**

Run build in widgets-ui:
```powershell
npm --prefix packages/widgets-ui run build
```
Expected: Build passes with no compilation errors.

- [ ] **Step 3: Commit changes**

```bash
git add packages/widgets-ui/src/widget.map.js
git commit -m "feat(widgets-ui): default button showHeader to false in config"
```

---

### Task 2: Remove Padding in Widget Slot for Button
Check if the widget is a button widget in `appPageWidgetSlot.jsx` and bypass default layout container padding.

**Files:**
- Modify: `apps/frontend/src/presentation/components/appPageComponents/appPageWidgetSlot.jsx`

- [ ] **Step 1: Check widgetType inside `appPageWidgetSlot.jsx`**

Add the helper variable:
```javascript
const isButton = widget?.widgetType === "button";
```
near line 194 where `showHeader` is computed.

- [ ] **Step 2: Update Widget Content wrapper styling**

Find the widget content wrapper around line 309-325:
```javascript
            {/* Widget Content */}
            {RenderedWidgetComponent
              ? (
                    <div className="min-h-0 flex-1 bg-background px-2 pb-2 pt-1">
                  <MemoizedWidgetContent
```
And replace it with:
```javascript
            {/* Widget Content */}
            {RenderedWidgetComponent
              ? (
                    <div className={isButton ? "min-h-0 flex-1 bg-background h-full w-full" : "min-h-0 flex-1 bg-background px-2 pb-2 pt-1"}>
                  <MemoizedWidgetContent
```

- [ ] **Step 3: Commit changes**

```bash
git add apps/frontend/src/presentation/components/appPageComponents/appPageWidgetSlot.jsx
git commit -m "feat(frontend): remove padding for button widget in AppPageWidgetSlot"
```

---

### Task 3: Refactor ButtonWidget Component Styling
Modify the button widget to render the custom `Button` component as the root element with full height and width, and remove the outer flex alignment container.

**Files:**
- Modify: `packages/widgets-ui/src/button/buttonWidget.jsx`

- [ ] **Step 1: Modify the return JSX in `buttonWidget.jsx`**

Replace the returned JSX around lines 28-40:
```javascript
  return (
    <div className="flex w-full h-full items-center justify-center p-4 text-center">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={loading || isLoadingWorkflows}
      >
        {(loading || isLoadingWorkflows) && <Spinner className="mr-2 h-4 w-4" />}
        {text}
      </Button>
    </div>
  );
```
with:
```javascript
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading || isLoadingWorkflows}
      className="!h-full !w-full rounded-none flex items-center justify-center text-center px-4 border-0"
    >
      {(loading || isLoadingWorkflows) && <Spinner className="mr-2 h-4 w-4" />}
      {text}
    </Button>
  );
```

- [ ] **Step 2: Run a build of widgets-ui to verify**

Run build in widgets-ui:
```powershell
npm --prefix packages/widgets-ui run build
```
Expected: Build passes with no compilation or bundling errors.

- [ ] **Step 3: Commit changes**

```bash
git add packages/widgets-ui/src/button/buttonWidget.jsx
git commit -m "feat(widgets-ui): style button widget to fill the entire slot card"
```
