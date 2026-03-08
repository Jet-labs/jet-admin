# UI Guidelines — Final

> Single source of truth for all UI decisions across `apps/frontend`, `packages/ui`,
> `packages/json-forms-renderers`, `packages/workflow-nodes`, and `packages/workflow-edges`.
> Grounded in the actual codebase audit (v2). Every rule here either already exists as the
> dominant pattern or is the canonical resolution of a measured inconsistency.

---

## 1. Core Principles

1. **Shared primitives first.** Always reach for `@jet-admin/ui` before writing raw Tailwind.
2. **Semantic tokens over raw colors.** If a token exists for it, use the token.
3. **Compact admin density.** This is a data-heavy admin product. Dense > spacious.
4. **One pattern per problem.** One form field structure, one confirmation flow, one nav pattern.
5. **No visual re-skinning of shared components.** Layout overrides are allowed; color/font overrides are not.

---

## 2. Layout & Page Structure

### App Shell

```jsx
<div className="flex h-full w-full flex-col overflow-hidden">
  <TopBar />
  <ResizablePanelGroup direction="horizontal">
    <ResizablePanel defaultSize={20}>
      {/* Sidebar / Drawer */}
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize={80}>
      {/* Main content */}
    </ResizablePanel>
  </ResizablePanelGroup>
</div>
```

**Rules:**
- Root container is always `flex h-full w-full flex-col overflow-hidden`
- Scroll is always local to inner panes — never on `body`
- Use `ResizablePanelGroup` for all major editor/builder/product surfaces
- Top bar uses `border-b-2 border-primary bg-background`

### Centered Forms & Reading Content

```jsx
<div className="flex w-full h-full flex-col items-center overflow-y-auto p-4 md:p-8">
  <section className="max-w-2xl w-full">
    {/* Content */}
  </section>
</div>
```

**Rules:**
- Max width for centered content is always `max-w-2xl` — never percentages like `w-2/3`
- Outer padding is `p-4 md:p-8`
- Background is `bg-background` — never `bg-white`, `bg-card`, or `bg-slate-50`
- No box shadows, no card borders on primary form containers

---

## 3. Typography

| Role | Class |
|---|---|
| Page title | `text-xl font-bold text-slate-700 md:text-2xl` |
| Section header | `text-lg font-semibold` |
| Section label / field label | `text-sm font-medium` |
| Body / helper text | `text-sm` |
| Muted / supporting copy | `text-sm text-muted-foreground` |
| Metadata / microcopy | `text-xs` |
| Metadata with accent | `text-xs text-primary` |

**Rules:**
- App font is **Poppins** — set globally in `apps/frontend/src/index.css`, do not override
- Docs site (`docs/src`) uses Inter and is a separate dialect — its rules do not apply to the product app
- Do not mix `font-bold` and `font-semibold` for the same role across screens

### Canonical JSX

```jsx
<header className="space-y-1">
  <h1 className="text-xl font-bold text-slate-700 md:text-2xl">Page Title</h1>
  <p className="text-sm text-muted-foreground">Supporting description</p>
</header>
```

---

## 4. Color & Token System

### ✅ Always use semantic tokens for app surfaces

| Use | Token |
|---|---|
| Page / panel background | `bg-background` |
| Primary text | `text-foreground` |
| Supporting / muted text | `text-muted-foreground` |
| Borders | `border-border` |
| Muted fills | `bg-muted` |
| Brand / active accent | `text-primary`, `bg-primary` |
| Destructive actions | `text-destructive`, `bg-destructive` |

### ⚠️ Do NOT use raw colors on app surfaces

These are banned for app UI surfaces:
- `bg-white` → use `bg-background`
- `bg-slate-50`, `bg-slate-100` → use `bg-muted` or `bg-background`
- `border-slate-200` → use `border-border`
- `text-gray-700`, `text-slate-700` (on shared components) → use `text-foreground`
- `text-[#00203e]`, `#646cff`, `#4285F4`, `#ffe7a4` → replace with tokens or move to a named constant

### Allowed exceptions for raw hex

- Third-party brand / OAuth provider colors (e.g. Google blue)
- Chart / data visualization palettes
- React Flow node geometry where CSS token resolution is not practical
- `workflow-nodes` and `workflow-edges` packages until a dedicated token layer is added

---

## 5. Spacing & Density

| Context | Value |
|---|---|
| Default control height | `h-8` |
| Default radius | `rounded-md` |
| Stacked form fields | `space-y-1.5` (within field) · `space-y-3` or `space-y-4` (between fields) |
| Row / toolbar gap | `gap-2` or `gap-3` |
| Card / box padding | `p-3` |
| Section-level separation | `space-y-6` only for visually distinct sections |
| Dense table / drawer padding | `p-2` or `p-2.5` |

**Rules:**
- Prefer `gap-*` and `space-y-*` over manual `mb-*` / `mt-*` whenever items are siblings
- Use `mb-2` / `mt-2` only for specific single-element offsets
- Never use `space-y-6` between tightly related form fields

---

## 6. Buttons

### Variants — When to Use Each

| Variant | Use case |
|---|---|
| `default` (omitted) | Primary page CTA, form submit, prominent action |
| `outline` | Cancel / secondary action alongside a primary |
| `ghost` | Inline tertiary actions with no visual weight needed |
| `primary-ghost` | Add / secondary row actions in toolbars, drawers, and list headers |
| `primary-outline` | Secondary CTA that needs visible border weight |
| `destructive` | Full destructive CTA (e.g. confirm deletion button) |
| `destructive-ghost` | Compact icon-only delete button in rows and panels |
| `link` | Navigation-styled text action |

### Sizes — When to Use Each

| Size | Use case | Specs |
|---|---|---|
| `default` (omitted) | Top-level page actions, auth forms, entity forms | `h-8 py-1.5 px-3` |
| `sm` | Dense tables, toolbars, drawers, builder panels | `h-7 px-2.5 text-xs` |
| `icon` | Icon-only buttons (no text label) | `h-8 w-8` square |
| `lg` | Avoid in product UI; use only for major empty-state CTAs | `h-10 px-6` |

**Rules:**
- Always import `Button` from `@jet-admin/ui`
- Never override button colors with raw Tailwind on feature screens
- When grouping related actions, keep the **same visual height** across the row
- In top-level add/update form action rows, use `default` for text buttons and `icon` for icon-only buttons so everything stays at `h-8`
- Do not mix `sm` with `default`/`icon` in the same top-level add/update form action row
- Do not use undefined variants — `destructive-outline` does not exist, use `destructive-ghost`
- Icons inside buttons: `mr-2 h-4 w-4` for left-aligned icons

### Canonical JSX

```jsx
{/* Toolbar actions */}
<div className="flex items-center gap-2">
  <Button size="sm" variant="primary-ghost">
    <Plus className="mr-2 h-4 w-4" />
    Add item
  </Button>
  <Button size="sm" variant="outline">Cancel</Button>
  <Button size="sm" variant="destructive-ghost">
    <Trash2 className="h-4 w-4" />
  </Button>
</div>

{/* Primary form submit */}
<Button type="submit">Save changes</Button>

{/* Top-level form action row */}
<div className="flex items-center justify-end gap-2">
  <Button variant="primary-ghost" size="icon">
    <Copy className="h-4 w-4" />
  </Button>
  <Button variant="destructive-ghost" size="icon">
    <Trash2 className="h-4 w-4" />
  </Button>
  <Button variant="primary-ghost">Test</Button>
  <Button type="submit">Update item</Button>
</div>
```

---

## 7. Forms & Inputs

### Field Anatomy

```jsx
<div className="space-y-1.5">
  <Label htmlFor="field-id">Field label</Label>
  <Input id="field-id" placeholder="Placeholder" />
  <p className="text-xs text-muted-foreground">Helper text</p>
  <p className="text-xs text-red-500">Validation error message</p>
</div>
```

**Rules:**
- Always use shared `Label` from `@jet-admin/ui` — not plain `<label>`
- Always use shared `Input`, `Textarea`, `Select`, `Checkbox` from `@jet-admin/ui`
- Layout overrides (`w-full`, `col-span-*`) are allowed; visual re-skins (`bg-slate-100`, `border-slate-300`) are not
- Error text is always `text-xs text-red-500` directly below the field
- Helper text is always `text-xs text-muted-foreground` directly below the field
- Form container spacing between fields: `space-y-3` or `space-y-4`

### Form Container

```jsx
<div className="space-y-4">
  <div className="space-y-1.5">
    <Label htmlFor="name">Name</Label>
    <Input id="name" />
  </div>
  <div className="space-y-1.5">
    <Label htmlFor="url">URL</Label>
    <Input id="url" type="url" />
    <p className="text-xs text-muted-foreground">Include https://</p>
  </div>
  <div className="flex justify-end gap-2">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</div>
```

---

## 8. Navigation & Drawers

### Canonical Sidebar Link

```jsx
<Link
  className="flex w-full items-center rounded-md p-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  to={href}
>
  <Icon className="mr-2 h-4 w-4" />
  <span className="text-sm">Nav item</span>
</Link>
```

### Active State

```jsx
// Active
className="flex w-full items-center rounded-md p-2.5 bg-primary/10 text-primary"

// Inactive
className="flex w-full items-center rounded-md p-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
```

**Rules:**
- `mainDrawerList/index.jsx` is the canonical reference — all navigation surfaces must match it
- Active state is always `bg-primary/10 text-primary` — never `bg-[#eaebff]` or raw gray fills
- Inactive hover is always `hover:bg-slate-100 hover:text-slate-900`
- Drawer container uses `bg-background p-2` (no `bg-white`)
- Scroll lists inside drawers must have `pb-10` so the last item is not flush to the edge
- "Add" affordances inside drawers use `variant="primary-ghost"` with matching bottom margin to container padding

---

## 9. Tables & Data-Heavy Surfaces

**Rules:**
- Use `DataGrid` (MUI) for large editable tables — this is the established pattern
- All chrome around the grid (toolbar, filters, banners) must use shared `@jet-admin/ui` primitives
- Do not put grid theming in per-screen `sx` objects — centralize in a shared DataGrid theme layer
- Empty state inside tables uses `NoEntityUI`
- Bulk/action banners use shared `Button` components

### Canonical Table Chrome

```jsx
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Button size="sm" variant="primary-ghost">
        <Plus className="mr-2 h-4 w-4" />
        Add row
      </Button>
    </div>
    <Button size="sm" variant="outline">Filters</Button>
  </div>
  <DataGrid {...gridProps} />
</div>
```

---

## 10. Loading, Empty & Error States

### Rules

- Query-backed screens must render through `ReactQueryLoadingErrorWrapper`
- Empty states always use `NoEntityUI` — never custom one-off empty messages
- Full-screen loading uses the shared `Spinner` from `@jet-admin/ui`
- Loading buttons show `<Spinner size={16} className="mr-2" />` in disabled state
- Do not pass undeclared props (`isFetching`, `refetch`, `isRefetching`) to `ReactQueryLoadingErrorWrapper`

### Canonical JSX

```jsx
<ReactQueryLoadingErrorWrapper isLoading={isLoading} error={error}>
  {rows.length
    ? <DataGrid {...gridProps} />
    : <NoEntityUI title="No records found" />
  }
</ReactQueryLoadingErrorWrapper>
```

---

## 11. Modals, Dialogs & Confirmation

### Rules

- Use shared `Dialog` from `@jet-admin/ui` for all modals
- There is **one** confirmation path for destructive actions — use the global `showConfirmation(...)` flow
- Do not create parallel ad-hoc confirmation dialogs
- Confirmation CTAs must use shared `Button` variants — never raw color classes
- Confirm action: `variant="destructive"` · Cancel action: `variant="outline"`

### Canonical Confirmation Footer

```jsx
<div className="flex justify-end gap-2">
  <Button variant="outline" onClick={onCancel}>Cancel</Button>
  <Button variant="destructive" onClick={onConfirm}>Delete</Button>
</div>
```

---

## 12. Icons

| Context | Library | Size |
|---|---|---|
| New generic UI & shared primitives | `lucide-react` | `h-4 w-4` |
| Button icons (with text) | `lucide-react` | `h-4 w-4 mr-2` |
| Button icons (icon-only) | `lucide-react` | `h-4 w-4` |
| Navigation / sidebar | `lucide-react` preferred | `h-4 w-4 mr-2` |
| Vendor / brand specific | `react-icons` only if Lucide lacks it | Match context |

**Rules:**
- `lucide-react` is the default for all new work
- Use `react-icons` only when a required icon does not exist in Lucide or is a vendor brand icon
- Do not mix both libraries on the same screen without a reason
- Never import from both libraries to do the same job

---

## 13. Shared Component Adoption

| Component | Status | Rule |
|---|---|---|
| `Button` | ✅ Strong | Always use; no raw overrides |
| `Input` | ✅ Strong | Always use; layout overrides only |
| `Spinner` | ✅ Strong | Use for all loading states |
| `Select` | ✅ Strong | Use for all dropdown selects |
| `Dialog` | ✅ Strong | Use for all modals |
| `Checkbox` | ✅ Strong | Use; do not re-implement |
| `Label` | ⚠️ Underused | Migrate all plain `<label>` usages |
| `Badge` | ⚠️ Underused | Use where status/tag chips appear |
| `AlertDialog` | ⚠️ Underused | Evaluate vs `showConfirmation` and pick one |
| `Textarea` | ⚠️ Underused | Use instead of custom overrides |

**Rule:** If a repeated override on a shared component is needed everywhere, it belongs back in `packages/ui` — not scattered in feature code.

---

## 14. Package-Level Rules

### `packages/json-forms-renderers`
- Must align with core form field anatomy: `Label` + shared `Input`/`Textarea` + error text
- Remove raw slate color overrides on inputs
- Replace `text-[#646cff]` with `text-primary`
- Replace local red delete buttons with `variant="destructive-ghost"`

### `packages/workflow-nodes`
- Highest divergence from product standards — treat as its own visual dialect for now
- New work inside this package should avoid inline style objects
- Replace `#646cff` save/config buttons with `variant="primary-ghost"` or `variant="default"`
- Track toward shared token usage as the package matures

### `packages/workflow-edges`
- Small surface area; inherit from workflow-nodes once that dialect is normalized

### `docs/src`
- Separate product entirely — Inter font, Docusaurus styles, its own brand tokens
- ✅ Not a violation; do not apply product-app rules here

---

## 15. Anti-Patterns — Never Do This

| ❌ Anti-pattern | ✅ Correct |
|---|---|
| `<button className="bg-blue-600 text-white px-4 py-2 rounded">` | `<Button>Submit</Button>` |
| `variant="destructive-outline"` (undefined) | `variant="destructive-ghost"` |
| `className="bg-white"` on page containers | `className="bg-background"` |
| `className="text-[#00203e]"` on UI text | `className="text-foreground"` |
| `<label htmlFor="x">Label</label>` (native) | `<Label htmlFor="x">Label</Label>` |
| `className="text-slate-700"` on shared components | `className="text-foreground"` |
| Separate `sx` per-screen for DataGrid theming | Shared centralized DataGrid theme |
| `bg-[#eaebff]` for active nav state | `bg-primary/10 text-primary` |
| Two different confirmation dialog patterns | One `showConfirmation(...)` flow |
| `react-icons` for a generic icon Lucide has | `lucide-react` equivalent |
| `max-w-[66%]` for centered forms | `max-w-2xl` |
| Passing undeclared props to `ReactQueryLoadingErrorWrapper` | Use the declared interface only |

---

## 16. Refactor Priority Order

| Priority | Task | Key Files |
|---|---|---|
| P0 | Remove `variant="destructive-outline"` (undefined) | `databaseTableRowsDeletionForm.jsx` |
| P0 | Replace raw button styles on auth + confirm flows | `signInPage/index.jsx`, `signUpPage/index.jsx`, `confirmationDialog.jsx` |
| P0 | Tokenize colors on high-traffic screens | drawers, auth pages, table banners |
| P1 | Migrate `<label>` to shared `Label` across all forms | auth pages, `datasourceEditor.jsx`, renderers |
| P1 | Standardize form field anatomy in JSON Forms renderers | `packages/json-forms-renderers` |
| P1 | Unify active nav state across all drawer components | `dashboardDrawerList/index.jsx` |
| P1 | Create shared DataGrid theme layer | `databaseTableGrid.jsx`, `databaseTableAppliedFilters.jsx` |
| P2 | Standardize icon library for new work on `lucide-react` | all new components |
| P2 | Increase `Label`, `Badge`, `AlertDialog` adoption | app-wide |
| P2 | Normalize `workflow-nodes` button and color usage | `startNode.jsx`, `conditionNode.jsx` |