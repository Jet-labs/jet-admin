# Templating System — Architecture, Conventions, and Gaps

This document describes every `{{ }}` expression resolution point in the
codebase, the namespace conventions in use, the relationship between backend
and frontend evaluators, and remaining gaps in uniformity.

---

## 1. Backend — Template Engine (Core Library)

**Path:** `apps/backend/utils/templateEngine/`

### 1.1 `parsers.js` — Regex Extraction

```
TEMPLATE_BLOCK_REGEX = /\{\{([\s\S]+?)\}\}/g
WHOLE_EXPRESSION_REGEX  = /^\{\{([\s\S]+?)\}\}$/
```

Functions: `extractTemplateBlocks()`, `extractWholeTemplateExpression()`.  
Pure string parser, no namespace awareness.

### 1.2 `tokenizer.js` — Path Resolution

The "lexer" that splits `ctx.foo.bar[0].baz` into tokens and resolves against
a target object. Enforces allowed roots:

```js
normalizePath("ctx.foo.bar", ["ctx"])  // → "foo.bar"
normalizePath("args.foo.bar", ["args"]) // → "foo.bar"
normalizePath("state.foo", ["ctx","args"]) // → null (not allowed)
```

Blocks `__proto__`, `prototype`, `constructor` for security.

### 1.3 `resolver.js` — Resolution Engine

```js
resolveTemplate(template, contextData, {
  allowedRoots: ["ctx"],
  preserveSingleExpressionType: true,
});
```

Whole-expression → preserves type (object passthrough). Mixed-interpolation →
stringifies each `{{ expr }}` into the surrounding text.

### 1.4 `validator.js` — Brace Checking

Detects raw paths (e.g. `ctx.foo`) that are NOT wrapped in `{{ }}`.

---

## 2. Backend — Where Templates Are Resolved

### 2.1 Workflow Node Execution

**File:** `apps/backend/modules/workflow/listeners/taskListener.js`

Every workflow node handler receives `resolveTemplate(template)`.  
**Namespace:** `ctx` — assembled by `stateManager.assembleContext()`  
**`ctx` contains:** input args, all `INPUT_SET`/`NODE_COMPLETED`/`SYSTEM_SET`
logs merged in insertion order.

**Handler usage:**
| Node Type | What Gets Resolved | Example |
|---|---|---|
| `dataQuery` | Entire `args` object | `{{ctx.input.userId}}` |
| `condition` | `leftValue`, `rightValue` | `{{ctx.queryResult.count}}` |
| `loop` | `sourceVariable` (items array) | `{{ctx.getUsers.data}}` |
| `delay` | `delayVariable`, `untilTime` | `{{ctx.delayMs}}` |
| `end` | `outputParameters[].sourceVariable` | `{{ctx.result.id}}` |
| `javascript` | None (raw JS, `ctx` as global) | `ctx.input.foo` |

**Convention:** `{{ctx.}}` prefix is mandatory.
`normalizePath()` strips `ctx.` before looking up the value.

### 2.2 Query Execution (Direct)

**File:** `apps/backend/modules/dataQuery/dataQuery.service.js`

```js
resolveInputs({ type: "query", definitions, runtimeValues: inputArgs })
// contextData NOT passed → templates NOT resolved here
```

*Direct* query execution does NOT resolve templates at the input level.
Templates embedded in query options pass through as-is.
`supportsTemplate: true` in `definitionProvider` but no `contextData`
is provided at this call site.

**Gap:** If a user writes `{{ctx.someValue}}` in a data query's input args
and invokes the query directly (not through a workflow node), the expression
will not be resolved. This works only when the query runs inside a workflow.

### 2.3 Template Validation

**Files:**
- `apps/backend/modules/dataQuery/dataQuery.validator.js`
- `apps/backend/modules/workflow/workflow.validator.js`

Both call `collectTemplateViolations()` with `allowedRoots: ['ctx']`.
If a string is exactly `ctx.foo` (not wrapped in `{{ }}`), it's flagged as an error.
Node-type-specific checks in workflow validator.

---

## 3. Frontend — PAGE_DS Runtime Resolution

### 3.1 Core Engine

**File:** `apps/frontend/src/logic/evaluationEngine.js`

The single source of truth for ALL frontend `{{ }}` resolution.

**Namespace:** `stateTree` — flat namespaced object:

```js
{
  queries:    { users: { data: [...], isLoading: false, error: null, lastUpdated } },
  workflows:  { sendEmail: { data: {...}, isLoading: false, error: null, lastUpdated } },
  widgets:    { table_1: { selectedRow: {...}, ... } },
  widgetMethods: { table_1: { refresh: fn, setSelectedRow: fn } },
  variables:  { selectedUserId: 42, searchTerm: "abc" },
  listeners:  { listener_1: { data: {...}, lastUpdated } },
  globals:    { tenantID: "t1", pageID: "p1", currentUser: {...} }
}
```

**Key functions:**
| Function | Purpose |
|---|---|
| `normalizeStatePrefix(path)` | Strips `state.` prefix → bare path |
| `resolvePath(obj, path)` | Dot/bracket resolution |
| `evaluateExpression(expr, stateTree)` | Single `{{ }}` → value |
| `resolveValue(str, stateTree)` | Whole-expression (type-preserving) or mixed interpolation |
| `resolveConfig(obj, stateTree)` | Deep-recursive walk |
| `extractDependencies(obj)` | Extracts `namespace.key` dependency paths |

**Convention:** `{{ state.queries.users.data }}` — `state.` prefix mirrors
backend `ctx.` / `args.` convention. `normalizeStatePrefix()` makes bare
`{{ queries.users.data }}` also work for backward compat.

### 3.2 AppPage Expression Engine

**File:** `apps/frontend/src/logic/appPageRuntime/appPageExpressionEngine.js`

Re-exports all core functions. Adds:
- `buildAppPageStateTree(reducerState, dataSources)` — builds `stateTree` from
  reducer
- `getChangedPaths(prev, next)` — namespace-aware diff (`variables.selectedUserId`,
  `queries.users`, etc.)
- `getAffectedWidgets(changed, depMap)` — reactive re-render computation

### 3.3 Where `resolveConfig` Is Called in Frontend

| File | What Gets Resolved | Context |
|---|---|---|
| `appPageWidgetSlot.jsx` | Entire widget config | Every state tree change (memoized by JSON stable-ref) |
| `useAppPageDataSourceManager.js` | Data source input args | Before calling API (skips if any arg resolves to undefined) |
| `useWidgetEventHandlers.js` | Event action configs | Augments state tree with `event: { type, widgetID, ...payload }` |
| `actionDispatcher.js` | Legacy action configs | `EXECUTE_QUERY_LEGACY`, `TRIGGER_WORKFLOW` |

---

## 4. UI — Template Autocomplete / Intellisense

### 4.1 `TemplateAutocompleteInput`

**File:** `packages/widgets-ui/src/_shared/TemplateAutocompleteInput.jsx`

Reusable input component that shows filtered autocomplete dropdown.
Triggers on focus / typing / `{{`. Used in `WidgetEventsEditor` and widget
config editors.

### 4.2 `suggestionEngine.js`

**File:** `packages/widgets-ui/src/intellisense/suggestionEngine.js`

Generates expression suggestions dynamically:
- `getExpressionSuggestions({ dataSources, variableDefinitions, widgetType, eventType })`
  → full `{{ state.queries.x.data }}` etc.
- `getAliasSuggestions(dataSources)` → alias names
- `getVariableKeySuggestions(definitions)` → `state.variables.x`
- `getWidgetIDSuggestions(widgets)` → widget IDs
- `getMethodSuggestionsForTarget(widgetID, widgets)` → methods on target widget

### 4.3 Monaco Completion

**File:** `packages/json-forms-renderers/src/renderers/templateCompletion.js`

Provides `args.` and `runtimeArgs.` suggestions in Monaco editor for
workflow node config editors. Suggests configured input arg keys with types.

---

## 5. Current Gaps and Issues

### 5.1 `state.` Prefix Not Enforced in Validation (Frontend)

The frontend `evaluationEngine.js` has `normalizeStatePrefix()` for backward
compatibility, allowing bare `{{ queries.x.data }}`. But unlike the backend
(`collectTemplateViolations` with `allowedRoots: ['ctx']`), there is **no
frontend validation** that enforces the `state.` prefix.

**Impact:** Users can write `{{queries.users.data}}` and it works, but this
is inconsistent with the documented convention. New users may not discover the
`state.` prefix at all.

### 5.2 No Frontend `state.` Validator Equivalent

The backend has:
```
validate if value is just "ctx.foo" (without {{ }}) → ERROR
```

The frontend has **no equivalent** of `collectTemplateViolations`. If a user
writes a raw path without `{{ }}` in a widget config, it silently passes
through as a literal string.

### 5.3 `widgetMethods` in State Tree but No `state.widgetMethods.x.y` Suggestions

The `stateTree` contains `widgetMethods: { widgetID: { methodName: fn } }`,
and the suggestion engine can suggest widget IDs and methods for
`CALL_WIDGET_METHOD` actions. But generic expression autocomplete does
not offer `state.widgetMethods.table_1.refresh` paths.

**Impact:** If someone writes `{{ state.widgetMethods.table_1.refresh }}`
in a value expression, it resolves to the function itself (not useful).
This namespace exists more for the runtime dispatch than for user templates.

### 5.4 No `state.event.*` for Non-WidgetContext Templates

`getEventArgs(widgetType, eventType)` returns event payload suggestions.
But these are only offered inside `WidgetEventsEditor`. If a user writes
`{{ state.event.row }}` in a widget's `data` config, there's no autocomplete
for it — even though at runtime, if an event fires and populates `state.event`,
the template WOULD resolve (depending on how the event state merges into the
tree).

**Design question:** Should `state.event.*` be a persistent namespace in the
state tree? Currently it's ephemeral (injected only during event handler execution
in `useWidgetEventHandlers.js`).

### 5.5 `state.` Prefix Not Applied Consistently in Suggestion Output

All suggestion engine functions produce `{{ state.queries.x }}` which is correct.
But `WidgetEventsEditor.getMergedSuggestions()` calls the suggestion engine
with `eventType: null` (to avoid polluting baseExpressionSuggestions with
event args) and then separately prepends event args. The event args come from
`getEventArgs()` which returns paths like `event.row` — these get wrapped as
`{{ state.event.row }}`. Consistent.

### 5.6 Backend: `supportsTemplate` Defines But Not Always Consumed

`definitionProvider.util.js` marks `supportsTemplate: true` for query
definitions and `supportsTemplate: false` for workflow definitions (because
workflow input templates are resolved per-node, not at the entry point).
But the flag is set and then many consumers ignore it.

**Impact:** Low. The flag is documented intent but not mechanism.

### 5.7 No Shared `TEMPLATE_ROOT_MAP` Between Frontend and Backend

The three root namespaces are:
| Environment | Root Prefix | Object |
|---|---|---|
| Backend query args | `args` | `args.userId` → input parameter map |
| Backend workflow | `ctx` | `ctx.input.x`, `ctx.nodeResult.y` → assembled context |
| Frontend PAGE_DS | `state` | `state.queries.x`, `state.variables.y` → state tree |

These are defined in separate files without a shared constant/type. If a
new root is added (e.g. `env` for environment variables), it must be wired
separately in tokenizer.js AND evaluationEngine.js.

**Recommendation:** Define a `TEMPLATE_NAMESPACES` constant somewhere shared
(e.g., in `@jet-admin/widget-types`) that enumerates all valid roots:
```js
export const TEMPLATE_NAMESPACES = {
  BACKEND_ARGS: "args",
  BACKEND_CTX: "ctx",
  FRONTEND_STATE: "state",
};
```

### 5.8 Backend Tokenizer's `BLOCKED_PATH_SEGMENTS` vs Frontend

Both backend (`tokenizer.js`) and frontend (`evaluationEngine.js`) block
`__proto__`/`prototype`/`constructor`, but the backend uses `BLOCKED_PATH_SEGMENTS`
(a Set-based allow-list negation) while the frontend simply resolves through
`obj[part]` which JavaScript's bracket notation inherently blocks prototype
access for these keys on plain objects. The approaches differ but both are secure
for their contexts.

---

## 6. Summary: Uniformity Checklist

| Concern | Status |
|---|---|
| Backend has consistent prefix (`ctx.`) enforced by `allowedRoots` | ✅ |
| Frontend has consistent prefix (`state.`) with `normalizeStatePrefix` | ✅ (runtime), ⚠️ (no UI validation) |
| All `{{ }}` resolution goes through a single engine per environment | ✅ (backend: `resolver.js`, frontend: `evaluationEngine.js`) |
| Event args are widget-type-specific | ✅ (done — nested in `WIDGET_EVENT_TYPES`) |
| Intellisense is generated dynamically from state tree shape | ✅ (done — `suggestionEngine.js`) |
| No hardcoded intellisense in widget editors | ✅ (done — removed) |
| Template validity is validated at save time | ✅ (backend), ❌ (frontend: no equivalent) |
| Shared namespace constants between FE/BE | ❌ (separate definitions) |
| `state.` prefix enforced in UI (not just silently accepted) | ❌ (no validator) |
