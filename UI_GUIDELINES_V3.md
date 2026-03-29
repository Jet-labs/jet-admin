---

## 18. Workflow Node Configurator Patterns

These rules apply to configurator panels in `packages/workflow-nodes/src/nodes/*.jsx`.
The canvas node cards (the visible React Flow elements) have their own dialect and are exempt.

### Save Button

Every node configurator closes with a single save button using `Button variant="default"` spanning full width. No raw color classes — `bg-[#646cff]` is banned.

```jsx
/* ✅ Correct */
<Button type="button" onClick={handleSave} className="w-full">
  Save
</Button>

/* ❌ Wrong */
<Button
  type="button"
  onClick={handleSave}
  className="px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd]..."
>
  Save
</Button>
```

### Secondary actions (Test, Cancel)

When a secondary action sits alongside Save, use `variant="outline" size="sm"` and let Save take the remaining width via `flex-1`.

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

### Section labels inside configurators

Use the monospace category label style — same as form section cards.

```jsx
<p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
  Task Name
</p>
```

### Help callout containers

```jsx
<div className="rounded-lg border border-border bg-muted/30 p-3 text-[10px] text-muted-foreground space-y-2">
  <div className="font-semibold text-xs text-foreground">📘 Title</div>
  {/* body */}
</div>
```

**Rules:**
- Background is `bg-muted/30`, never `bg-slate-50` or `bg-white`
- Border is `border-border`, never `border-slate-200`
- Code snippets inside callouts: `<code className="bg-background px-1 rounded border border-border font-mono">`
- Primary callouts (tips, warnings): `bg-primary/5 border-primary/20 text-primary/80`
- Warning callouts: `bg-amber-50 border-amber-200 text-amber-700`

### Multiline text areas

Use `<Textarea>` from `@jet-admin/ui` for all multiline inputs. Where JsonForms handles
rendering, ensure the JSON Forms renderer also uses the shared `Textarea` (see §15).
For configurators that render textareas directly:

```jsx
import { Textarea } from '@jet-admin/ui';

<Textarea
  value={description}
  onChange={e => setDescription(e.target.value)}
  rows={2}
  placeholder="Describe what this node does..."
  className="resize-none"
/>
```

### AND/OR logic dividers

Use `bg-primary/10 text-primary border-primary/30` for AND, `bg-amber-50 text-amber-600 border-amber-200` for OR. Never `bg-indigo-50`.

```jsx
<button className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${
  logic === 'AND'
    ? 'bg-primary/10 text-primary border-primary/30'
    : 'bg-amber-50 text-amber-600 border-amber-200'
}`}>{logic}</button>
```

---

## 19. `packages/widgets-ui/vega` — Visual Builder Patterns

The vega sub-package builds the chart configuration UI. It previously used a mix of raw slate colors and `--we-*` CSS variables. All new work (and migrations) must use semantic Tailwind tokens.

### Section card pattern

All major sections in the chart builder use the same Section wrapper as app forms:

```jsx
function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-3">
      {title && (
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
```

**Do NOT use:**
```jsx
/* ❌ banned */
<div className="bg-white border border-slate-200 p-3 rounded">
  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Title</h3>
```

### ChartTypeSelector — selected state

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

### VariableExplorer — no inline styles

All `--we-*` CSS variables in `variableExplorer.jsx` are replaced with Tailwind semantic tokens:

| Old inline style | New Tailwind class |
|---|---|
| `style={{ background: 'var(--we-bg-primary, #fff)' }}` | `className="bg-background"` |
| `style={{ background: 'var(--we-bg-secondary, #f8f9fa)' }}` | `className="bg-muted/50"` |
| `style={{ border: '1px solid var(--we-border, #e2e8f0)' }}` | `className="border border-border"` |
| `style={{ color: 'var(--we-text-primary, #1e293b)' }}` | `className="text-foreground"` |
| `style={{ color: 'var(--we-text-secondary, #475569)' }}` | `className="text-muted-foreground"` |
| `style={{ color: 'var(--we-text-muted, #94a3b8)' }}` | `className="text-muted-foreground/60"` |
| `style={{ background: isSelected ? 'var(--we-bg-accent-light)' }}` | `className={isSelected ? 'bg-primary/10 text-primary border-l-2 border-primary' : ''}` |

### VariablePathPicker — input styling

Use the shared `Input` component with no manual overrides. For monospace variable paths, add `className="font-mono"` as a layout override (allowed).

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

### Browse and Transform buttons

Use `variant="primary-ghost"` for active state, `variant="outline"` for inactive.

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

### Suggestions dropdown

```jsx
<div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto">
  {suggestions.map(s => (
    <div className="px-2 py-1.5 text-xs hover:bg-muted flex items-center justify-between gap-2 border-b border-border last:border-0 cursor-pointer transition-colors">
      {/* content */}
    </div>
  ))}
</div>
```

### Label component

All field labels in vega builder components use `Label` from `@jet-admin/ui`, not raw `<label>`:

```jsx
/* ✅ Correct */
import { Label } from "@jet-admin/ui";
<Label className="text-[10px] font-medium text-muted-foreground">Chart Title</Label>

/* ❌ Wrong */
<label className="block text-[10px] font-medium text-slate-500 mb-1">Chart Title</label>
```

### EncodingChannelEditor card

```jsx
/* ✅ Correct: bg-card / bg-muted/50 / border-border */
<div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">

/* ❌ Wrong: bg-white / bg-slate-50 / border-slate-200 */
<div className="border border-slate-200 rounded bg-white overflow-hidden shadow-sm">
  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
```

### vegaSpecEditor.jsx — S style object (allowed exception)

The `VegaSpecEditor` component uses an inline `S` style object for Monaco-level chrome (header bar, template grid, error strip). This is an allowed exception because Monaco's embedding context prevents reliable CSS class application. Do NOT replicate this pattern in any other component. Migrate when a Monaco wrapper primitive is available in `@jet-admin/ui`.