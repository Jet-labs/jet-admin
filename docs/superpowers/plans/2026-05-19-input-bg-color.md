# Custom Input Background Color Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the background color of all inputs from the `Input` component of `@jet-admin/ui` to use a custom CSS color-mix rule with a proper CSS fallback.

**Architecture:** Introduce a new CSS variable `--input-foreground-default` under the `:root` pseudo-class and a custom class `.bg-input-custom` in `apps/frontend/src/index.css`. The custom class will have a fallback `background-color` using standard CSS variable interpolation and will override it inside a `@supports` block when `color-mix` is supported by the browser. Finally, update `packages/ui/src/components/input.jsx` to use `.bg-input-custom` in its `cva` class list.

**Tech Stack:** React, TailwindCSS, CSS Variables, CSS color-mix()

---

### Task 1: Update Global CSS stylesheet (`apps/frontend/src/index.css`)

**Files:**
- Modify: `apps/frontend/src/index.css`

- [ ] **Step 1: Add the `--input-foreground-default` variable to the `:root` scope**

Update the `:root` block (around lines 6-70) in `apps/frontend/src/index.css` to add the custom property.

```css
    --input-foreground-default: 0deg 0% 98%;
```

- [ ] **Step 2: Add the `.bg-input-custom` class definition and `@supports` block**

Append the following custom utility classes at the very end of `apps/frontend/src/index.css`:

```css
.bg-input-custom {
  background-color: hsl(var(--foreground) / 0.026);
}

@supports (color:color-mix(in lab, red, red)) {
  .bg-input-custom {
    background-color: color-mix(in oklab, hsl(var(--input-foreground-default)) 2.6%, transparent);
  }
}
```

- [ ] **Step 3: Commit CSS changes**

```bash
git add apps/frontend/src/index.css
git commit -m "style: add bg-input-custom with color-mix and fallback"
```

---

### Task 2: Update Input Component classes (`packages/ui/src/components/input.jsx`)

**Files:**
- Modify: `packages/ui/src/components/input.jsx`

- [ ] **Step 1: Update `inputVariants` base classes to use `bg-input-custom`**

Replace `bg-background` with `bg-input-custom` in the base string of `inputVariants` (around line 6) in `packages/ui/src/components/input.jsx`.

```javascript
const inputVariants = cva(
  "flex w-full rounded-sm border border-border bg-input-custom text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-border/80 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-8 px-2.5 py-1 text-sm",
        sm: "h-7 px-2 py-1 text-xs",
        lg: "h-10 px-3 py-2 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);
```

- [ ] **Step 2: Commit JS changes**

```bash
git add packages/ui/src/components/input.jsx
git commit -m "style: update Input component base styling with bg-input-custom"
```
