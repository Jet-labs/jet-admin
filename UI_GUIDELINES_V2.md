# UI Guidelines v2

This document is a repo-grounded audit of the current UI implementation across:

- `apps/frontend`
- `packages/ui`
- `packages/json-forms-renderers`
- `packages/workflow-nodes`
- `packages/workflow-edges`
- `docs/src`

It codifies **what is actually repeated today**, flags **where the repo diverges**, and recommends **one canonical standard going forward** using patterns that already exist in the codebase.

---

## Executive Summary

### What is already strong enough to codify

| Area | Status | Why |
|---|---|---|
| Split-panel app layout | ✅ | Repeated in `protectedLayout.jsx`, `dashboardLayout.jsx`, and builder/editor screens |
| Dense admin sizing | ✅ | `text-xs`, `text-sm`, `h-8`, `rounded-md`, compact paddings recur across app surfaces |
| Shared action primitives | ✅ | `@jet-admin/ui` `Button`, `Input`, `Select`, `Dialog`, `Spinner`, `Checkbox` are real and broadly present |
| Loading/empty/error wrappers | ✅ | `ReactQueryLoadingErrorWrapper`, `Spinner`, and `NoEntityUI` are real shared patterns |
| Primary nav active state | ✅ | `bg-primary/10 text-primary` is a repeatable observed convention, especially in `mainDrawerList/index.jsx` |

### Highest-priority inconsistency zones

| Area | Status | Why |
|---|---|---|
| Color usage | ⚠️ | Semantic tokens exist, but many screens still use `bg-white`, `bg-slate-50`, `text-slate-*`, `text-[#00203e]`, `#646cff`, `#ffe7a4` |
| Forms | ⚠️ | Mixed use of native `<label>`, shared `Input`, heavily overridden inputs, JSON Forms renderers, and bespoke error treatments |
| Buttons | ⚠️ | Shared `Button` exists, but many screens override it with raw Tailwind or use unsupported variants |
| Tables/data-heavy surfaces | ⚠️ | `DataGrid` styling mixes MUI `sx`, Tailwind utilities, shared primitives, and hardcoded hex colors in one surface |
| Package-level UI dialects | ⚠️ | `workflow-nodes`, `json-forms-renderers`, and `docs` have visibly different visual systems |

---

## Canonical Decisions Matrix

| Category | Observed default | Canonical standard going forward | Evidence |
|---|---|---|---|
| Layout shell | Split panel + top nav + overflow-hidden containers | Keep this as the product-shell default | `apps/frontend/src/presentation/components/layouts/protectedLayout.jsx`, `dashboardLayout.jsx` |
| Page title | `text-xl md:text-2xl font-bold text-slate-700` | Standardize on this existing title scale | `dashboardAdditionForm.jsx`, `datasourceAdditionForm.jsx` |
| Primary action | Shared `Button` | Use `Button` without raw color overrides | `packages/ui/src/components/button.jsx` |
| Secondary row action | `variant="primary-ghost"` | Make this the default toolbar/list secondary action | `mainDrawerList/index.jsx`, `defaultDashboardSelectionLayout.jsx`, `databaseTableGrid.jsx` |
| Destructive action | `variant="destructive-ghost"` appears repeatedly | Use `destructive-ghost` for icon/small delete actions, `destructive` for full CTA | multiple deletion forms |
| Input field | Shared `Input` but often overridden | Keep shared `Input`; limit overrides to layout only | `packages/ui/src/components/input.jsx`, `datasourceEditor.jsx`, `CustomTextInput.jsx` |
| Form labels | Mostly native `<label>` | Migrate toward shared `Label` for consistency | `signInPage/index.jsx`, `signUpPage/index.jsx`, `datasourceEditor.jsx`, `packages/ui/src/components/label.jsx` |
| Empty state | Centered icon + muted copy | Keep `NoEntityUI` pattern | `apps/frontend/src/presentation/components/ui/noEntityUI.jsx` |
| Loading | Centered `Spinner` via wrapper | Keep wrapper pattern | `reactQueryLoadingErrorWrapper.jsx`, `suspenseFallback.jsx` |
| Confirmation | Global confirmation flow + shared dialog base | Keep one confirmation path only | deletion forms + `confirmationDialog.jsx` |
| Nav item states | Active = `bg-primary/10 text-primary`; inactive = slate neutrals | Use `mainDrawerList` as canonical drawer styling | `mainDrawerList/index.jsx` vs `dashboardDrawerList/index.jsx` |
| Icon set | Mixed `react-icons` + `lucide-react` | Standardize on one set for new generic UI | `mainDrawerList/index.jsx`, `packages/ui` internals |

---

## Layout & Structure

### Observed Pattern

The strongest layout pattern in the repo is the **dense split-pane admin shell**:

- Root wrapper commonly uses `flex h-full w-full flex-col ... overflow-hidden`
- Left navigation or editor pane + `ResizableHandle` + right content pane
- Top border/nav bar often uses `border-b-2 border-primary bg-white`
- This is consistent in:
  - `apps/frontend/src/presentation/components/layouts/protectedLayout.jsx`
  - `apps/frontend/src/presentation/components/layouts/dashboardLayout.jsx`
  - `apps/frontend/src/presentation/components/dashboardComponents/dashboardAdditionForm.jsx`
  - `apps/frontend/src/presentation/components/datasourceComponents/datasourceAdditionForm.jsx`

### Canonical Standard

✅ **Codify the split-panel shell as the default application layout**.

- Use the existing `ResizablePanelGroup` pattern for major editor/builder/product surfaces
- Preserve the dense admin shell
- Keep scroll responsibility local to inner panes, not `body`

### Canonical JSX

```jsx
<div className="flex h-full w-full flex-col overflow-hidden">
  <ResizablePanelGroup direction="horizontal">
    <ResizablePanel defaultSize={20}>...</ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize={80}>...</ResizablePanel>
  </ResizablePanelGroup>
</div>
```

---

## Typography

### Observed Pattern

Typography is **dense, admin-oriented, and compact**, not marketing-style:

- Small body sizes dominate: `text-xs`, `text-sm`
- Page titles often use `text-xl font-bold ... md:text-2xl`
- Metadata labels often use `text-xs text-primary`
- Many surfaces use `text-slate-700` / `text-slate-600`
- App font is globally forced to **Poppins** in `apps/frontend/src/index.css`
- Docs site uses **Inter** in `docs/src/css/custom.css`, so docs are a separate dialect

### Canonical Standard

✅ **Codify the app UI as compact and data-dense**.

- Page title: `text-xl md:text-2xl font-bold`
- Section label: `text-sm font-medium`
- Body/helper text: `text-sm`
- Metadata/microcopy: `text-xs`

### Canonical JSX

```jsx
<header className="space-y-1">
  <h1 className="text-xl font-bold text-slate-700 md:text-2xl">Page title</h1>
  <p className="text-sm text-slate-600">Supporting description</p>
  <span className="text-xs text-primary">Optional metadata</span>
</header>
```

---

## Color & Token Usage

### Observed Pattern

This is the single largest inconsistency in the repo.

Good foundation that already exists:

- `apps/frontend/tailwind.config.js` defines semantic colors: `background`, `foreground`, `primary`, `secondary`, `destructive`, `muted`, `accent`, `border`
- `apps/frontend/src/index.css` defines the underlying HSL CSS variables
- `@jet-admin/ui` components already use semantic tokens

Real usage in product code still leans on raw utilities and hex:

- `bg-white`
- `bg-slate-50`
- `bg-slate-100`
- `border-slate-200`
- `text-slate-700`
- `text-slate-600`
- `text-gray-700`
- `text-[#00203e]`
- `#646cff`
- `#4285F4`
- `#ffe7a4`

Key files:

- `apps/frontend/src/index.css`
- `apps/frontend/src/presentation/pages/signInPage/index.jsx`
- `apps/frontend/src/presentation/pages/signUpPage/index.jsx`
- `apps/frontend/src/presentation/components/databaseTableComponents/databaseTableGrid.jsx`
- `apps/frontend/src/presentation/components/databaseTableComponents/databaseTableAppliedFilters.jsx`
- `packages/workflow-nodes/src/nodes/startNode.jsx`
- `packages/workflow-nodes/src/nodes/conditionNode.jsx`

### Canonical Standard

⚠️ **Immediate refactor area**

Going forward:

- Use semantic tokens for app surfaces and primitives:
  - `bg-background`
  - `text-foreground`
  - `text-muted-foreground`
  - `border-border`
  - `bg-muted`
  - `text-primary`
- Reserve raw hex only for:
  - third-party brand colors
  - chart palettes
  - React Flow geometry/connector cases where tokenization is not yet practical

### Canonical JSX

```jsx
<div className="rounded-md border border-border bg-background p-3">
  <h2 className="text-sm font-medium text-foreground">Section</h2>
  <p className="text-sm text-muted-foreground">Supporting copy</p>
  <Button variant="primary-ghost">Secondary action</Button>
</div>
```

---

## Spacing & Density

### Observed Pattern

Spacing is relatively consistent even when colors are not.

Frequently repeated values:

- control height `h-8`
- compact paddings `p-2`, `p-2.5`, `px-2.5`, `py-1.5`, `p-3`
- `gap-2`, `gap-3`, `gap-4`
- `rounded` / `rounded-md`
- compact buttons via `size="sm"`

### Canonical Standard

✅ **Codify compact admin density as-is**

- Default control height: `h-8`
- Default field/button radius: `rounded-md`
- Default row spacing: `gap-2` or `gap-3`
- Default card/box padding: `p-3`
- Use `size="sm"` in dense tables/toolbars and drawer actions

### Canonical JSX

```jsx
<div className="flex items-center gap-2 rounded-md border border-border bg-background p-3">
  <Input className="h-8" />
  <Button size="sm" variant="primary-ghost">Filter</Button>
</div>
```

---

## Buttons & Action Affordances

### Observed Pattern

The shared button primitive is real and should be the foundation.

- `packages/ui/src/components/button.jsx` defines `default`, `destructive`, `destructive-ghost`, `primary-ghost`, `primary-outline`, `outline`, `secondary`, `ghost`, and `link`
- Common real usage patterns:
  - `primary-ghost` for add/secondary row actions
  - `destructive-ghost` for delete icon buttons
  - `size="sm"` for dense actions

### Major Inconsistencies

⚠️ Raw overrides are common:

- Auth submit buttons use custom blue classes in `signInPage/index.jsx` and `signUpPage/index.jsx`
- Confirmation dialog confirm button uses raw blue classes in `confirmationDialog.jsx`
- Datasource add submit uses custom classes in `datasourceAdditionForm.jsx`

⚠️ There is also an unsupported variant usage:

- `apps/frontend/src/presentation/components/databaseTableComponents/databaseTableRowsDeletionForm.jsx` uses `variant="destructive-outline"`
- That variant is **not defined** in `packages/ui/src/components/button.jsx`

### Canonical Standard

⚠️ **Immediate refactor area**

- Primary CTA: `Button`
- Toolbar/list secondary CTA: `variant="primary-ghost"`
- Destructive icon action: `variant="destructive-ghost"`
- Destructive full CTA: `variant="destructive"`
- Do not introduce button colors via raw Tailwind on feature screens
- Do not use undefined variants

### Canonical JSX

```jsx
<div className="flex items-center gap-2">
  <Button size="sm" variant="primary-ghost">Add item</Button>
  <Button size="sm" variant="outline">Cancel</Button>
  <Button size="sm" variant="destructive-ghost">Delete</Button>
</div>
```

---

## Forms & Inputs

### Observed Pattern

Forms are one of the least standardized areas.

What is real today:

- Shared `Input` is widely used
- Shared `Select` appears in admin flows
- Labels are often plain `<label>`
- Error text is usually small and red: `text-red-500 text-xs`
- Inputs are often restyled with raw slate classes
- JSON Forms renderers repeat the same pattern with local overrides

Evidence:

- `signInPage/index.jsx`
- `signUpPage/index.jsx`
- `datasourceEditor.jsx`
- `packages/json-forms-renderers/src/renderers/CustomTextInput.jsx`
- `packages/json-forms-renderers/src/renderers/CustomStringArrayRenderer.jsx`

### Canonical Standard

⚠️ **Immediate refactor area**

The most defensible standard, based on what already exists, is:

- Use shared `Input`, `Textarea`, `Select`, `Checkbox`
- Use shared `Label`
- Allow layout overrides, not visual re-skinning
- Standardize helper/error text beneath the field

### Canonical JSX

```jsx
<div className="space-y-1.5">
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Enter name" />
  <p className="text-xs text-red-500">Validation message</p>
</div>
```

---

## Tables & Data-Heavy Surfaces

### Observed Pattern

The repo’s data-heavy UI is centered on MUI Data Grid plus local admin chrome.

Real repeated patterns:

- compact top action rows using shared `Button`
- bulk/action banners
- custom `Checkbox` integration
- `NoEntityUI` for empty
- heavy MUI `sx` customization for the table itself

Primary evidence:

- `apps/frontend/src/presentation/components/databaseTableComponents/databaseTableGrid.jsx`
- `apps/frontend/src/presentation/components/databaseTableComponents/databaseTableAppliedFilters.jsx`

### Canonical Standard

⚠️ **Immediate refactor area**

- Keep `DataGrid` for large editable tables; it is the real pattern in this repo
- Keep table chrome outside the grid in shared compact admin primitives
- Centralize DataGrid theming instead of per-screen `sx` divergence
- Reuse `NoEntityUI` and shared buttons around the grid

### Canonical JSX

```jsx
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <Button size="sm" variant="primary-ghost">Add row</Button>
  </div>
  <DataGrid {...gridProps} />
</div>
```

---

## Loading, Empty, and Error States

### Observed Pattern

This area is relatively good already.

Real shared elements:

- `Spinner` from `@jet-admin/ui`
- `ReactQueryLoadingErrorWrapper`
- `NoEntityUI`
- `suspenseFallback.jsx`

### Canonical Standard

✅ **Codify this area mostly as-is**

- Query-backed screens should render through `ReactQueryLoadingErrorWrapper`
- Empty states should use `NoEntityUI`
- Full-screen suspense/loading should use shared `Spinner`

### Canonical JSX

```jsx
<ReactQueryLoadingErrorWrapper isLoading={isLoading} error={error}>
  {items.length ? <Content /> : <NoEntityUI title="No records found" />}
</ReactQueryLoadingErrorWrapper>
```

### Important Note

⚠️ Some call sites appear to pass wrapper props that are not part of the component’s declared interface, such as `isFetching`, `refetch`, or `isRefetching`. Those usages should be audited so the wrapper contract is real and consistent.

---

## Modals, Dialogs, and Confirmation Flows

### Observed Pattern

The shared dialog primitive exists and is solid in `packages/ui/src/components/dialog.jsx`, but actual usage is mixed:

- Destructive flows frequently use a global `showConfirmation(...)`
- `confirmationDialog.jsx` uses shared `Dialog` but styles its confirm button manually
- `AlertDialog` exists in `packages/ui` but was not a visible dominant app pattern in the audit

### Canonical Standard

⚠️ **Partial consistency; choose one destructive-confirm pattern**

- Use shared `Dialog` for content/detail/edit modals
- Use one shared confirmation path for destructive actions
- Confirmation CTAs should use the shared button variants, not custom raw blue styling

### Canonical JSX

```jsx
<Dialog>
  <DialogContent>
    <DialogTitle>Confirm deletion</DialogTitle>
    <div className="flex justify-end gap-2">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  </DialogContent>
</Dialog>
```

---

## Navigation & Wayfinding

### Observed Pattern

The clearest canonical nav implementation already exists in `mainDrawerList/index.jsx`.

Observed nav conventions there:

- active row: `bg-primary/10 text-primary`
- inactive row: `text-slate-700 hover:bg-slate-100 hover:text-slate-900`
- grouped nav via accordions
- compact spacing and rounded rows
- good use of `Button variant="primary-ghost"` for “add” affordances

By contrast, `dashboardDrawerList/index.jsx` diverges:

- active background `bg-[#eaebff]`
- more gray-based ad hoc styling
- inconsistent hover/active treatment

`breadCrumbs.jsx` also mixes navigation semantics by using a plain `<a href="/">` for Home instead of router navigation.

### Canonical Standard

✅ **Use `mainDrawerList` as the model for side navigation**
⚠️ **Refactor other navigation surfaces toward it**

### Canonical JSX

```jsx
<Link className="flex w-full items-center rounded-md p-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900">
  <Icon className="mr-2 h-4 w-4" />
  <span className="text-sm">Nav item</span>
</Link>
```

---

## Icons

### Observed Pattern

The repo currently uses multiple icon systems:

- `react-icons` is heavily used in app features/navigation
- `lucide-react` is present and used by `@jet-admin/ui`
- images/SVGs also appear for some states and branding

### Canonical Standard

⚠️ **Current state is mixed**

Recommended forward standard:

- Use `lucide-react` for new generic app UI and shared primitives
- Use `react-icons` only when:
  - a needed icon does not exist in Lucide
  - a vendor/brand icon is required

### Canonical JSX

```jsx
<Button size="sm" variant="primary-ghost">
  <Plus className="mr-2 h-4 w-4" />
  Add source
</Button>
```

---

## Shared Component Adoption

### Observed Pattern

`@jet-admin/ui` exports a good shared surface, including `Button`, `Input`, `Label`, `Select`, `Dialog`, `Checkbox`, `Textarea`, `Switch`, `Badge`, `Accordion`, `ScrollArea`, and `AlertDialog`.

Adoption is uneven.

✅ Strong adoption:

- `Button`
- `Input`
- `Spinner`
- `Select`
- `Dialog`
- `Checkbox`

⚠️ Underused or not strong enough to be called standard yet:

- `Label`
- `Badge`
- `AlertDialog`

### Canonical Standard

- Shared primitives should be the **first choice**
- Feature code should not restyle them into effectively new components
- If a repeated override pattern is needed, it belongs back in `packages/ui`

---

## Package-Level UI Dialects

### `packages/json-forms-renderers`

Observed:

- Mostly aligned structurally with app forms
- Still overrides `Input`/`Textarea` with slate-heavy styles
- Uses custom local action treatments such as red delete buttons and `text-[#646cff]`

Status: ⚠️ needs convergence with core form standards

### `packages/workflow-nodes`

Observed:

- Visually distinct node cards with lots of raw colors
- Inline style objects are common
- Save/config buttons use raw `#646cff`
- Branch/condition UI is much more bespoke than the rest of the app

Files:

- `packages/workflow-nodes/src/nodes/startNode.jsx`
- `packages/workflow-nodes/src/nodes/conditionNode.jsx`

Status: ⚠️ highest divergence outside the main app

### `packages/workflow-edges`

Observed:

- Smaller surface area
- Part of the workflow editor dialect, not the general admin shell

Status: ⚠️ should inherit workflow-editor standards once that area is normalized

### `docs/src`

Observed:

- Separate product-marketing/docs UI using Docusaurus styles
- Inter font
- custom brand tokens
- different button and hero patterns

Files:

- `docs/src/pages/index.js`
- `docs/src/css/custom.css`

Status: ✅ treat as a separate surface, not a violation of product-app admin UI rules

---

## High-Inconsistency Report

| Priority | Area | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| P0 | Button API | Unsupported `variant="destructive-outline"` exists | `databaseTableRowsDeletionForm.jsx` | Replace with supported variant immediately |
| P0 | Color system | Semantic tokens exist but are bypassed by raw slate/gray/hex usage | auth pages, table screens, workflow nodes, global CSS | Migrate surfaces to token classes |
| P0 | Forms | Native labels + shared inputs + overridden inputs + JSON Forms divergence | auth pages, `datasourceEditor.jsx`, renderer package | Standardize on `Label` + shared field primitives |
| P1 | Confirmation flows | Shared dialog and global confirm coexist | deletion flows + `confirmationDialog.jsx` | Pick one destructive-confirm system |
| P1 | Navigation | `mainDrawerList` and `dashboardDrawerList` use different active-state systems | both drawer files | Standardize on `mainDrawerList` pattern |
| P1 | Table chrome | Data table UI mixes MUI `sx`, hex, Tailwind, and shared primitives | `databaseTableGrid.jsx`, `databaseTableAppliedFilters.jsx` | Create one shared grid chrome/theme layer |
| P2 | Iconography | `react-icons` and `lucide-react` mixed without rule | app + `packages/ui` | Standardize new generic UI on Lucide |
| P2 | Shared primitive adoption | `Label`, `Badge`, `AlertDialog` underused | `packages/ui` vs app usage | Increase adoption or reduce exported surface |

---

## Areas Ready to Codify Immediately

| Area | Status | Canonical source |
|---|---|---|
| App shell layout | ✅ | `protectedLayout.jsx`, `dashboardLayout.jsx` |
| Compact control sizing | ✅ | `packages/ui/src/components/button.jsx`, `input.jsx` |
| Drawer active state | ✅ | `mainDrawerList/index.jsx` |
| Empty states | ✅ | `noEntityUI.jsx` |
| Loading/error wrapper | ✅ | `reactQueryLoadingErrorWrapper.jsx` |
| Secondary action button style | ✅ | `primary-ghost` usage across drawers/table/header actions |
| Destructive icon button style | ✅ | repeated `destructive-ghost` deletion forms |

---

## Recommended Canonical UI Patterns

### App Shell

```jsx
<div className="flex h-full w-full flex-col overflow-hidden">
  <TopBar />
  <ResizablePanelGroup direction="horizontal">...</ResizablePanelGroup>
</div>
```

### Page Header

```jsx
<div className="space-y-1">
  <h1 className="text-xl font-bold text-slate-700 md:text-2xl">Datasources</h1>
  <p className="text-sm text-slate-600">Manage available connections</p>
</div>
```

### Toolbar Actions

```jsx
<div className="flex items-center gap-2">
  <Button size="sm" variant="primary-ghost">Add</Button>
  <Button size="sm" variant="outline">Cancel</Button>
</div>
```

### Form Field

```jsx
<div className="space-y-1.5">
  <Label htmlFor="title">Title</Label>
  <Input id="title" />
  <p className="text-xs text-red-500">Required field</p>
</div>
```

### Drawer Link

```jsx
<Link className="flex items-center rounded-md p-2.5 text-slate-700 hover:bg-slate-100">
  <Icon className="mr-2 h-4 w-4" />
  <span className="text-sm">Dashboard</span>
</Link>
```

### Loading / Empty

```jsx
<ReactQueryLoadingErrorWrapper isLoading={isLoading} error={error}>
  {rows.length ? <Table /> : <NoEntityUI title="No rows found" />}
</ReactQueryLoadingErrorWrapper>
```

### Confirmation Modal

```jsx
<div className="flex justify-end gap-2">
  <Button variant="outline">Cancel</Button>
  <Button variant="destructive">Delete</Button>
</div>
```

---

## Recommended Refactor Order

1. **Fix unsupported button variants**
   - Start with `databaseTableRowsDeletionForm.jsx`
2. **Normalize buttons on auth and confirmation flows**
   - `signInPage/index.jsx`
   - `signUpPage/index.jsx`
   - `confirmationDialog.jsx`
3. **Tokenize colors in app chrome and high-traffic screens**
   - drawers
   - auth pages
   - table banners
   - form containers
4. **Standardize form field structure**
   - move toward `Label` + shared field primitives
   - align JSON Forms renderers
5. **Converge the data table surface**
   - shared banner/filter/toolbar/grid theme layer
6. **Refactor workflow editor UI into its own standardized dialect**
   - node cards
   - node controls
   - save/config actions

---

## Bottom Line

The repo already has a usable foundation for a coherent design system:

- shared primitives in `@jet-admin/ui`
- semantic tokens in Tailwind/CSS variables
- a consistent admin shell
- compact sizing patterns
- reusable loading/empty infrastructure

The main problem is **not lack of components**. It is **inconsistent adoption**.

If the repo standardizes around the patterns already strongest in this audit, the v2 direction should be:

- **shared primitives first**
- **semantic tokens instead of raw color classes**
- **compact admin density preserved**
- **`mainDrawerList` as nav reference**
- **one form field pattern**
- **one confirmation pattern**
- **one icon policy**