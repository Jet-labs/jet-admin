# jet-admin — Design System

> **Scope:** This document governs all UI work across the `jet-admin` monorepo. It defines
> jet-admin's design system, visual language, and component conventions.
> Tailwind **semantic tokens** (`bg-primary`, `text-foreground`, `border-border`, …) are the
> canonical way to express every design decision; raw hex values and arbitrary Tailwind classes
> (e.g. `bg-[#3ecf8e]`, `text-slate-500`) are **banned** except in the one allowed exception
> documented in §13.

---

## 1. Visual Identity Overview

jet-admin's design language is built for **clarity and technical precision**. Marketing and
product surfaces sit on a dark near-black canvas (`bg-background`) with near-white ink (`text-foreground`).
The only consistent chromatic event across the entire system is the **primary accent** —
used for filled CTAs, brand accents, and active-state indicators. Everything else is a calibrated
greyscale hierarchy.

Typography uses a geometric humanist sans at weight 500 for display, 400 for body, with tight
negative letter-spacing pulling display headings into editorial density. Product UI is always the
dominant decorative element — never photography, never atmospheric gradients.

**Key commitments:**
- Single primary accent as the only chromatic event; all else is monochrome.
- Dark canvas product track — no light-canvas marketing, no full-bleed gradients.
- Square-ish button radii (`rounded` / 6px) — never pill-shaped.
- Near-black text ON the primary button (the "lit surface" idiom) — never white-on-primary.
- Composited product UI mockups as decoration; compositing always uses `rounded` containers.
- Code blocks always in `bg-background` deep near-black with system mono.

---

## 2. Token Map — jet-admin Design Tokens

The table below is the authoritative mapping. Always use the jet-admin Tailwind token — never hard-code hex values.

| Concept | Hex | jet-admin Tailwind Token |
|---|---|---|
| `primary` (brand accent) | `#7582ff` | `bg-primary` / `text-primary` |
| `primary-deep` (pressed) | `#5c6aff` | `bg-primary/90` (hover/active modifier) |
| `primary-soft` | `#949fff` | `bg-primary/60` |
| `canvas` (page bg) | `#171717` | `bg-background` |
| `canvas-soft` | `#1f1f1f` | `bg-card` or `bg-muted/50` |
| `canvas-night` (dark surface) | `#171717` | `bg-background` or `bg-brand-black` |
| `canvas-night-soft` | `#242424` | `bg-muted/30` or `bg-muted/50` |
| `hairline` (default border) | `#2e2e2e` | `border-border` |
| `hairline-strong` | `#363636` | `border-border/80` |
| `hairline-cool` | `#242424` | `border-border/50` |
| `ink` (default text) | `#fafafa` | `text-foreground` |
| `ink-secondary` | `#b4b4b4` | `text-foreground/90` |
| `ink-mute` (secondary text) | `#898989` | `text-muted-foreground` |
| `ink-mute-2` (tertiary text) | `#4d4d4d` | `text-muted-foreground/70` |
| `ink-faint` (placeholder) | `#363636` | `text-muted-foreground/50` |
| `on-primary` (text on accent) | `#0f0f0f` | `text-brand-black` or `text-primary-foreground` |
| `on-dark` (text on night) | `#fafafa` | `text-foreground` |
| Accent purple | `#6b01c2` | Chart/logo use only — no Tailwind token |
| Accent yellow | `#ffdb13` | Status indicator only — no Tailwind token |

> **Rule:** Accent hues (purple, yellow, pink, crimson) are valid only inside chart renderers and
> integration logo strips. They must never become component background colors or button fills.

---

## 3. Colors — Usage Rules

### Primary (Brand Accent)
- `bg-primary` — filled CTA buttons and the brand wordmark accent **only**.
- `text-primary` — active-state labels, selected-state text, and "pill-tag" fills.
- `bg-primary/10` — selected/highlighted backgrounds (e.g. `ChartTypeSelector`, AND-logic chips).
- `border-primary` / `border-primary/30` — selected-state borders and focus rings.
- Keep primary **scarce** — aim for one `bg-primary` element per viewport section.

### Surface Hierarchy
```
bg-background     ← page root, card fills, default dark panels (code blocks)
bg-muted/50       ← alternating section bands, table row stripes
bg-muted/30       ← help callout containers, secondary panel fills
bg-card           ← elevated card surfaces (rendered above page bg)
bg-brand-black    ← deep dark panels (code blocks alternative)
bg-foreground     ← light featured panels (featured pricing tier / light inversion)
```

### Text Hierarchy
```
text-foreground           ← default body, headings (near-white)
text-foreground/90        ← slightly muted emphasis
text-muted-foreground     ← helper copy, section labels, captions
text-muted-foreground/70  ← tertiary copy
text-muted-foreground/50  ← placeholders, disabled
```

### Border Hierarchy
```
border-border      ← default card, input, table borders
border-border/80   ← slightly stronger borders for emphasis
border-border/50   ← hairline-cool — very fine chrome work
```

---

## 4. Typography

### Font Family
- **Display & UI:** Geometric humanist sans — **Circular** (proprietary). Open-source substitute: **Inter** at weight 500 with tight letter-spacing (see scale below). Do NOT use Helvetica defaults or system-ui for display.
- **Body:** Same family at weight 400, 0 letter-spacing.
- **Code:** System mono — `ui-monospace, Menlo, Monaco, Consolas, monospace`. No proprietary mono webfont.

### Type Scale
| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `display-xxl` | 64px / `text-6xl` | 500 | 1.1 | -1.92px | Hero headline |
| `display-xl` | 48px / `text-5xl` | 500 | 1.1 | -1.44px | Section opener |
| `display-lg` | 36px / `text-4xl` | 500 | 1.15 | -0.72px | Sub-section, pricing tier |
| `display-md` | 28px / `text-3xl` | 500 | 1.2 | -0.42px | Card title |
| `heading-lg` | 22px / `text-2xl` | 500 | 1.2 | 0 | Compact heading |
| `heading-md` | 18px / `text-lg` | 500 | 1.4 | 0 | Section sub-heading |
| `body-lg` | 18px / `text-lg` | 400 | 1.55 | 0 | Marketing body lead |
| `body-md` | 16px / `text-base` | 400 | 1.5 | 0 | Default UI body |
| `button-md` | 14px / `text-sm` | 500 | 1.0 | 0 | Button label |
| `caption` | 13px / `text-[13px]` | 400 | 1.45 | 0 | Helper, footnote |
| `micro` | 12px / `text-xs` | 400 | 1.45 | 0 | Pill label, fine print, section monolabels |
| `code` | 14px / `text-sm` | 400 | 1.5 | 0 | Code block content |

### Rules
- **Never exceed weight 500** on display headings — mid-weight reads as engineered, not decorative; 600+ breaks the brand.
- **Negative tracking on display only.** Apply `tracking-tight` or inline `letter-spacing` for display tiers; body and UI copy stay at 0.
- **Monospace everywhere code appears** — section configurators, vega spec editors, variable paths, inline code in callouts.
- The `font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground` pattern is the canonical section label style (see §§ 12–13). It maps to `micro` weight 600 — the one permitted weight exception at this micro scale.

---

## 5. Spacing

All spacing must use the tokens below — never use arbitrary values or ad-hoc paddings.

| Token | Value | Tailwind Class | Use |
|---|---|---|---|
| `xxs` | 2px | `p-0.5` / `gap-0.5` | Icon insets, fine chrome |
| `xs` | 4px | `p-1` / `gap-1` | Tight internal gaps |
| `sm` | 8px | `p-2` / `gap-2` | **Default** — cards, panels, forms, configurators |
| `md` | 12px | `p-3` / `gap-3` | Use sparingly; only when `p-2` is visually insufficient |
| `lg` | 16px | `p-4` / `gap-4` | Section headers, prominent UI groupings only |
| `xl` | 24px | `p-6` / `gap-6` | Navigation bar, top-level page chrome |
| `xxl` | 32px | `p-8` / `gap-8` | Reserved for marketing hero areas |
| `huge` | 64px | `p-16` / `gap-16` | Section vertical rhythm (marketing) |

### Spacing Directive — Agents Must Follow
> **REQUIRED:** Use `p-2` (`sm` / 8px) as the default padding for all cards, panels, forms, configurators, and UI containers. Use `gap-2` / `space-x-2` / `space-y-2` as the default gap between elements. Only step up to `p-3` or `p-4` when explicitly justified. Marketing section bands use `py-16` to `py-24` for vertical rhythm.

- **Feature / pricing cards:** `p-2`, `gap-2` or `space-y-2`/`space-x-2`.
- **Marketing section bands:** vertical padding `py-16` to `py-24` (64–96px).
- **Configurator panels:** `p-2`, `gap-2` or `space-y-2`/`space-x-2`.

---

## 6. Shape & Border Radius

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `sm` | 6px | `rounded` | **Default everywhere** — buttons, inputs, cards, alerts, dropdowns, modals, code blocks, product mockups |
| `full` | 9999px | `rounded-full` | Pills and avatars **only** |

> **Critical rules:**
> - Use `rounded` for **all** components and containers — buttons, inputs, cards, alerts, dropdowns, modals, code blocks, product mockups.
> - `rounded-full` is reserved **exclusively** for pill tags and avatars.
> - `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl` are **banned**.
> - Buttons are **never** pill-shaped (`rounded-full`). The 6px square-ish radius (`rounded`) is the brand signature.

---

## 7. Elevation & Shadow

| Level | CSS | Use |
|---|---|---|
| 0 | `border border-border` (flat, no shadow) | Default cards |
| 1 | `shadow-sm` (`0 1px 3px rgba(0,0,0,0.06)`) | Subtle card lift |
| 2 | `shadow-md` (`0 8px 24px rgba(0,0,0,0.08)`) | Floating product mockups |
| 3 | `shadow-lg` (`0 16px 48px rgba(0,0,0,0.12)`) | Modal overlays |

Depth comes from composited **product UI mockups**, not gradients. Never add atmospheric backdrop gradients to hero or section bands.

---

## 8. Core Components

### 8.1 Buttons

#### Primary (CTA)
```jsx
<Button type="button" onClick={handleAction} className="w-full">
  Get Started
</Button>
```
- Background `bg-primary`, text `text-foreground` (near-black — NOT white), `rounded` (6px), `text-sm font-medium`.
- Hover/pressed: `bg-primary/90`.
- **One per viewport section maximum.**

#### Secondary (Outline)
```jsx
<Button type="button" variant="outline">
  Learn More
</Button>
```
- Background `bg-background`, border `border-border`, text `text-foreground`, `rounded`.

#### Ghost (Active state)
```jsx
<Button type="button" variant="primary-ghost" size="sm">
  Browse
</Button>
```
- Used for toggle-active states inside configurators and vega builder.

#### On Dark
```jsx
<Button type="button" className="bg-foreground text-background">
  View Docs
</Button>
```
- Used on `bg-foreground` (canvas-night) surfaces — e.g. dark feature cards, code-block CTAs.

#### ❌ Banned button patterns
```jsx
/* Never: raw hex fill */
className="bg-[#646cff] text-white rounded-full px-4 py-2"

/* Never: pill shape */
className="rounded-full"

/* Never: white text on primary */
className="bg-primary text-white"

/* Never: any rounded variant other than rounded */
className="rounded rounded-md rounded-lg rounded-xl"
```

---

### 8.2 Cards

#### Feature Card (standard / default card)
```jsx
<div className="rounded border border-border bg-card p-2 space-y-2">
  {/* content */}
</div>
```

#### Feature Card (deep dark / code-heavy)
```jsx
<div className="roundedrder border-border bg-brand-black text-foreground p-2 space-y-2">
  {/* content */}
</div>
```

#### Pricing Card (standard)
```jsx
<div className="rounded border border-border bg-card p-2 flex flex-col gap-2">
  <p className="text-2xl font-medium tracking-tight text-foreground">Plan Name</p>
  <p className="text-3xl font-medium text-foreground">$X<span className="text-sm text-muted-foreground">/mo</span></p>
  {/* feature list */}
  <Button type="button" className="w-full mt-auto">Get Started</Button>
</div>
```

#### Pricing Card (featured / light inverted)
```jsx
<div className="rounded border border-border bg-foreground text-background p-2 flex flex-col gap-2">
  {/* same structure, text-background overrides */}
</div>
```
- The light inversion is the featured-tier treatment. Do NOT use `bg-primary` as the featured tier background — primary accent is reserved for buttons.

---

### 8.3 Code Blocks
```jsx
<div className="rounded bg-background text-foreground p-2 font-mono text-sm leading-relaxed border border-border">
  <code>{snippet}</code>
</div>
```
Inline code inside callouts:
```jsx
<code className="bg-background px-1 rounded border border-border font-mono text-xs">
  variable.path
</code>
```

---

### 8.4 Inputs & Forms
```jsx
<Input
  type="text"
  placeholder="Enter value…"
  className="w-full text-sm"
/>
```
- Background `bg-background`, border `border-border`, text `text-foreground`, placeholder `text-muted-foreground/50`.
- `rounded` (6px — matches button radius).
- Height ≥ 36px (WCAG AA touch target).
- Never override `bg-slate-50`, `border-slate-300`, or `placeholder:text-slate-400` — these are banned.

---

### 8.5 Pills & Tags

#### Primary pill (new / featured)
```jsx
<span className="bg-primary text-foreground text-xs font-medium px-2 py-0.5 rounded-full">
  New
</span>
```

#### Neutral pill
```jsx
<span className="bg-muted/50 text-foreground text-xs font-medium px-2 py-0.5 rounded-full">
  Tag
</span>
```

> Pills and avatars are the **only** components that use `rounded-full`.

---

### 8.6 Navigation Bar
```jsx
<nav className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
  <Logo />
  <NavLinks />
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="sm">Sign In</Button>
    <Button size="sm">Get Started</Button>
  </div>
</nav>
```

---

### 8.7 Footer
```jsx
<footer className="bg-background border-t border-border px-6 py-16 text-muted-foreground text-[13px]">
  {/* 4–5 column link grid + legal row */}
</footer>
```

---

## 9. Section Layout

```jsx
/* Marketing section band */
<section className="py-16 md:py-24 bg-background">
  <div className="max-w-6xl mx-auto px-6">
    {/* content */}
  </div>
</section>

/* Alternating tinted band */
<section className="py-16 md:py-24 bg-muted/50">
  {/* content */}
</section>
```

**Do NOT:** Add gradients, atmospheric backdrops, or full-bleed imagery to section bands. The dark canvas is the design.

---

## 10. Responsive Breakpoints

| Name | Width | Key changes |
|---|---|---|
| Wide | ≥ 1440px | Full container; mockups at full scale |
| Desktop | 1024–1440px | Default 1280px max-width; pricing 4-up |
| Tablet | 768–1023px | Pricing 2-up; mockups → single panel |
| Mobile | < 768px | Pricing 1-up; hamburger nav; display 64 → 36px |

Display type stair-steps: `text-6xl` → `text-5xl` → `text-4xl` → `text-3xl` → `text-2xl`.

---

## 11. Do's and Don'ts

### ✅ Do
- Use `bg-primary` for filled CTAs and wordmark accent — sparingly, once per section.
- Render display headings weight 500 with negative letter-spacing.
- Use `rounded` (6px) for **all** components — buttons, inputs, cards, modals, dropdowns.
- Use `rounded-full` **only** for pills and avatars.
- Use `text-foreground` (near-black) on `bg-primary` buttons — never white.
- Wrap product UI mockups in `rounded border border-border shadow-md`.
- Use system mono (`font-mono`) for every code surface.
- Use `p-2` and `gap-2` as the default spacing inside all components.

### ❌ Don't
- Don't introduce accent colors (purple, yellow, pink) as component fills or button backgrounds.
- Don't exceed font weight 500 on display headings.
- Don't use pill-shaped buttons (`rounded-full` on buttons).
- Don't use `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, or `rounded-2xl` anywhere.
- Don't use white text on `bg-primary`.
- Don't add atmospheric gradients to section bands or hero areas.
- Don't use `bg-white`, `bg-slate-50`, `border-slate-200`, or any raw `bg-[#hex]` in components.
- Don't use the `bg-primary` color for a featured pricing tier — use `bg-foreground` (dark inversion).
- Don't use `p-3`, `p-4`, `p-8`, `gap-3`, `gap-4`, `space-y-4` inside component UI — stick to `p-2` / `gap-2`.

---

## 12. Configurator Panel Patterns (`packages/workflow-nodes/src/nodes/*.jsx`)

> Canvas node cards (React Flow elements) are exempt from these rules.

### Save Button

Every configurator closes with a single full-width save button using `Button variant="default"`.

```jsx
/* ✅ Correct */
<Button type="button" onClick={handleSave} className="w-full">
  Save
</Button>

/* ❌ Wrong */
<Button
  type="button"
  onClick={handleSave}
  className="px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd]"
>
  Save
</Button>
```

### Secondary Actions (Test, Cancel)

```jsx
<div className="flex items-center gap-2">
  <Button type="button" variant="outline" size="sm" onClick={handleTest}>
    <FaPlay className="h-3 w-3" />
    Test
  </Button>
  <Button type="button" onClick={handleSave} className="flex-1">
    Save
  </Button>
</div>
```

### Section Labels Inside Configurators

```jsx
<p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
  Task Name
</p>
```

### Help Callout Containers

```jsx
<div className="rounded border border-border bg-muted/30 p-2 text-xs text-muted-foreground space-y-2">
  <div className="font-semibold text-xs text-foreground">📘 Title</div>
  {/* body */}
</div>
```

Rules:
- Background `bg-muted/30` — never `bg-slate-50` or `bg-white`.
- Border `border-border` — never `border-slate-200`.
- Inline code: `<code className="bg-background px-1 rounded border border-border font-mono">`.
- Primary callouts (tips): `bg-primary/5 border-primary/20 text-primary/80`.
- Warning callouts: `bg-amber-50 border-amber-200 text-amber-700`.

### Multiline Textareas

```jsx
import { Textarea } from '@jet-admin/ui';

<Textarea
  value={description}
  onChange={e => setDescription(e.target.value)}
  rows={2}
  placeholder="Describe what this node does…"
  className="resize-none"
/>
```

### AND/OR Logic Dividers

```jsx
<button className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${
  logic === 'AND'
    ? 'bg-primary/10 text-primary border-primary/30'
    : 'bg-amber-50 text-amber-600 border-amber-200'
}`}>{logic}</button>
```

- AND: `bg-primary/10 text-primary border-primary/30` — never `bg-indigo-50`.
- OR: `bg-amber-50 text-amber-600 border-amber-200`.

---

## 13. Vega Visual Builder Patterns (`packages/widgets-ui/vega`)

### Section Card Pattern

Do not define a local `Section` component. Instead, import and use the centralized component from `@jet-admin/ui`:

```jsx
import { Section } from "@jet-admin/ui";

// Usage:
<Section title="Identity" description="General information about your settings.">
  {children}
</Section>
```

```jsx
/* ❌ Banned: local definition or raw styled divs */
function Section({ title, children }) { ... }

<div className="bg-white border border-slate-200 p-3 rounded">
  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Title</h3>
```

### ChartTypeSelector — Selected State

```jsx
/* ✅ Correct */
className={isSelected
  ? 'bg-primary/10 border-primary text-primary shadow-sm'
  : 'bg-background border-border text-muted-foreground hover:bg-muted'
}

/* ❌ Wrong */
className={isSelected
  ? 'bg-blue-50 border-primary text-primary shadow-sm hover:bg-blue-100'
  : 'text-slate-500 border-slate-200 hover:bg-slate-50'
}
```

### VariableExplorer — CSS Variable Migration

All `--we-*` inline style variables are replaced with Tailwind semantic tokens:

| Old inline style | New Tailwind class |
|---|---|
| `style={{ background: 'var(--we-bg-primary, #fff)' }}` | `className="bg-background"` |
| `style={{ background: 'var(--we-bg-secondary, #f8f9fa)' }}` | `className="bg-muted/50"` |
| `style={{ border: '1px solid var(--we-border, #e2e8f0)' }}` | `className="border border-border"` |
| `style={{ color: 'var(--we-text-primary, #1e293b)' }}` | `className="text-foreground"` |
| `style={{ color: 'var(--we-text-secondary, #475569)' }}` | `className="text-muted-foreground"` |
| `style={{ color: 'var(--we-text-muted, #94a3b8)' }}` | `className="text-muted-foreground/60"` |
| `style={{ background: isSelected ? 'var(--we-bg-accent-light)' }}` | `className={isSelected ? 'bg-primary/10 text-primary border-l-2 border-primary' : ''}` |

### VariablePathPicker — Input Styling

```jsx
/* ✅ Correct */
<Input
  type="text"
  value={parsedValue.variablePath}
  onChange={handleInputChange}
  placeholder={placeholder}
  className="w-full text-xs font-mono"
/>

/* ❌ Wrong */
<Input
  type="text"
  className="placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded block py-1.5 px-2 focus:outline-none focus:border-slate-400"
/>
```

### Browse and Transform Buttons

```jsx
<Button
  type="button"
  variant={showExplorer ? 'primary-ghost' : 'outline'}
  size="sm"
  onClick={() => setShowExplorer(!showExplorer)}
>
  Browse
</Button>
```

### Suggestions Dropdown

```jsx
<div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded shadow-lg max-h-48 overflow-auto">
  {suggestions.map(s => (
    <div
      key={s.id}
      className="px-2 py-1.5 text-xs hover:bg-muted flex items-center justify-between gap-2 border-b border-border last:border-0 cursor-pointer transition-colors"
    >
      {/* content */}
    </div>
  ))}
</div>
```

### Label Component

```jsx
/* ✅ Correct */
import { Label } from "@jet-admin/ui";
<Label className="text-xs font-medium text-muted-foreground">Chart Title</Label>

/* ❌ Wrong */
<label className="block text-xs font-medium text-slate-500 mb-1">Chart Title</label>
```

### EncodingChannelEditor Card

```jsx
/* ✅ Correct */
<div className="rounded border border-border bg-card overflow-hidden shadow-sm">
  <div className="flex items-center justify-between p-2 bg-muted/50 border-b border-border">

/* ❌ Wrong */
<div className="border border-slate-200 rounded bg-white overflow-hidden shadow-sm">
  <div className="flex items-center justify-between p-2 bg-slate-50 border-b border-slate-200">
```

### vegaSpecEditor.jsx — Inline `S` Style Object (Allowed Exception)

The `VegaSpecEditor` component retains an inline `S` style object for Monaco-level chrome (header
bar, template grid, error strip). This is the **only** permitted inline style exception across the
entire codebase — Monaco's embedding context prevents reliable CSS class application. Do NOT
replicate this pattern in any other component. Migrate when a Monaco wrapper primitive is available
in `@jet-admin/ui`.

---

## 14. Banned Patterns (Global)

The following are banned across the entire monorepo, regardless of context:

```
bg-white          → bg-background
bg-slate-50       → bg-muted/50
bg-slate-100      → bg-muted
border-slate-*    → border-border (with opacity modifier as needed)
text-slate-*      → text-foreground or text-muted-foreground
bg-blue-50        → bg-primary/10
bg-indigo-50      → bg-primary/10
bg-[#646cff]      → bg-primary
text-white (on primary button) → text-foreground
rounded           → rounded
rounded-md        → rounded
rounded-lg        → rounded
rounded-xl        → rounded
rounded-2xl       → rounded
rounded-full (on anything except pills/avatars) → rounded
font-weight 600+  → font-medium (500) on display headings
p-3 / p-4 / p-8   → p-2 (preferably, except for section vertical padding)
gap-3 / gap-4     → gap-2 (preferably)
space-y-4         → space-y-2 (preferably)
```

---

## 15. Linting

Run after every design change:

```bash
npx @google/design.md lint UI_GUIDELINES_V3.md
```

Default body references must use `body-md` / `text-base`. Code surfaces must use `code` / `font-mono`. Spacing must preferably use `p-2`, `space-x-2`/`space-y-2`, and `gap-2` wherever possible. Keep primary accent scarce — one `bg-primary` filled element per viewport section is the target.

---

## 29. Component Sizing Rules (Inputs, Selects, Buttons)
To prevent mismatched heights when placing form controls side-by-side, we strictly enforce fixed heights across foundational components:
- **Default Size (`size="default"`)**: 32px height (`h-8`). Use for standard forms and panels.
  - `<Input />`, `<Select />`, and `<Button />` (default) all resolve to exactly 32px.
- **Small Size (`size="sm"`)**: 28px height (`h-7`). Use for dense lists, data tables, and secondary configurators.
  - `<Input size="sm" />` and `<Button size="sm" />` resolve to 28px.
- **Large Size (`size="lg"`)**: 40px height (`h-10`). Use for primary actions like login/signup or prominent search bars.
  - `<Input size="lg" />` and `<Button size="lg" />` resolve to 40px.

**Rule:** When placing a Button next to an Input or Select, ensure their `size` props match perfectly. Never place a `size="sm"` Button next to a default `Input`.