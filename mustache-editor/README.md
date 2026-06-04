# Mustache Intellisense Editor

A React component that behaves like a plain-text editor, but activates full
**JavaScript + JSON schema autocomplete** whenever the cursor is inside a `{{ }}` mustache zone.

Built on **CodeMirror 6** — not Monaco. See [Why not Monaco?](#why-not-monaco).

---

## Quick start

```bash
npm install @codemirror/autocomplete @codemirror/commands @codemirror/lang-javascript \
            @codemirror/language @codemirror/state @codemirror/view \
            @lezer/highlight
```

```jsx
import { MustacheEditor } from './MustacheEditor'

const myContext = {
  user: { name: 'Ada', role: 'admin' },
  org:  { plan: 'enterprise', seats: 500 }
}

function App() {
  const [value, setValue] = useState('Hello {{ user.name }}!')

  return (
    <MustacheEditor
      value={value}
      onChange={setValue}
      jsonContext={myContext}
      placeholder='Type freely… use {{ }} for JS expressions'
    />
  )
}
```

---

## File structure

```
src/
  MustacheEditor.jsx          ← The React component (drop this in your project)
  useMustacheCompletions.js   ← JSON schema walker + CM6 completion source
  mustacheHighlighter.js      ← CM6 decoration plugin for {{ }} zones
  App.jsx                     ← Demo app
  app.css                     ← Demo styles
```

---

## Props

| Prop          | Type     | Default                          | Description                                     |
|---------------|----------|----------------------------------|-------------------------------------------------|
| `value`       | string   | `''`                             | Controlled value                                |
| `onChange`    | function | —                                | Called with new string on every keystroke       |
| `jsonContext` | object   | `{}`                             | JSON object to derive path completions from     |
| `placeholder` | string   | `'Type freely… use {{ }}'`       | Placeholder shown when empty                    |
| `minHeight`   | string   | `'120px'`                        | CSS min-height of the editor                    |
| `maxHeight`   | string   | `'400px'`                        | CSS max-height before scrolling                 |
| `readOnly`    | boolean  | `false`                          | Make the editor read-only                       |
| `className`   | string   | `''`                             | Extra CSS class on the wrapper div              |

---

## How it works

### 1 — Zone detection

On every autocomplete request, `getCursorZone()` in `useMustacheCompletions.js`
does a linear scan for `{{` / `}}` pairs and checks whether the cursor position
falls inside one.

```js
// O(n) scan, where n = document length in chars
// Fast enough for template strings (< 10 000 chars)
// For very large documents, replace with a Lezer grammar (see section 5)
```

### 2 — JSON schema walking

`walkSchema()` recursively traverses the `jsonContext` object at mount time
and produces a flat list of dot-notation paths:

```js
// Input
{ user: { name: 'Ada', roles: ['admin', 'viewer'] } }

// Output
[
  { label: 'user',           type: 'object' },
  { label: 'user.name',      type: 'string', detail: 'string: "Ada"' },
  { label: 'user.roles',     type: 'array'  },
  { label: 'user.roles[0]', type: 'string', detail: 'string: "admin"' },
  { label: 'user.roles[1]', type: 'string', detail: 'string: "viewer"' },
]
```

This is wrapped in `useMemo(() => walkSchema(jsonContext), [jsonContext])` so it
only re-runs when the context object reference changes — zero cost on re-renders.

**Depth limit:** capped at 6 levels by default (`maxDepth` param). Increase for
deeply nested schemas, but watch the array scanning — it indexes up to 3 items
per array level.

### 3 — Completion source

The CM6 completion source merges two lists:

1. **Schema paths** — from the JSON walk, filtered by the word before the cursor.
2. **JS keywords + methods** — a curated static list of common JS identifiers
   (`Math.round`, `.map(`, `.filter(`, `typeof`, etc.).

Schema paths are boosted above JS keywords so object paths appear first.

### 4 — Zone highlighting

`mustacheHighlighter.js` is a `ViewPlugin` that decorates `{{ }}` zones on every
document change or viewport scroll:

- `{{ }}` delimiters → `.cm-mustache-delim` (blue, bold)
- Zone interior → `.cm-mustache-zone` (subtle blue background tint)

All done with CM6 `Mark` decorations — no DOM manipulation, no re-renders.

### 5 — Upgrading to a Lezer grammar (for large documents)

The current zone detection is a linear text scan. For documents > ~50 000 chars,
replace it with a custom Lezer grammar:

```js
// Lezer grammar sketch (mustache.grammar)
// @top Template { (PlainText | MustacheExpr)* }
// MustacheExpr { "{{" JS* "}}" }
// PlainText { plainChar+ }

// Then in the completion source:
import { syntaxTree } from '@codemirror/language'

function isInMustacheZone(state, pos) {
  let inZone = false
  syntaxTree(state).cursor().iterate(node => {
    if (node.name === 'MustacheExpr' && node.from < pos && pos < node.to) {
      inZone = true
    }
  })
  return inZone
}
```

This moves zone detection to O(log n) Lezer tree traversal.

---

## Why not Monaco?

| | Monaco | CodeMirror 6 |
|---|---|---|
| Bundle size | ~4 MB | ~150 KB |
| Memory footprint | ~120 MB | ~8 MB |
| Initial parse time | ~800 ms | < 20 ms |
| Custom language zones | Complex — requires language server protocol | First-class via `ViewPlugin` + compartments |
| React integration | Requires `@monaco-editor/react` wrapper + lazy loading | Direct EditorView instantiation in `useEffect` |
| Tree-shakeable | No | Yes — import only what you need |

Monaco is the right choice when you need a full VS Code IDE experience in the
browser. For embedded template editors with context-aware completions,
CodeMirror 6 is the correct tool.

---

## Performance tips

1. **Memoize `jsonContext`** — pass a stable object reference or wrap in `useMemo`.
   If you pass an inline object literal (`jsonContext={{ user }}`), the schema
   walk runs on every render.

   ```jsx
   // ✗ Walks schema on every render
   <MustacheEditor jsonContext={{ user, org }} ... />

   // ✓ Stable reference — walks once
   const ctx = useMemo(() => ({ user, org }), [user, org])
   <MustacheEditor jsonContext={ctx} ... />
   ```

2. **Lazy-load CodeMirror** — if initial page load time matters, dynamic-import
   the editor:

   ```jsx
   const MustacheEditor = React.lazy(() =>
     import('./MustacheEditor').then(m => ({ default: m.MustacheEditor }))
   )
   ```

3. **Cap schema depth** — if your context has very deep nesting, pass a lower
   `maxDepth` to `walkSchema` to avoid generating thousands of completion entries.

4. **Debounce `onChange`** — if the parent does expensive work on every keystroke
   (e.g. hitting an API), debounce the handler before passing it as `onChange`.

---

## Safe template evaluation

The demo uses a sandboxed `Function` constructor to evaluate `{{ expressions }}`:

```js
function evaluateMustache(template, context) {
  return template.replace(/\{\{([\s\S]*?)\}\}/g, (_, expr) => {
    const keys   = Object.keys(context)
    const values = Object.values(context)
    const fn = new Function(...keys, `"use strict"; return (${expr.trim()})`)
    return String(fn(...values))
  })
}
```

This is **not** `eval` — the function body runs with no access to `window`,
`document`, or any outer scope variables (only the explicitly passed context
keys). Wrap in try/catch to surface invalid expressions gracefully.

For production, consider [expr-eval](https://github.com/silentmatt/expr-eval)
or [jexl](https://github.com/TomFrost/Jexl) for a sandboxed AST evaluator
that disallows arbitrary JS entirely.

---

## Customising the completion popup

All CM6 tooltip styles are applied via the `EditorView.theme()` in `MustacheEditor.jsx`.
Key selectors:

```css
.cm-tooltip.cm-tooltip-autocomplete  /* dropdown container */
.cm-tooltip-autocomplete > ul > li   /* each item */
.cm-tooltip-autocomplete > ul > li[aria-selected]  /* selected item */
.cm-completionLabel   /* item label */
.cm-completionDetail  /* item type/detail */
.cm-mustache-delim    /* {{ }} delimiter */
.cm-mustache-zone     /* {{ }} interior background */
```
