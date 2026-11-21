# AI agent prompt pack: widget improvements

Date: 9 October 2026  
Specification: [Widget enhancement and expansion](2026-10-09-widget-library-enhancement-spec.md)  
Evidence: [Source inventory](2026-10-09-widget-library-source-inventory.md)

Use Prompt 1 for every implementation assignment, followed by a focused prompt below. Requirement IDs refer to the specification. These prompts authorize local implementation only when the user actually gives them to an agent; creating this document did not authorize executing its backlog.

## Prompt 1 — Master implementation prompt

~~~text
You are improving Jet Admin's widget platform in this repository.

Read:
- docs/specs/2026-10-09-widget-library-enhancement-spec.md
- docs/specs/2026-10-09-widget-library-source-inventory.md
- applicable repository instructions and the current source for your assigned items.

Assigned scope: the requirement IDs named immediately after this prompt.
If none are named, start with B01 / the functional-update portion of F01 only.

Implement the assigned scope completely, including necessary prerequisites.
Do not implement every proposed widget in a single change. Separate independent
changes into reviewable slices. Treat the specification as a source-grounded
proposal, and verify current code before editing because the repository can evolve.
If evidence contradicts a finding, record the correction instead of implementing
an obsolete fix.

Preserve existing saved widget configurations, workflow/event wiring, tenant
boundaries, supported themes, and working visual identity. Do not overwrite
unrelated user changes. Do not expose .env contents or credentials. Do not deploy,
publish to the shared library, or mutate live tenant data without authorization.

Use the existing package boundaries:
- packages/widget-types: descriptors, config schemas, events/method metadata
- packages/widgets-ui: renderers, configuration editors, registry and samples
- packages/widgets-logic: pure builders where transformation is actually needed
- packages/ui: reusable field, feedback, overlay and formatting primitives
- apps/frontend/src/logic/appPageRuntime: state, instances, methods, actions
- apps/frontend/src/presentation/components/widgetComponents: editor and preview
- apps/frontend/src/presentation/components/appPageComponents: page integration
- apps/backend/modules/widget and widgetLibrary: validation/persistence/reuse
- packages/mcp-server/src/tools: AI-facing schema and authoring consistency

For each selected widget:
1. Inspect renderer, editor, schema, default config and every relevant render path.
2. Define canonical properties and preserve old aliases through normalization.
3. Make UI states, validation, keyboard/focus, responsive sizing and recovery real.
4. Synchronize state shape, event payloads, methods and data binding.
5. Update registry, schema, API validation, MCP discovery/examples and documentation
   wherever the feature changes those contracts.
6. Add meaningful behavior/integration regression tests, especially for the
   reported defect. Do not settle for tests that only check that keys exist.
7. Verify preview and page runtime agree. Default interactive previews to simulated
   side effects. Use deliberate live-run mode for authorized real execution.
8. Exercise multiple instances, defaults/clear/reset, loading/errors, malformed
   data and out-of-order results where relevant.
9. Run focused checks plus impacted package builds. Package tests can consume dist;
   rebuild before relying on results. The root test script is a placeholder.
10. If UI changed, inspect representative ready/loading/error states at narrow and
    wide sizes and in supported themes. State what was actually inspected and
    what remains untested.

A selected item is complete only when its acceptance criteria and the applicable
common checks in section 9 pass. If a required service is missing, implement the
authorized local interface and integration or explicitly document the blocker;
do not fake upload, persistence, authorization or successful mutation behavior.

Final handoff: selected IDs; before/after result; files changed; compatibility and
migration behavior; actual test/build/visual results; remaining concrete limits.
Do not claim all 32 widgets or all 40 additions are complete for a partial slice.
~~~

## Prompt 2 — Fix functional state updates first

~~~text
Apply the master prompt. Scope: B01 and the functional-state-update portion of F01.

Trace useWidgetState -> appPageActions.setWidgetState -> appPageReducer.
Most input widgets pass prev => ({...prev, value}), while the inspected reducer
spreads the incoming update without evaluating a function.

Choose a single documented state-update contract that supports object patches
and functional updates against the latest committed widget state. Preserve
existing keys and sequential updates. Avoid evaluating against a stale render's
captured state. Keep the reducer deterministic and keep persisted config free
of functions. Verify all call sites against the chosen contract.

Add regression coverage for:
- object patch preserves unrelated keys;
- functional update reads the current state;
- two sequential toggles return to the original value;
- typing/selecting changes state.widgets.<id>.value;
- another widget bound to that value updates;
- date picker's object patches still work;
- unmount/remount and independent widgets behave as documented.

Use the actual runtime/provider integration for at least one test so a local
React useState mock cannot hide the integration defect. Do not expand widget
features in this change.
~~~

## Prompt 3 — Isolate repeated widget instances

~~~text
Apply the master prompt. Scope: B24 and F01 instance identity, with F12 integration.
Prerequisite: functional state updates already work.

Inspect createWidgetInstanceKey, parseWidgetKey, AppPageWidgetSlot,
useWidgetState, useWidgetMethodRegistry, repeat scope and expression bindings.
Reproduce one saved widget placed twice and placed in a repeated layout.

Separate persisted widget resource identity from placement runtime identity and
repeat-scope identity. Make state, event context, method registration and cleanup
instance-specific. Define a compatibility policy for legacy resource-ID
expressions: keep them deterministic, provide diagnostics for ambiguity, and
document an explicit new instance reference form. Do not silently reroute a
legacy binding to an arbitrary placement.

Verify removing one placement does not unregister a sibling's methods or erase
its state. Import/export and cloning must remap instance references correctly.
Include repeated forms, checkboxes, tabs and a method caller in regression tests.
~~~

## Prompt 4 — Repair content and iframe boundaries

~~~text
Apply the master prompt. Scope: F03, B02/B03/B20, E05/E10/E13 safety requirements.

Inspect HTML widget sandbox token construction, iframe widget sandbox fallback,
Markdown-to-HTML rendering and HTML postMessage reception.

Implement:
- sandbox attribute present even when its value is the empty string;
- capability toggles with consistent boolean normalization;
- safe Markdown rendering with raw HTML disabled by default and URL policies;
- exact iframe contentWindow source validation for messages;
- validated message type/widget instance/payload, allowing opaque origins only
  under the documented source-checked policy;
- safe defaults and compatibility behavior for existing saved content;
- cleanup of timers/listeners and refresh operations.

Add hostile and legitimate content fixtures. Browser tests must demonstrate that
scripts/forms/popups are restricted when disabled, rather than checking only a
string. Test messages from an unrelated frame/window and from the intended frame.
Do not broaden script permissions to fix rendering. Do not claim a penetration
test or complete security certification from these regression checks.
~~~

## Prompt 5 — Unify schema, editor and AI contracts

~~~text
Apply the master prompt. Scope: F04/F09/F15, B07/B08/B17/B21 and section 4.

Read the source inventory, but recompute current differences before implementation.
Cover all 32 registered types. Prioritize iframe url/src, HTML capability flags,
date-range placeholder aliases, form size/reset/layout, text alignment,
stat formatting aliases, Vega spec/options and table dataArrayTemplate.

Define canonical descriptor metadata with:
widget type, schema version, config schema, defaults, aliases/migrations,
data/state shapes, event payload schemas, method arguments/results, category,
search aliases, examples and supported capabilities.

Preserve legacy input shapes through deterministic dual-read normalization;
write the canonical shape, preserve unknown supported extension metadata and
do not silently drop events/styles. Normalization must be idempotent.

Generate or validate editor samples, API validation and MCP discovery/examples
from the same source. Enforce actual type/config validation at create/update
after compatibility is established. Template-capable properties require separate
authoring-time and resolved-value validation.

Add tests validating every default/sample/example and a legacy fixture matrix.
Capability tests must exercise emitted events and callable methods, not just
assert that a metadata entry exists. Correct misleading MCP claims about
backend validation or duplicate-field workarounds when they are actually fixed.
~~~

## Prompt 6 — Make events and methods dependable

~~~text
Apply the master prompt. Scope: F02, B04/B05/B17/B23; E01/E02/E03/E15/E17/E19/E20/E21.

Trace one complete event from renderer through AppPageWidgetSlot and
useWidgetEventHandlers. Remove double dispatch of chart mark/brush interactions
and table row selection while retaining supported direct component callbacks.

Implement current-state methods rather than methods that close over initial
checkbox/switch values or slider limits. Implement the button's advertised click
method and select's advertised open/close/clear behavior, or remove unsupported
declarations with a compatibility explanation.

Define programmatic method event behavior, sources and exactly-once dispatch.
Cancel pending search debounce on clear/setValue/unmount and handle IME entry.
Expose structured action results for widgets awaiting success/failure.

Test duplicate chart dispatch through the real page adapter, two toggles, slider
config changes, dynamic callbacks, clear-before-debounce and method cleanup.
Avoid a generic event wrapper that nests payloads inconsistently under inputs.
~~~

## Prompt 7 — Form and date picker reliability

~~~text
Apply the master prompt. Scope: E08/E11/E12 plus F05. Prerequisites: F01 and
canonical field contracts available.

For forms, preserve dirty edits on unrelated query/config refresh, expose draft
values/errors/dirty/submitting in widget state, validate all field types, and
provide error summary/focus and async submit outcomes. Reconcile size/showReset
with layout/columns/resetLabel. Reuse field contracts.

For date controls, separate uninitialized/default/empty/reset states; clearing
must remain empty. Enforce required/disabled/read-only/min/max/disabled-date
settings for every entry route. Add keyboard calendar navigation, unique labels,
accessible triggers and focus return. Date-only values remain calendar dates;
datetime mode must explicitly document timezone/wall-time semantics.

For ranges, normalize placeholder aliases, expose presets, validate start/end
including edited times, and support explicit draft Apply/Cancel semantics.

Test dirty form preservation; required select/checkbox; failed submit; clear
with defaults; leap/year/month-end; invalid typed dates; same-day inverted times;
partial ranges; multiple instances; narrow one-calendar range layout.
~~~

## Prompt 8 — Production table behavior

~~~text
Apply the master prompt. Scope: E04 and B12/B13/B22.

Keep current TanStack table, builders and pure utilities. Introduce a documented
stable rowKey contract, migrate index-only selection/editing safely, and reconcile
selection when records refresh/reorder/disappear. Do not allow an index to target
a different record after refetch.

Define client/server pagination, sort and filtering. Server sort must emit an
explicit structured event that a query can bind; indicators must reflect actual
display order. Keep page/query identity coherent when data length changes.

Make row/bulk saves await structured results; retain failed drafts, expose errors,
support partial bulk outcomes, and update nested paths correctly. Preserve value
types and validate editable columns. Define edit commit/cancel keyboard behavior.

Add explicit export scope and raw/formatted policies; guard formula-like
spreadsheet values under the chosen export policy; revoke object URLs. Provide
keyboard row/action/edit entry and labelled pagination controls.

Required regression fixtures: same-length replacement, filtered/reordered rows,
nested user.name edit, failed row save, partial bulk failure, server sort/page
change, explicit all-matching vs current-page selection, export scope and
keyboard-only operation. Profile a representative large dataset before choosing
virtualization thresholds.
~~~

## Prompt 9 — Real runtime file upload

~~~text
Apply the master prompt. Scope: F11/E22/B11.

The current runtime file-upload widget emits metadata only. The image config
editor has an upload callback, but that is not automatically a runtime upload
contract. Inspect existing backend upload authorization and storage first.

Design and implement a tenant-scoped upload adapter returning opaque asset IDs,
metadata and authorized URLs. Retain raw File objects in ephemeral memory, never
in page JSON/reducer persistence. Support picker and accessible dropzone,
upload-on-select/manual mode, count/size/type validation, progress, cancel,
independent retry/remove and partial failure.

Enforce validation and authorization server-side. Do not treat a browser accept
attribute as server validation. Revoke preview URLs, cancel in-flight work on
unmount, and define remove-from-selection vs delete-stored-asset separately.

Expose real fileId/status/assetId state, upload methods and documented event
payloads. Test that an authorized workflow can consume the persisted asset,
unauthorized tenant access fails, invalid content fails, and a single failed file
can retry without restarting successful files.
~~~

## Prompt 10 — Composition and overlays

~~~text
Apply the master prompt. Scope: F12/E24/N27/N28 first. Implement N29/N30/N31 only
as separately assigned follow-ups.

Reuse existing Craft layout, conditions, repetition, sizing and shared UI overlays.
Define owned child-slot metadata and traversal, instance scope, serialization,
clone/import/export remapping and editor selection/movement.

Preserve existing Tabs selector mode. Add explicit content-container mode with
stable panel IDs and documented lazy/keepMounted behavior.

Build container-card and modal with nested widgets, responsive size, focus trap,
focus return, Escape/backdrop policy, scroll lock and unsaved-form protection.
Use one overlay lifecycle shared with the future drawer.

Test nested fields and event bindings, repeated containers, removing a placement,
conditional visibility, tab switching with preserved form drafts, keyboard-only
dialog use, nested overlay stacking and import/export round trips.
Do not introduce a second layout engine or store child state under resource IDs.
~~~

## Prompt 11 — High-value widget expansion

~~~text
Apply the master prompt. Scope: N01/N04/N16/N23/N40, delivered one type/recipe at
a time after required foundations.

Start with number-input: maintain a raw editing draft and typed number|null;
validate bounds/precision and keyboard behavior. Next add autocomplete using the
shared option service with cancellation and distinct selected/input values.

Ship chart presets as existing Vega-Lite recipes, with a typed field mapper and
meaningful sample data. Ship record-detail as a structured configuration over
key-value formatting and actions.

Build query-filter-builder around a typed filter AST, nesting/operator limits,
saved presets and explicit Apply/Clear. Bind table/chart queries through existing
page actions. Compile filters to parameterized server queries; never concatenate
raw SQL from filter values.

Each addition must appear in registry/catalogue and MCP schemas, support
preview/page parity and produce a meaningful working example. Include relevant
tests, failure states and legacy compatibility. Do not invent live data or mark
unfinished integrations as successful.
~~~

## Prompt 12 — UI/UX consistency and builder experience

~~~text
Apply the master prompt. Scope: F05/F07/F08/F13 and the builder UX requirements
in section 5. Limit widget-specific work to the types named in the assignment.

Preserve Jet Admin's established visual identity. Build reusable field wrappers,
WidgetFrame state presentation and semantic tokens rather than applying dozens
of inconsistent local fixes.

Add unique labels/help/errors, visible focus, compact/comfortable density,
container-aware layouts, deliberate loading/refresh/empty/error/permission states
and reduced-motion alternatives. Preserve stale data and unsaved inputs when
refreshing; busy overlays must not leave unsafe actions keyboard-operable.

Improve catalogue task categories/search/preview, inspector grouping, structured
option/column/field editing, typed binding selection with resolved-value preview,
and keyboard insertion as well as drag. Keep diagnostics in authoring UI.

Inspect changed surfaces with ready/loading/empty/error states, supported themes,
narrow/wide card widths, long content, zoom, keyboard and RTL. Batch observations,
fix them together and confirm once. Report actual contrast/interaction findings
without claiming screenshot layout proves touch gestures or screen-reader use.
~~~

## Prompt 13 — Developer experience and library lifecycle

~~~text
Apply the master prompt. Scope: F10/F14/F16 after F04/F09.

Create a typed widget authoring kit and scaffold that produces descriptor/schema,
renderer, editor, sample and meaningful tests. Ensure declarations advertised in
package exports are generated and checked. Prevent stale dist test results.

Inspect production bundling before claiming lazy-loading savings. Separate heavy
editors/renderers where build output supports it, and measure mixed pages. Add
bounded diagnostics for slow rendering/event failures and resource leaks.

Improve shared-library categories/previews/version/compatibility/changelog and
load-error/retry. Keep current install preview, dependency sanitization,
transaction semantics and reconnect warnings. Define upgrade vs install-as-copy
and rollback feasibility before adding controls.

Test one scaffolded widget end to end, declaration consumption, registry/MCP
discovery, library load failure, version compatibility, install/upgrade reference
remapping and a representative measured page. Do not publish live library entries
or install into real tenants without explicit authorization.
~~~

## Prompt 14 — Any remaining existing widget

~~~text
Apply the master prompt. Scope: the E ID supplied with this prompt.

Implement its full UI, UX and DX specification and applicable prerequisites.
Read its source, schema, editor and usage through the runtime before coding.
Preserve working behavior, normalize aliases and expose real supported settings.
Add a working binding example, payload/method examples and meaningful regression
tests. Include multiple-instance, failure and narrow-container behavior.

Use common state, field, option, formatting and feedback primitives. Do not add
a large dependency for a small enhancement without explaining its tradeoff.
Record any proposed subfeature deliberately deferred, with a concrete reason;
do not label the whole item complete while a required acceptance check fails.
~~~

## Prompt 15 — Any remaining proposed new widget

~~~text
Apply the master prompt. Scope: the N ID supplied with this prompt.

Treat the catalogue row as the MVP boundary and expand it into a concise local
implementation plan with exact canonical config/state/event/method contracts.
Check whether it should be a preset/composition over existing widgets.
Resolve prerequisites before building.

Implement renderer, editor, descriptor/schema, registry, defaults, safe sample,
binding, runtime/preview integration, discovery, documentation and tests. Use
existing services and authorization. Explicitly handle empty/loading/error,
required/disabled/read-only where relevant, keyboard/focus and responsive sizing.

Verify the catalogue row's acceptance conditions and section 9. Keep optional
post-MVP features out of this slice. Do not create a static visual shell that
pretends to upload, save, move records, fetch options or authorize access.
~~~

## Assignment shortcuts

| Desired work | Give the agent |
|---|---|
| Start safely with the main blocker | Prompt 1 + Prompt 2 |
| Repair sandbox and Markdown | Prompt 1 + Prompt 4 |
| Fix AI-generated configuration reliability | Prompt 1 + Prompt 5 |
| Stop duplicate/stale interactions | Prompt 1 + Prompt 6 |
| Improve forms and dates | Prompt 1 + Prompt 7 |
| Improve data operations | Prompt 1 + Prompt 8 |
| Enable actual file upload | Prompt 1 + Prompt 9 |
| Add nested UI and dialogs | Prompt 1 + Prompt 10 |
| Broaden common internal-tool workflows | Prompt 1 + Prompt 11 |
| Improve one existing widget | Prompt 1 + Prompt 14 + exact E ID |
| Add one specialized widget | Prompt 1 + Prompt 15 + exact N ID |

Suggested first assignment: **Prompt 1 + Prompt 2**. Then repair the content/embed
boundary and reconcile contracts before broad catalogue expansion.
