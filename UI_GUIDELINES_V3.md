# UI Guidelines

> Single source of truth for all UI decisions across `apps/frontend`, `packages/ui`,
> `packages/json-forms-renderers`, `packages/workflow-nodes`, and `packages/workflow-edges`.
> Grounded in the actual codebase audit (v2) and extended with patterns established during
> the cron job module refactor. Every rule here either already exists as the dominant pattern
> or is the canonical resolution of a measured inconsistency.

---

## 1. Core Principles

1. **Shared primitives first.** Always reach for `@jet-admin/ui` before writing raw Tailwind.
2. **Semantic tokens over raw colors.** If a token exists for it, use the token.
3. **Compact admin density.** This is a data-heavy admin product. Dense > spacious.
4. **One pattern per problem.** One form field structure, one confirmation flow, one nav pattern.
5. **No visual re-skinning of shared components.** Layout overrides are allowed; color/font overrides are not.
6. **Orthogonal props over magic values.** Each prop should control exactly one dimension (e.g. `size` controls height, `square` controls shape — never collapse both into one value like `icon`).
7. **Nullish over falsy.** Use `??` not `||` when the value can legitimately be `0` or `false`.

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
- Outer padding is `p-4 md:p-8` (use `p-4 md:p-6` for tighter admin views)
- Background is `bg-background` — never `bg-white`, `bg-card`, or `bg-slate-50`
- No box shadows, no card borders on primary form containers

### Page Header

Every add/update page uses the same compact two-line header with actions in the header row.
This keeps action buttons (save, delete, navigate) at eye level alongside context.

```jsx
{/* Add form — no actions needed in header */}
<div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
  <div>
    <h1 className="text-base font-semibold tracking-tight text-foreground">
      Add Scheduled Job
    </h1>
    <p className="mt-0.5 text-xs text-muted-foreground">
      Define a new scheduled job and attach it to a workflow.
    </p>
  </div>
</div>

{/* Update form — actions live in the header row */}
<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
  <div>
    <h1 className="text-base font-semibold tracking-tight text-foreground">
      Edit Scheduled Job
    </h1>
    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
      ID: {entityID}
    </p>
  </div>
  <div className="flex flex-wrap items-center gap-2">
    <Button variant="outline" size="sm" asChild>
      <Link to={historyPath}>View History</Link>
    </Button>
    <Button variant="destructive-ghost" size="sm" square onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
    <Button type="submit" size="sm" form="entity-form" disabled={isPending}>
      {isPending && <Spinner size={14} />}
      Save Changes
    </Button>
  </div>
</div>
```

**Rules:**
- Header is always `border-b border-border bg-background px-4 py-3`
- Title is `text-base font-semibold tracking-tight text-foreground` — not `text-2xl`
- Subtitle / metadata line is `text-xs text-muted-foreground`
- IDs, cron expressions, and other technical identifiers in the subtitle use `font-mono`
- All action buttons in the header use `size="sm"` — they sit in a compact header, not a page footer
- Never separate header metadata from header actions into two different DOM regions

---

## 3. Typography

| Role | Class |
|---|---|
| Page title (header) | `text-base font-semibold tracking-tight text-foreground` |
| Section header | `text-lg font-semibold` |
| Section label / field label | `text-sm font-medium` |
| Body / helper text | `text-sm` |
| Muted / supporting copy | `text-sm text-muted-foreground` |
| Metadata / microcopy | `text-xs` |
| Metadata with accent | `text-xs text-primary` |
| Monospace label (IDs, expressions, code) | `font-mono text-xs text-muted-foreground` |
| Section category label (form group heading) | `font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground` |

**Rules:**
- App font is **Poppins** — set globally in `apps/frontend/src/index.css`, do not override
- Docs site (`docs/src`) uses Inter and is a separate dialect — its rules do not apply to the product app
- Do not mix `font-bold` and `font-semibold` for the same role across screens
- Use `font-mono` for all machine-generated or technical values: IDs, cron expressions, timestamps, version strings, API keys

### Canonical JSX

```jsx
<header className="space-y-1">
  <h1 className="text-base font-semibold tracking-tight text-foreground">Page Title</h1>
  <p className="text-xs text-muted-foreground">Supporting description</p>
</header>
```

---

## 4. Color & Token System

### Always use semantic tokens for app surfaces

| Use | Token |
|---|---|
| Page / panel background | `bg-background` |
| Primary text | `text-foreground` |
| Supporting / muted text | `text-muted-foreground` |
| Borders | `border-border` |
| Muted fills | `bg-muted` |
| Brand / active accent | `text-primary`, `bg-primary` |
| Destructive actions | `text-destructive`, `bg-destructive` |

### Do NOT use raw colors on app surfaces

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
| Card / box padding | `p-3` or `p-4` |
| Section card padding | `p-4` with `space-y-3` inside |
| Section-level separation | `space-y-6` only for visually distinct sections |
| Dense table / drawer padding | `p-2` or `p-2.5` |

**Rules:**
- Prefer `gap-*` and `space-y-*` over manual `mb-*` / `mt-*` whenever items are siblings
- Use `mb-2` / `mt-2` only for specific single-element offsets
- Never use `space-y-6` between tightly related form fields

---

## 6. Buttons

### The `Button` Component

```typescript
// Props
variant?: "default" | "destructive" | "destructive-ghost" | "primary-ghost"
        | "primary-outline" | "outline" | "secondary" | "ghost" | "link"
size?:    "default" | "sm" | "lg"   // controls height only
square?:  boolean                    // makes width = height (for icon-only buttons)
```

**`size` and `square` are orthogonal.** `size` sets the height. `square` removes horizontal padding and pins `width = height`. You can have any combination: `size="sm" square` gives a `28×28px` button, `size="default" square` gives `32×32px`. There is no longer a dedicated `icon` size — this was removed because it forced you to remember a paired name (`icon-sm`) instead of just composing the two props you already needed.

### Implementation

```jsx
// packages/ui/src/components/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:           "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:       "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        "destructive-ghost": "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60",
        "primary-ghost":   "bg-primary/10 text-primary hover:bg-primary/20",
        "primary-outline": "border border-primary bg-background text-primary hover:bg-primary/10",
        outline:           "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:         "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:             "hover:bg-accent hover:text-accent-foreground",
        link:              "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3",
        sm:      "h-7 px-2.5 text-xs",
        lg:      "h-10 px-5 text-base",
      },
      square: {
        true: "px-0",
      },
    },
    compoundVariants: [
      { square: true, size: "default", className: "w-8"  },
      { square: true, size: "sm",      className: "w-7"  },
      { square: true, size: "lg",      className: "w-10" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      square: false,
    },
  }
);
```

**Key implementation notes:**
- `gap-1.5` is in the base class — icons and text inside buttons always space consistently. Do **not** use `mr-2` on icons inside buttons.
- `default` variant hover is `bg-primary/90` — not `/10` (which is the ghost hover, not a filled button hover)
- `secondary` hover is `bg-secondary/80` — same reason
- `rounded-md` is in the base class — do not declare it again in `sm` or `lg`
- `py-*` is not needed when height is fixed with `h-*`

### Variants — When to Use Each

| Variant | Use case |
|---|---|
| `default` (omitted) | Primary page CTA, form submit, prominent action |
| `outline` | Cancel / secondary action alongside a primary |
| `ghost` | Inline tertiary actions with no visual weight needed |
| `primary-ghost` | Add / secondary row actions in toolbars, drawers, and list headers |
| `primary-outline` | Secondary CTA that needs visible border weight |
| `destructive` | Full destructive CTA (e.g. confirm deletion button inside a dialog) |
| `destructive-ghost` | Compact icon-only delete button in rows, panels, and header action rows |
| `link` | Navigation-styled text action |

### Sizes — When to Use Each

| Size | Use case | Height |
|---|---|---|
| `default` (omitted) | Top-level page CTAs, auth forms, entity form submit | `h-8` |
| `sm` | Page header action rows, dense tables, toolbars, drawers, builder panels | `h-7` |
| `lg` | Avoid in product UI; use only for major empty-state CTAs | `h-10` |
| `square` (boolean) | Any icon-only button — combine with the appropriate `size` | matches `size` |

### Sizing Consistency Rule

**Within any single action row, all buttons must share the same `size`.** The most common conflict is placing a `size="sm"` text button next to a `size="default" square` icon button — they will be 28px vs 32px tall. The correct fix is `size="sm" square` for the icon button, not upgrading the text buttons to `default`.

```jsx
{/* ✅ Correct — all three are h-7 */}
<div className="flex items-center gap-2">
  <Button variant="outline" size="sm" asChild>
    <Link to={historyPath}>View History</Link>
  </Button>
  <Button variant="destructive-ghost" size="sm" square>
    <Trash2 className="h-4 w-4" />
  </Button>
  <Button size="sm" type="submit" form="my-form">Save</Button>
</div>

{/* ❌ Wrong — delete button is h-8, others are h-7 */}
<div className="flex items-center gap-2">
  <Button variant="outline" size="sm">View History</Button>
  <Button variant="destructive-ghost" square>  {/* defaults to size="default" → h-8 */}
    <Trash2 className="h-4 w-4" />
  </Button>
  <Button size="sm">Save</Button>
</div>
```

### Additional Rules

- Always import `Button` from `@jet-admin/ui`
- Never override button colors with raw Tailwind on feature screens
- Icons inside buttons do not need `mr-2` — `gap-1.5` on the base handles spacing automatically
- Icons inside buttons are always `h-4 w-4`
- Do not use undefined variants — `destructive-outline` does not exist; use `destructive-ghost`
- Loading buttons show `<Spinner size={14} />` (not `size={16}`) when used in `size="sm"` contexts

### Canonical JSX

```jsx
{/* Toolbar actions */}
<div className="flex items-center gap-2">
  <Button size="sm" variant="primary-ghost">
    <Plus className="h-4 w-4" />
    Add item
  </Button>
  <Button size="sm" variant="outline">Cancel</Button>
  <Button size="sm" variant="destructive-ghost" square>
    <Trash2 className="h-4 w-4" />
  </Button>
</div>

{/* Primary form submit (outside header) */}
<div className="flex justify-end">
  <Button type="submit" disabled={isPending}>
    {isPending && <Spinner size={14} />}
    Save Changes
  </Button>
</div>

{/* Top-level update form header action row */}
<div className="flex items-center gap-2">
  <Button variant="outline" size="sm" asChild>
    <Link to={historyPath}>View History</Link>
  </Button>
  <Button variant="destructive-ghost" size="sm" square onClick={handleDelete}>
    <Trash2 className="h-4 w-4" />
  </Button>
  <Button size="sm" form="update-form" type="submit" disabled={isPending}>
    {isPending && <Spinner size={14} />}
    Update
  </Button>
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
- Always add `noValidate` to `<form>` elements that use JS validation (Formik, RHF) — prevents browser native validation UI from conflicting
- Use `??` (nullish coalescing) for numeric field values, not `||`. `value={field.value ?? ""}` correctly allows `0`; `value={field.value || ""}` wrongly replaces `0` with `""`

### Required Field Indicator

```jsx
<Label htmlFor="field-id">
  Title <span className="text-destructive">*</span>
</Label>
```

### Form Section Cards

Group logically related fields into named section cards. This replaces the flat
unstyled `space-y-4` stack for any form that has more than two logical groups.

```jsx
{/* Reusable Section wrapper */}
function Section({ title, description, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {(title || description) && (
        <div>
          {title && (
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              {title}
            </p>
          )}
          {description && (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

{/* Usage */}
<div className="space-y-3">
  <Section title="Identity">
    <div className="space-y-1.5">
      <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
      <Input id="name" />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="description">Description</Label>
      <Input id="description" />
    </div>
  </Section>

  <Section title="Schedule" description="Configure when this job runs.">
    {/* ... */}
  </Section>
</div>
```

**Rules:**
- Section cards use `rounded-lg border border-border bg-card p-4`
- The section heading is `font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground`
- The section description is `text-[11px] text-muted-foreground`
- Use `space-y-3` between fields inside a section
- Use `space-y-3` between section cards

### FieldError Helper

Extract form error rendering into a shared helper rather than repeating the conditional inline:

```jsx
function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}

{/* Usage */}
<div className="space-y-1.5">
  <Label htmlFor="title">Title</Label>
  <Input id="title" name="title" onChange={form.handleChange} value={form.values.title} />
  <FieldError message={form.touched.title && form.errors.title} />
</div>
```

### Monospace Labels for Technical Fields

Fields whose values are technical (cron expressions, durations in seconds, counts, IDs) use
a monospace category label above the input rather than a standard `Label`:

```jsx
<span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
  Timeout (s)
</span>
<Input type="number" ... className="font-mono" />
```

### Form Container

```jsx
<form onSubmit={form.handleSubmit} noValidate>
  <div className="space-y-3">
    <Section title="Identity">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
        <Input id="name" name="name" onChange={form.handleChange} value={form.values.name} />
        <FieldError message={form.touched.name && form.errors.name} />
      </div>
    </Section>
  </div>

  <div className="mt-4 flex justify-end">
    <Button type="submit" disabled={isPending}>
      {isPending && <Spinner size={14} />}
      Save
    </Button>
  </div>
</form>
```

### Mutation Callbacks

Always call `form.resetForm()` inside `onSuccess` for addition forms. Update forms do not
reset — they re-populate from the server response.

```jsx
const { mutate } = useMutation({
  mutationFn: createEntity,
  onSuccess: () => {
    displaySuccess("Entity created.");
    queryClient.invalidateQueries([QUERY_KEY]);
    form.resetForm(); // ← required for add forms
  },
  onError: displayError,
});
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

### Shared DataGrid Theme

Do **not** put `sx` objects on individual screens. Extract them into a shared constant and import it wherever `DataGrid` is used. This is the single source of truth for all DataGrid chrome styling.

```jsx
// shared/dataGridTheme.js  ← canonical location
export const DATAGRID_SX = {
  border: 0,
  "--unstable_DataGrid-radius": "0.5rem",
  "& .MuiDataGrid-root": { borderRadius: 0 },
  "& .MuiIconButton-root": { outline: "none" },
  "& .MuiDataGrid-cell": {
    fontSize: "0.8125rem",
    lineHeight: "1.25rem",
    fontWeight: "400",
    padding: "8px 10px",
    maxHeight: "none !important",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "hsl(var(--muted) / 0.5)",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  "& .MuiCheckbox-root": { padding: "4px" },
  "& .MuiDataGrid-columnHeaderCheckbox, & .MuiDataGrid-cellCheckbox": {
    minWidth: "auto !important",
    width: "auto !important",
    flex: "0 0 auto !important",
    padding: "0.25rem !important",
  },
  "& .MuiDataGrid-cellCheckbox": { color: "hsl(var(--primary))" },
  "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer": {
    width: "auto",
    minWidth: "auto",
    flex: "none",
  },
};

// Usage
import { DATAGRID_SX } from "@/shared/dataGridTheme";
<DataGrid sx={DATAGRID_SX} getRowHeight={() => "auto"} ... />
```

**Additional DataGrid rules:**
- Always set `getRowHeight={() => "auto"}` so cells with multi-line or complex content (JSON, long text) are not clipped
- Empty state inside tables always uses `NoEntityUI` — never a custom inline message
- All chrome around the grid (toolbar, filters, banners) must use shared `@jet-admin/ui` primitives

### Column Definitions

Keep column definitions in a dedicated formatter file, not inline in the grid component.
Columns should use concise `renderCell` arrow functions. Avoid `valueGetter` when the
raw value is already the correct type.

```jsx
// ✅ Clean column definition
{
  field: "status",
  headerName: "Status",
  width: 140,
  headerAlign: "left",
  align: "left",
  renderCell: ({ value }) => <StatusBadge value={value} />,
}

// ❌ Unnecessary boilerplate
{
  field: "status",
  valueGetter: (value) => { return value; },  // pointless
  renderCell: (params) => {
    return (
      <div className="w-fit flex h-full flex-row justify-start items-center">
        {params.value}
      </div>
    );
  },
}
```

### Status Badges

Status values (success, failed, running, pending, cancelled, error) must always render as
coloured badges with a matching icon — never as plain text. Use the shared `Badge` component
from `@jet-admin/ui` where possible, or the pattern below.

```jsx
const STATUS_CONFIG = {
  success:   { icon: CheckCircle,  className: "text-green-600 dark:text-green-400",  bg: "bg-green-50  dark:bg-green-950/40  border-green-200  dark:border-green-800"  },
  failed:    { icon: XCircle,      className: "text-red-600   dark:text-red-400",    bg: "bg-red-50    dark:bg-red-950/40    border-red-200    dark:border-red-800"    },
  error:     { icon: XCircle,      className: "text-red-600   dark:text-red-400",    bg: "bg-red-50    dark:bg-red-950/40    border-red-200    dark:border-red-800"    },
  running:   { icon: Clock,        className: "text-blue-600  dark:text-blue-400",   bg: "bg-blue-50   dark:bg-blue-950/40   border-blue-200   dark:border-blue-800"  },
  pending:   { icon: Clock,        className: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50  dark:bg-amber-950/40  border-amber-200  dark:border-amber-800" },
  cancelled: { icon: Ban,          className: "text-gray-500  dark:text-gray-400",   bg: "bg-gray-50   dark:bg-gray-900/40   border-gray-200   dark:border-gray-700"  },
};

function StatusBadge({ value }) {
  const key = (value ?? "").toLowerCase();
  const config = STATUS_CONFIG[key] ?? { icon: Clock, className: "text-muted-foreground", bg: "bg-muted border-border" };
  const Icon = config.icon;
  return (
    <div className="flex h-full items-center">
      <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium capitalize ${config.bg} ${config.className}`}>
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        {value ?? "—"}
      </span>
    </div>
  );
}
```

### Date & Time Formatting

Use `date-fns` for all date formatting in column renderers and UI. Do not use `moment` for new work — it is not tree-shakeable.

```jsx
import { format, parseISO, isValid } from "date-fns";

function safeDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : parseISO(value);
  return isValid(d) ? d : null;
}

// Display format: "Mar 28, 2026 · 14:03:00"
function formatDateTime(value) {
  const d = safeDate(value);
  return d ? format(d, "MMM d, yyyy · HH:mm:ss") : "—";
}

// In column definitions:
{
  field: "startTime",
  type: "dateTime",             // use "dateTime" not "date" for full timestamps
  valueGetter: (value) => safeDate(value),
  renderCell: ({ value }) => (
    <span className="font-mono text-xs tabular-nums text-foreground">
      {formatDateTime(value)}
    </span>
  ),
}
```

**Rules:**
- All timestamps render in monospace with `tabular-nums` so columns align
- Null / invalid dates always render as `"—"` (em dash), never `""`, `"N/A"`, or a blank cell
- Column type must be `"dateTime"` for full timestamp fields to enable correct MUI sorting

### Canonical Table Chrome

```jsx
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Button size="sm" variant="primary-ghost">
        <Plus className="h-4 w-4" />
        Add row
      </Button>
    </div>
    <Button size="sm" variant="outline">Filters</Button>
  </div>
  <DataGrid sx={DATAGRID_SX} getRowHeight={() => "auto"} {...gridProps} />
</div>
```

---

## 10. Loading, Empty & Error States

**Rules:**
- Query-backed screens must render through `ReactQueryLoadingErrorWrapper`
- Empty states always use `NoEntityUI` — never custom one-off empty messages
- Full-screen loading uses the shared `Spinner` from `@jet-admin/ui`
- Loading buttons show `<Spinner size={14} />` (not `size={16}`) in disabled state — the spinner should match the line height of the button label
- Do not pass undeclared props (`isFetching`, `refetch`, `isRefetching`) to `ReactQueryLoadingErrorWrapper`

### Empty State Messages

Write empty state messages that explain the *state*, not just the absence:

```jsx
// ✅ Informative
<NoEntityUI message="No execution history yet. This job hasn't run." />
<NoEntityUI message="No workflows found. Create one to get started." />

// ❌ Generic
<NoEntityUI message="No data available." />
```

### Canonical JSX

```jsx
<ReactQueryLoadingErrorWrapper isLoading={isLoading} error={error}>
  {rows.length
    ? <DataGrid sx={DATAGRID_SX} {...gridProps} />
    : <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-6">
        <NoEntityUI message="No records found." />
      </div>
  }
</ReactQueryLoadingErrorWrapper>
```

---

## 11. Modals, Dialogs & Confirmation

**Rules:**
- Use shared `Dialog` from `@jet-admin/ui` for all modals
- There is **one** confirmation path for destructive actions — use the global `showConfirmation(...)` flow
- Do not create parallel ad-hoc confirmation dialogs
- Confirmation CTAs must use shared `Button` variants — never raw color classes
- Confirm action: `variant="destructive"` · Cancel action: `variant="outline"`

### Confirmation Guard

`showConfirmation` returns a promise that resolves to `true` (confirmed) or `false`/rejects (cancelled). Always check the return value. This was a real bug in the codebase — omitting the guard means the destructive action fires on cancel too.

```jsx
// ✅ Correct — guard the result
const handleDelete = async () => {
  const confirmed = await showConfirmation({
    title: "Delete scheduled job",
    message: "This cannot be undone.",
    confirmText: "Delete",
    cancelText: "Cancel",
  });
  if (!confirmed) return;
  deleteMutation();
};

// ❌ Wrong — fires delete even when user cancels
const handleDelete = async () => {
  await showConfirmation({ ... }); // return value ignored
  deleteMutation();                // always runs
};
```

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
| All new generic UI & shared primitives | `lucide-react` | `h-4 w-4` |
| Button icons (with text) | `lucide-react` | `h-4 w-4` (gap handled by button base) |
| Button icons (icon-only / `square`) | `lucide-react` | `h-4 w-4` |
| Status badge icons | `lucide-react` | `h-3.5 w-3.5` |
| Navigation / sidebar | `lucide-react` preferred | `h-4 w-4` |
| Vendor / brand specific | `react-icons` only if Lucide lacks it | Match context |

**Rules:**
- `lucide-react` is the default for all new work
- Use `react-icons` only when a required icon does not exist in Lucide or is a vendor brand icon
- Do not mix both libraries on the same screen without a reason
- Never import from both libraries to do the same job
- Icons inside buttons no longer need `mr-2` — the `gap-1.5` base class handles spacing

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
| `Badge` | ⚠️ Underused | Use for status chips, tags, and run counts |
| `AlertDialog` | ⚠️ Underused | Evaluate vs `showConfirmation` and pick one |
| `Textarea` | ⚠️ Underused | Use instead of custom overrides |

**Rule:** If a repeated override on a shared component is needed everywhere, it belongs back in `packages/ui` — not scattered in feature code.

---

## 14. Code Quality Conventions

These are not stylistic preferences — they prevent real bugs and inconsistencies.

### Nullish Coalescing

Use `??` instead of `||` wherever a value can legitimately be `0`, `false`, or `""`.

```jsx
// ✅ Correct — 0 retries is valid
value={form.values.retryAttempts ?? ""}

// ❌ Wrong — 0 becomes "" and displays as placeholder
value={form.values.retryAttempts || ""}
```

### useEffect Dependencies

When populating a form from a query result using `form.setValues(...)`, the form instance
is intentionally omitted from the dependency array (it is stable but changes object identity
on every render). Always leave an explicit eslint comment explaining *why*:

```jsx
useEffect(() => {
  if (entity?.id) {
    form.setValues({ ... });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // form.setValues is stable but the form instance changes identity on every render
}, [entity]);
```

### Remove Unused Refs and Imports

Before shipping any component, delete: unused `useRef` instances, unused library imports,
dead `console.log` / commented-out code blocks, and schema-inference libs imported only
to drive column generation (`to-json-schema` is not needed when columns are statically defined).

### memoization Granularity

Memoize on the exact value that drives the computation, not the whole parent object:

```jsx
// ✅ Only re-runs when workflowID changes
const selectedWorkflow = useMemo(
  () => workflows?.find(w => String(w.id) === String(form.values.workflowID)) ?? null,
  [workflows, form.values.workflowID]
);

// ❌ Re-runs on every keystroke because form.values is a new object reference each time
const selectedWorkflow = useMemo(
  () => ...,
  [workflows, form.values]
);
```

---

## 15. Package-Level Rules

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
- Not a violation; do not apply product-app rules here

---

## 16. Anti-Patterns — Never Do This

| ❌ Anti-pattern | ✅ Correct |
|---|---|
| `<button className="bg-blue-600 text-white px-4 py-2 rounded">` | `<Button>Submit</Button>` |
| `variant="destructive-outline"` (undefined) | `variant="destructive-ghost"` |
| `className="bg-white"` on page containers | `className="bg-background"` |
| `className="text-[#00203e]"` on UI text | `className="text-foreground"` |
| `<label htmlFor="x">Label</label>` (native) | `<Label htmlFor="x">Label</Label>` |
| `className="text-slate-700"` on shared components | `className="text-foreground"` |
| Separate `sx` per-screen for DataGrid theming | Import shared `DATAGRID_SX` constant |
| `bg-[#eaebff]` for active nav state | `bg-primary/10 text-primary` |
| Two different confirmation dialog patterns | One `showConfirmation(...)` flow |
| `await showConfirmation(...)` without checking the return value | `const confirmed = await showConfirmation(...); if (!confirmed) return;` |
| `react-icons` for a generic icon Lucide has | `lucide-react` equivalent |
| `max-w-[66%]` for centered forms | `max-w-2xl` |
| `value={field ?? \|\| ""}` for numeric inputs | `value={field ?? ""}` |
| Passing undeclared props to `ReactQueryLoadingErrorWrapper` | Use the declared interface only |
| `size="sm"
      square` and `size="icon-sm"` as separate size values | `size="sm" square` or `size="default" square` |
| `sm` text buttons next to `default` icon buttons in the same row | Match `size` across the entire row |
| `<Spinner size={16} className="mr-2" />` in a `size="sm"` button | `<Spinner size={14} />` (gap handled by base class) |
| `import moment from "moment"` in new column formatters | `import { format, parseISO, isValid } from "date-fns"` |
| `text-2xl font-semibold` for page headers | `text-base font-semibold tracking-tight` |
| `<h1 className="text-2xl ...">` in page header with no subtitle | Two-line header: title + `text-xs text-muted-foreground` subtitle |

---

## 17. Refactor Priority Order

| Priority | Task | Key Files |
|---|---|---|
| P0 | Remove `variant="destructive-outline"` (undefined) | `databaseTableRowsDeletionForm.jsx` |
| P0 | Replace raw button styles on auth + confirm flows | `signInPage/index.jsx`, `signUpPage/index.jsx`, `confirmationDialog.jsx` |
| P0 | Tokenize colors on high-traffic screens | drawers, auth pages, table banners |
| P0 | Fix `showConfirmation` guards — check return value before mutating | any screen using `await showConfirmation(...)` |
| P1 | Centralize DataGrid sx into shared `DATAGRID_SX` | `databaseTableGrid.jsx`, `cronJobHistoryGrid.jsx`, all grid screens |
| P1 | Migrate `<label>` to shared `Label` across all forms | auth pages, `datasourceEditor.jsx`, renderers |
| P1 | Standardize form field anatomy in JSON Forms renderers | `packages/json-forms-renderers` |
| P1 | Unify active nav state across all drawer components | `dashboardDrawerList/index.jsx` |
| P1 | Replace `moment` with `date-fns` in all column formatters | all `*GridColumnFormatter.jsx` files |
| P2 | Standardize icon library for new work on `lucide-react` | all new components |
| P2 | Increase `Label`, `Badge`, `AlertDialog` adoption | app-wide |
| P2 | Normalize `workflow-nodes` button and color usage | `startNode.jsx`, `conditionNode.jsx` |
| P2 | Adopt section card pattern on all multi-group add/update forms | all entity editor forms |