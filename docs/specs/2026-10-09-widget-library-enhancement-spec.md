# Widget library: enhancement and expansion specification

Date: 9 October 2026  
Status: Proposed implementation backlog; source review complete; implementation not started  
Companion files: [AI agent prompts](2026-10-09-widget-library-agent-prompts.md) · [Source inventory](2026-10-09-widget-library-source-inventory.md)

## 1. Purpose and scope

Make Jet Admin's widgets reliable to configure, accessible to use, consistent to extend, and broad enough for common internal tools. This document covers all **32 registered widget types**, their configuration editors and schemas, shared runtime and preview integration, reusable widget publishing, and **40 proposed additions**.

Deliverables are specifications and implementation prompts, not application changes. Priorities express a proposed order, not a delivery commitment.

### How to use this specification

1. Implement the blocking shared issues in section 3 before expanding the catalogue.
2. Use foundation work packages F01–F16 to establish reusable contracts.
3. Pick existing-widget requirements E01–E32 or new-widget requirements N01–N40.
4. Give an agent the master prompt and the chosen IDs from the companion prompt pack.
5. Require the acceptance checks in the selected item and section 9 before marking it complete.

An item is complete only when its renderer, editor, schema, runtime integration, examples, and relevant tests agree. A new renderer by itself does not complete a widget.

### Evidence and limits

This is a **static source review**, not a rendered visual or accessibility certification. Reviewed: all widget renderers, all editor field-write surfaces, all 32 JSON schema descriptors, registry metadata, table and Vega processors, page runtime state/method/event handling, standalone preview, widget API validation, MCP widget tools, and library browsing. Complex editor behavior and visual/chart editing need interactive follow-up.

- **Verified** means the behavior or inconsistency is present in the inspected code.
- **Risk** means the implementation suggests a problem whose runtime impact needs reproduction.
- **Proposal** means a new capability, not a claim that the current product is defective.
- No live browser inspection, contrast measurement, performance measurement, physical-device testing, or application test suite was performed for this documentation task.
- Existing architecture documents contain older package names and assumptions. Current source takes precedence.

## 2. Current library and useful foundations

| Category | Registered types |
|---|---|
| Analytics | vega-lite, vega, stat, progress |
| Data display | table, key-value, json-viewer, list, timeline, badge |
| Input and actions | button, form, text-input, select, multi-select, checkbox, radio-group, switch, slider, search-input, file-upload, date-picker, date-range-picker |
| Content and media | text, image, video, iframe, html, code-block |
| Structure and feedback | tabs, divider, alert |

Maintain these existing strengths:

- Widget metadata and configuration schemas already have a separate package.
- Renderers and editors have a central registry with demo/sample configuration.
- Table helpers and processors separate some pure logic from DOM behavior.
- Table and Vega have data manifests; other display widgets already support resolved configuration bindings.
- The page runtime has sequential action chains, latest-state references, method cleanup, and per-widget error boundaries.
- Widgets use many shared UI primitives and theme tokens.
- Vega-Lite already has visual/raw authoring and round-trip tests; charts are not a missing capability.
- The shared library already supports search, pagination, installation preview, dependency import, and reconnect warnings.
- Craft layout already supports rows, containers, conditions, repetition, sizing, and locked nodes. New container widgets should integrate with these facilities.

## 3. Verified findings and immediate repair backlog

Priority definitions:

| Priority | Meaning |
|---|---|
| P0 | Blocking correctness or isolation defect; repair before related feature work |
| P1 | Core capability, accessibility, or contract gap; next implementation wave |
| P2 | Material enhancement or catalogue expansion after foundations |
| P3 | Specialized or optional expansion; validate demand first |

These priorities are implementation priorities, not a formal vulnerability severity rating.

| ID | Priority / area | Source evidence | Impact and required outcome |
|---|---|---|---|
| B01 | P0 · UX/DX | `useWidgetState.js` forwards updates unchanged; `appPageActions.js` stores them; reducer `SET_WIDGET_STATE` spreads the payload; most input widgets pass updater functions | Functions are not evaluated as state updaters. Resolve functional updates against the latest widget state atomically; retain object-patch support. Test real input → page state → bound sibling flow. F01. |
| B02 | P0 · UX/isolation | `htmlWidget.jsx` returns undefined when sandbox tokens are empty; `iframeWidget.jsx` uses `sandboxValue || undefined` | Turning every capability off omits the sandbox attribute. Always render the attribute, including the empty string. Verify script/form/popup restrictions in a real iframe. F03. |
| B03 | P0 · content/isolation | `textWidget.jsx` builds HTML from Markdown and passes it to `dangerouslySetInnerHTML` without a sanitizer in this path | Content can introduce HTML and unsafe link/image attributes into the application DOM. Use a safe Markdown pipeline, disable raw HTML by default, and validate URL schemes. Test hostile fixtures. F03/E05. |
| B04 | P1 · event integrity | Vega renderer dispatches directly and through mark/brush callbacks; TableWidget does the same for row selection; page slot callback wrappers redispatch | One chart or row-selection gesture can execute an action chain twice, with differing payload shapes. Choose one event route and verify one execution per gesture in page and preview. F02/E01/E02/E04. |
| B05 | P1 · UX/DX | Checkbox/switch methods are created once and close over initial checked values; slider methods close over initial bounds; several inputs capture initial callbacks | Repeated method calls or changed configuration can use obsolete values. Use current state/callback references and atomic transitions. F01. |
| B06 | P1 · UX | Date pickers initialize whenever value is falsy and a default exists | Clearing a configured default can immediately repopulate it and fire change events. Distinguish uninitialized, empty, and reset states. E11/E12. |
| B07 | P1 · DX | Schema/editor/renderer mismatches in iframe, HTML, form, text, date range, Vega; see section 4 and inventory | AI-created and edited widgets can silently ignore valid-looking settings. Establish versioned canonical fields and alias migrations. F04. |
| B08 | P1 · DX | `widget.validator.js` uses passthrough configuration and an arbitrary nonempty type; service exposes schemas separately | The inspected create/update path does not enforce type-specific published schemas. Add actual type/config validation after migrating drift; preserve intended extension fields. F04/F15. |
| B09 | P1 · accessibility | Checkbox uses fixed `cb-widget`; radio IDs lack instance scope; form IDs depend only on field key/index; several labels have no control association | Multiple instances can duplicate IDs; assistive names are incomplete. Add unique instance-scoped IDs and field descriptions. F05. |
| B10 | P1 · accessibility | Date popovers use div triggers, calendar navigation lacks descriptive labels/grid keyboard handling, time inputs lack labels | Keyboard and screen-reader use need a complete interaction design. Implement accessible triggers, calendar movement, selected/current-day announcements, and focus return. E11/E12. |
| B11 | P1 · UX/DX | `fileUploadWidget.jsx` converts selected Files into metadata only and does not retain or upload bytes | A workflow receives filenames/metadata, not file content or a persisted asset. Add an explicit runtime upload service contract; existing editor image upload is a separate capability. E22/F11. |
| B12 | P1 · UX | Table selected rows/drafts use array positions; selection sync signature excludes row content | Selection can refer to different records after data refresh or filtering; same-length replacements may leave runtime selectedRows stale. Add stable record keys and reconciliation. E04. |
| B13 | P1 · UX | Table row/bulk save emits async events then immediately closes editing or discards drafts | Failed saves can lose the user's pending changes. Await structured action outcomes; keep/recover failed drafts and expose row errors. E04/F02. |
| B14 | P1 · UX | List filters locally, emits visible indices, compares selectedIndex, uses index keys; advertised `onSearch` is not fired | Filtering can change selection identity; configured search actions never receive the advertised event. Store item identity and emit the documented search payload. E27. |
| B15 | P1 · UX/DX | Standalone `WidgetPreview` omits widgetID/state/setter/event dispatcher; init callback reads `ref.current` | Input, date, event, and method behavior differs from the real page. Build a shared runtime adapter and safe simulation mode. F06. |
| B16 | P1 · UX | `FormWidget` resets all formData whenever resolved fields identity changes; values are local only | Reactive updates can erase dirty data; sibling widgets cannot inspect the draft through the common state tree. Merge defaults only into untouched fields and expose form state. E08. |
| B17 | P1 · UX/DX | Select advertises open/close/clear events but does not wire open changes or a clearable UI; button advertises click method without registering it | Registry capability declarations overpromise renderer behavior. Add a capability conformance suite and only advertise implemented events/methods. F02/F04. |
| B18 | P1 · UX/DX | JsonViewerWidget passes collapsed; shared JsonViewer forwards unknown props to its div; JsonNode initializes depth-based expansion | The collapsed setting does not control expansion. Implement an actual expansion API in the shared component and test prop changes. E26. |
| B19 | P2 · UX/performance | Widget renderers repeat loading overlays; overlays mostly lack busy/live-region semantics and do not disable keyboard interaction | Loading presentation and interaction policy are inconsistent. Centralize loading/refresh/error/empty states and preserve drafts during refresh. F07. |
| B20 | P1 · isolation | HTML message listener checks type/widgetID but not `event.source` | Another window/frame can impersonate a widget message if its ID is known. Require the exact iframe window, validate envelope/payload, and handle opaque origins deliberately. F03. |
| B21 | P2 · DX | Package manifests advertise dist/index.d.ts; inspected build commands emit JS bundles only; tests import dist bundles | Declarations are not produced by those commands, and source tests can exercise stale bundles. Add generated/checked declarations and build-before-test or source-based tests. F09/F10. |
| B22 | P2 · UX | Table always enables local sorting, but server mode displays core row models and has no documented server-sort event | Sort indicators can imply behavior not applied to displayed data. Explicitly define client/server sorting and wire the corresponding query contract. E04. |
| B23 | P2 · UX | Search-input clear/setValue do not cancel a pending debounce | A cleared search can later emit an older term. Cancel pending timers and define IME/Enter/clear semantics. E21. |
| B24 | P1 · instance identity risk | Layout creates unique placement keys, but page slot parses widgetID and keys state/method registration by that resource ID | Repeated placements may share input state and unregister each other's methods. Reproduce duplicate placements; separate resource, instance, and repeat-scope identity while migrating expressions. F01/F12. |

### Targeted reproductions to require

1. Put two switches on a page; call toggle twice; each returns to its original value and updates a sibling text binding.
2. Render HTML containing a script with all capabilities disabled; inspect an empty sandbox attribute and confirm the script cannot run.
3. Configure a date default, choose a new date, clear, then refresh unrelated query data; the control remains empty.
4. Click a chart mark that increments a counter; the counter increments once.
5. Select row A, replace the data with a different same-length array, then invoke a bulk action; no unrelated record is targeted.
6. Edit a table row and fail the save action; the draft stays recoverable.
7. Place one widget resource twice and inside a repeated layout; input values and method lifecycles remain isolated.

## 4. Contract reconciliation matrix

All entries below are observed mismatches or gaps, not instructions to delete old fields. Implement a dual-read migration with a documented canonical write shape.

| Surface | Current disagreement | Target behavior |
|---|---|---|
| iframe | Schema src/sandbox/scrolling/fullscreen vs editor and renderer url/capability flags | Prefer existing working runtime url plus typed capabilities; accept src and legacy sandbox through a controlled normalizer. Explicit title, loading, referrer policy, fullscreen support. |
| html | Schema js/height/scrollable vs editor/runtime html/css/capability flags | Document execution mode; either implement js deliberately in the isolated frame or mark it unsupported/deprecated. Preserve restrictive sandbox when no flags are enabled. |
| form | Schema resetLabel/layout/columns vs renderer/editor size/showReset | Reconcile both sets, implement intended layout/reset semantics, and expose typed form state. |
| text | Schema align/fontWeight/color vs renderer textAlign/fontSize | Canonical textAlign with legacy align migration; implement or explicitly deprecate unused options; safe semantic color tokens. |
| date-range-picker | Schema startPlaceholder/endPlaceholder vs editor/runtime placeholderStart/placeholderEnd | Canonical runtime names, alias support, equivalent MCP examples. |
| date pickers | Schema minDate/maxDate/disabled/dateFormat are not consumed by current renderer | Implement constraints/format or remove them from advertised supported capabilities with migration notes. |
| stat | Renderer reads valueTemplate/trendTemplate, fixed formatting; schema also exposes value/trend/decimals/icons | Normalize aliases; honor decimals; make icon/trend fields implemented or explicitly unsupported. MCP already documents dual value fields as a workaround. |
| Vega/Vega-Lite | Builder consumes vegaSpec; schemas vary between spec and vegaSpec; editor also writes shelfSpec/editorMode | One canonical render spec, optional persisted visual authoring state, transparent aliases, generated examples. |
| chart options | Sample config nests options; renderer reads showActions/renderer/theme at root | Normalize nested and root values with deterministic precedence. |
| chart events/methods | Metadata defines mark/brush and refresh/resize; schema events omit drill events; renderer returns a raw Vega view | Expose a documented method object; synchronize actual renderer events, metadata, schemas, and MCP discovery. |
| table | dataArrayTemplate is consumed by the builder but absent from schema properties; legacy searchable/exportable/selectable coexist with object configs | Publish the real binding field; normalize aliases and object defaults; define pagination/sorting/export modes explicitly. |
| loading | Many editors/renderers support isLoading without a schema property | Add a common template-capable loading contract to all applicable widgets. |
| headers/styles | Samples often store showHeader at root; page chrome reads properties.showHeader; visual settings live across multiple layers | One properties namespace for chrome, with explicit legacy root migration and documented renderer-owned styling. |
| input booleans | !!value, strict booleans, true-string checks, and button-specific coercion differ | Normalize literal/template booleans once; false, "false", 0, "0", empty, and undefined have documented outcomes. |
| optional controls | Many schemas expose required/disabled/defaults but their editor lacks corresponding fields | Every supported setting is editable or clearly documented as advanced/API-only with a validated example. |

## 5. Shared implementation work packages

All packages are proposed work. Relative sizes: S = contained change; M = multiple components/contracts; L = cross-package integration. These are comparative estimates, not time estimates.

| ID | Priority / size | Work and acceptance criteria | Dependencies |
|---|---|---|---|
| F01 | P0 / L | Runtime state and instance identity: accept object patches and functional updates; evaluate atomically against current state; normalize initialization/reset; fix stale method closures. Give every placement/repeat a distinct runtime instance while retaining resource IDs for persistence. Verify B01/B05/B24 reproductions. | None |
| F02 | P1 / L | Event/method contract: one event delivery path; payload schemas, method argument/result metadata, programmatic-event policy, sequential action outcomes, errors/cancellation. Detect duplicate declarations and unimplemented methods. Old onClick workflows keep working. | F01 |
| F03 | P0 / M | Safe content/embed boundary: always-present sandbox, safe Markdown, source-checked messaging, URL policies, explicit script opt-in, resource cleanup. Regression fixtures demonstrate restrictions and permitted behavior. | None |
| F04 | P1 / L | Versioned widget descriptors: canonical config, schemaVersion, normalized aliases, data shape, state shape, events, methods, defaults, constraints, category, searchable tags, renderer/editor loaders. UI, API and MCP derive metadata from the same source. Existing saved configs migrate without losing events/styles. | F03 for embed fields |
| F05 | P1 / M | Field/accessibility primitives: instance IDs, label/help/error relationships, required/read-only/disabled semantics, focus states, keyboard actions, live feedback. Test multiple instances and keyboard-only use; measure contrast separately in supported themes. | F01 |
| F06 | P1 / M | Runtime parity in preview: same config normalization/state/method/event adapter as page viewer; sample and live data selection; event log; side-effect-free simulation by default with explicit live-run control. No real mutations during ordinary preview. | F01/F02/F04 |
| F07 | P1 / M | WidgetFrame and state patterns: first load, refresh with stale data, empty dataset, no search results, binding error, permission denial, partial data, action pending/success/failure. Configurable title/actions, busy semantics, preserve drafts/focus; diagnostics remain editor-only. | F04/F05 |
| F08 | P2 / M | Design tokens and responsive density: shared spacing/type/radius/status colors; comfortable/compact modes; container-aware layouts; documented minimum sizes; reduced-motion alternatives. Check light/dark, narrow cards, zoom, long text, RTL. | F05/F07 |
| F09 | P1 / M | Contract and behavior test harness: validate defaults/examples against schemas; mount every widget through the runtime adapter; assert actual events/methods/state; integration scenarios for binding, failure, duplicate instances and migrations. Source/build freshness is enforced. | F04/F06 |
| F10 | P2 / M | Authoring kit: scaffold descriptor/schema/renderer/editor/example/test; declarations generated by build; minimal typed WidgetProps; focused package scripts; contributor guide. A scaffolded widget loads in preview and MCP discovery without hand-editing multiple parallel inventories. | F04/F09 |
| F11 | P1 / L | File/media service: retain File objects in an ephemeral nonserializable registry, not page JSON; upload through a tenant-scoped service returning opaque asset IDs/authorized URLs; cancellation/progress/retry; validation on server and client; cleanup. | F01/F02/F03 |
| F12 | P1 / L | Composition adapter: owned child-slot definitions, nesting rules, scope/identity, traversal, keyboard movement, lazy/keepMounted policy and import/export remapping. Reuse Craft layout; do not create a second layout engine. | F01/F04/F06 |
| F13 | P2 / M | Data/binding tools: type-aware binding picker, literal vs expression mode, resolved-value preview, expected shape/errors, listeners/workflows/queries, shared option normalization, dependency inspection and stale/error handling. No need to manufacture a processor for config-only widgets. | F04/F06/F07 |
| F14 | P2 / L | Library lifecycle: categories, tags, meaningful previews, version/changelog, dependency/compatibility checks, author metadata, clone/install destination and undo where possible; add visible load-error/retry. Maintain current dry-run/reconnect flows. | F04/F09 |
| F15 | P1 / L | API/MCP contract: validate widget type and versioned config, validate templates without rejecting valid expressions, structured field errors, read/modify/write examples, patch or revision-checked updates to prevent lost configuration. Retain full-replace compatibility and tenant authorization. | F04/F09 |
| F16 | P2 / M | Performance and observability: inspect built chunks before claiming lazy loading; lazy-load heavy editors/renderers; profile realistic pages; bounded render data; dependency-scoped updates; diagnostics for render duration/event failures and leak cleanup. Record baselines and budgets. | F06/F09 |

### Builder and authoring UX requirements

- Catalogue: group by user task, searchable aliases/tags, informative thumbnails, keyboard navigation, favourite/recent widgets, and an empty-search recovery action.
- Creation: choose a type or recipe, preview useful sample data, name it, bind data, then attach actions. Replace blank initial forms with safe meaningful defaults.
- Inspector: consistent groups for Content, Data, Validation, Appearance, Behavior, Accessibility, and Advanced. Hide irrelevant settings until enabled; preserve values while toggling modes.
- Expressions: literal/expression switch, autocomplete, expected type, resolved sample, missing-path errors and copyable binding path. Explain the actual error near the setting.
- Options/columns/fields: structured row editors with add/reorder/duplicate/delete, stable IDs, validation and bulk JSON import as an advanced path.
- Editing: undo/redo, reset a field to default, distinguish inherited vs customized settings, unsaved-change protection, clear save/publish feedback.
- Interaction preview: show event payload and action outcome; default to simulated mutations; expose a deliberate live-run mode.
- Placement: click/keyboard insertion as well as drag; selected-widget controls visible on focus and touch; keyboard reorder and resize; save responsive layout choices.
- Reuse: make resource edits vs placement overrides explicit; preview impacted pages before changing shared resources.
- Documentation: every widget has a binding example, event/method example, keyboard guide, empty/error behavior and compatibility notes.

## 6. Specifications for all existing widgets

Each E item inherits F04–F09 requirements. Events and properties below describe the **target**, unless explicitly labelled current. New fields are proposals; inspect current source before implementing.

### E01 — Vega-Lite chart

Priority: P1 · Size: L · Dependencies: F02/F04/F06/F16. Source: `packages/widgets-ui/src/vega/` and `packages/widgets-logic/src/vega/builder.js`.

- Current: visual shelf builder, raw spec editor, mark click/brush, shared Vega renderer. Keep existing supported marks and raw escape hatch.
- UI: coherent legend/tooltip/type scales; theme-aware categorical and diverging palettes; preset picker; accessible description and optional data-table alternative.
- UX: one mark/brush event per gesture; preserve original raw spec on a lossy mode switch; preview proposed changes and provide undo; explain no-data vs invalid-spec states; resize with the card.
- DX: normalize spec/vegaSpec/options; preserve unsupported raw fields; wrap refresh/resize methods; cancel stale asynchronous embeds and finalize discarded views.
- Target state/events: selectedDatum, brush, renderStatus; onMarkClick, onBrush, onRenderError. Parameters and payloads must be discoverable.
- Acceptance: visual → raw → visual preserves supported fixtures; foreign raw specs are retained on cancel; one click means one action chain; rapidly replace/unmount a chart without a retained view or stale render.

### E02 — Vega chart

Priority: P1 · Size: M · Dependencies: F02/F03/F04/F16. Source: shared Vega renderer and builder.

- Current: full Vega grammar through raw authoring; visual shelf builder is Vega-Lite-only.
- UI: schema-aware JSON editor, named-data inspector, signal inspector, theme-aligned container and helpful errors.
- UX: configure signal names explicitly; support full Vega signals as well as Lite parameters; loading should preserve the last successful visual when safe.
- DX: canonical vegaSpec with spec alias; named dataset mapping, well-defined loader/resource policy, typed refresh/resize/setSignal methods; keep resource cleanup.
- Target events: onSignalChange {name,value}, onMarkClick {datum}, onRenderError; do not assume a signal is named brush.
- Acceptance: a fixture using top-level Vega signals emits configured events once; resize does not reset selection unnecessarily; invalid source produces actionable editor diagnostics and a recoverable viewer state.

### E03 — Button

Priority: P1 · Size: M · Dependencies: F02/F05/F07. Source: `button/buttonWidget.jsx`.

- Current: variants, size, icons, alignment, full width, disabled and busy support; async onClick handling already exists.
- UI: consistent primary/secondary/destructive hierarchy, icon-only accessible label, configurable busy/success labels and responsive text treatment.
- UX: prevent duplicate submissions; optional destructive-action confirmation with record-specific context; surface failed action results and allow retry.
- DX: implement advertised click method through the same guarded action path; define onSubmit's scope rather than advertising an event no renderer fires; normalize loading aliases.
- Target config: ariaLabel, loadingText, confirmation {enabled,title,message,confirmLabel}; methods click/focus where supported.
- Acceptance: mouse, keyboard and method invocation each execute once; disabled/busy blocks all routes; failed actions restore usability; long labels remain understandable.

### E04 — Data table

Priority: P1 · Size: L · Dependencies: F01/F02/F04/F05/F07/F16. Source: `table/` and TableWidgetBuilder.

- Current: sorting, client/server search, pagination, typed cells, CSV/JSON export, row/bulk editing and multi-selection.
- UI: resizable/reorderable/pinnable columns, visibility chooser, density, truncation details, saved views; sticky areas must not obscure content.
- UX: stable rowKey; explicit client/server pagination and sorting; typed filters and sorting payloads; retain selection by ID; distinguish current-page vs all-matching selection; keyboard-accessible row action and edit entry.
- Editing: per-column type/validation, nested-path updates, draft/change indicators, pending state, success/failure handling, partial bulk failures and optimistic rollback where used. Make Escape cancel without a blur commit; current EditableCell sets the old value and blurs through a commit handler, which needs regression coverage.
- Export: explicit page/filtered/selected/all scope; safe spreadsheet text export policy, raw vs formatted values, proper permissions, revoke download URLs.
- DX: publish dataArrayTemplate; normalized aliases; state {selectedRowIds,selectedRows,sort,filters,page,pageSize,drafts}; events onSortChange/onFilterChange and existing events with additive rowId payloads.
- Acceptance: same-length refresh cannot retarget selection; nested user.name editing produces a real nested update; Escape discards the active cell edit; failed saves retain drafts; one row click executes one action chain; client and server sort affect displayed rows correctly; export scope matches visible copy; large-data fixture uses bounded DOM and recorded measurements.

### E05 — Text / Markdown

Priority: P0 safety, P2 expansion · Size: M · Dependencies: F03/F04/F08. Source: `text/textWidget.jsx`.

- Current: plain and custom regex-based Markdown, template content, alignment and size.
- UI: readable typography, useful heading rhythm, responsive code/table overflow, consistent links and tokens.
- UX: safe links, optional external-link indication, copy code, predictable line wrapping; no executable raw HTML by default.
- DX: safe parser/sanitizer pipeline; canonical textAlign with align alias; implement/deprecate fontWeight/color explicitly; shared stylesheet instead of per-instance injected rules.
- Target config: format plain/markdown, content, allowed link policy, typography tokens; text remains display content unless an action is explicitly configured.
- Acceptance: raw tags, event attributes and unsafe protocols do not execute; plain text escapes literally; nested lists/fences render consistently; existing simple Markdown remains readable.

### E06 — Stat / KPI

Priority: P2 · Size: M · Dependencies: F04/F07/F08/F13. Source: `stat/`.

- Current: value/prefix/suffix, trend percentage, direction semantics, alignment; fixed numeric precision.
- UI: adaptive value sizing, compact/large variants, optional sparkline and comparison label; status must include text/icon rather than color alone.
- UX: explicit period and comparison basis; differentiate 0, no data, error and stale data; optional click-through action with keyboard access.
- DX: canonical valueTemplate/trendTemplate, aliases, configurable locale/currency/unit/notation/decimals; finite-number guards; implement optional icons consistently.
- Target config: format {style,currency,unit,notation,decimals,locale}, comparisonLabel, updatedAtTemplate, optional sparklineData.
- Acceptance: 0 is displayed; null is not turned into 0; negative/large/decimal values format as configured; up-is-good/down-is-good communicate the intended meaning.

### E07 — Alert banner

Priority: P1 · Size: M · Dependencies: F02/F04/F05/F07. Source: `alert/`.

- Current: info/success/warning/error, title/message, local dismissal.
- UI: semantic status tokens in supported themes, long-message wrapping, optional action and readable dismissal target.
- UX: meaningful announcement urgency; reset dismissal when an explicit message identity changes; configurable dismissal persistence; recover/undo when appropriate.
- DX: reconcile visible/icon settings with runtime; expose dismissed state and show/dismiss/reset methods; onDismiss includes message identity and source.
- Acceptance: a new message is not hidden by an unrelated old dismissal; normal notices do not interrupt repeatedly; keyboard dismissal returns focus sensibly; configured actions emit once.

### E08 — Form

Priority: P1 · Size: L · Dependencies: F01/F02/F04/F05/F07/F12.

- Current: configured text/select/checkbox fields, defaults, submit and optional reset; draft is local.
- UI: sections, responsive columns, field help, inline errors, error summary and consistent action area.
- UX: dirty/touched state; validate before submission; conditional fields; typed values; async validation; focus first invalid field; pending/success/failure; preserve drafts on unrelated reactive updates.
- DX: reuse standalone field contracts rather than duplicating coercion; expose values/errors/isValid/isDirty/isSubmitting; methods validate/reset/setValues/submit; reconcile layout/columns/size/reset labels.
- Boundary: support standalone field widgets through a form context/child model only after F12; avoid nested native forms.
- Acceptance: required selects/checkboxes block invalid submit; numeric values remain numbers; refreshed defaults do not overwrite dirty edits; failure retains data; reset applies documented defaults and emits a reset event once.

### E09 — Image

Priority: P2 · Size: M · Dependencies: F03/F05/F07/F11.

- Current: URL, alt, fit, radius and click event; editor also supports asset upload.
- UI: aspect ratio, focal point, caption, placeholder/broken-image fallback and optional lightbox.
- UX: decorative empty-alt mode; make images buttons/links only when actionable; preserve aspect during loading; keyboard lightbox and close/focus return.
- DX: implement schema linkUrl/linkTarget or explicitly deprecate; lazy/eager and responsive sources; loaded/error events; serializable click payload rather than raw DOM event.
- Acceptance: broken source recovers; decorative alt stays empty; allowed destinations open as configured; no duplicate click/action chain; uploaded assets follow tenant service policy.

### E10 — Iframe embed

Priority: P0 isolation, P1 contract · Size: M · Dependencies: F03/F04/F07.

- Current: renderer url, script/form/popup/origin toggles; schema uses different fields.
- UI: editable descriptive title, loading and blocked-embed fallback, open-source action where allowed.
- UX: capability presets explain consequences; explicit permissions and referrer policy; no claim of detecting cross-origin frame failures perfectly.
- DX: keep sandbox even when empty; normalize src/url; validate URLs, fullscreen/allow flags and same-origin/script combinations; load/message/refresh contracts.
- Acceptance: all-disabled yields sandbox=""; legacy src renders through migration; blocked framing offers a useful fallback; message handling cannot trust arbitrary windows.

### E11 — Date / time picker

Priority: P1 · Size: L · Dependencies: F01/F04/F05.

- Current: calendar, optional hours/minutes/seconds, default and clear.
- UI: compact date/time composition, localized display, selected/today distinction, month/year navigation and readable labels.
- UX: genuine clear vs reset, typed entry, constraints/disabled dates, required/read-only/disabled, keyboard grid, accessible trigger; explicit timezone semantics.
- DX: date-only YYYY-MM-DD stays a calendar date; datetime mode explicitly chooses local wall time or an offset-aware instant; do not silently reinterpret legacy offset-free strings.
- Target methods: setValue/clear/reset/open/close/focus; events contain consistently documented value/date/time and source.
- Acceptance: B06 remains cleared; min/max/disabled are enforced for typed and clicked values; month-end/year/leap transitions work; no duplicate open/close/change; date-only round trips without day shifts.

### E12 — Date range picker

Priority: P1 · Size: L · Dependencies: E11/F04/F05.

- Current: two calendars, presets in renderer, optional time, automatic end ordering.
- UI: one-calendar mode in narrow containers, clear start/end labels, optional preset rail and range summary.
- UX: separate draft range from applied value; optional Apply/Cancel; validate end >= start including time edits; configurable inclusive/exclusive end; partial range semantics.
- DX: normalize placeholder aliases; expose presets/constraints in editor; state {draftStart,draftEnd,start,end,isOpen}; methods setRange/clear/reset.
- Acceptance: same-day inverted times are rejected; defaults do not undo clear; presets respect timezone/boundaries; mobile popover fits; cancelled range leaves applied values unchanged.

### E13 — Custom HTML

Priority: P0 isolation, P1 API · Size: M · Dependencies: F03/F04/F06.

- Current: iframe srcDoc from HTML/CSS, optional capability flags, onMessage and refresh.
- UI: HTML/CSS editor tabs, safe preview, descriptive frame title, readable errors and inherited theme values passed explicitly.
- UX: script opt-in with clear capability controls; preview mutations isolated; refresh should not race or restore obsolete content.
- DX: sandbox="" default, source-checked message envelope, payload limits/schema, explicit setData/postMessage bridge; reconcile js/height/scrollable.
- Acceptance: untrusted messages are ignored; permitted messages reach only the intended instance; theme context does not depend on CSS variables crossing the iframe; timers/listeners are cleaned on unmount.

### E14 — Text input / textarea

Priority: P1 · Size: M · Dependencies: F01/F04/F05.

- Current: several native input types, multiline mode, defaults, change/focus/blur, setValue/clear/focus.
- UI: optional prefix/suffix, character count, multiline autosizing with limits, help and validation errors.
- UX: IME-safe updates, password reveal where applicable, read-only distinct from disabled, debounce only when configured; exact empty/reset semantics.
- DX: keep numeric conversion out of generic text unless explicit type policy; expose required/maxLength/rows/disabled in editor; state dirty/touched/error and typed validation.
- Acceptance: label focuses the right instance; composition typing is not truncated; max length and errors are announced; setValue and user edits follow the documented event policy.

### E15 — Select

Priority: P1 · Size: M · Dependencies: F01/F02/F04/F05/F13.

- Current: static/bound options, label/value keys, string-coerced UI values, defaults; advertised clear/open/close are incomplete.
- UI: grouped options, optional descriptions/icons, clear control, explicit loading/empty/no-results.
- UX: search for long lists, async loading/cancellation, disabled options, keyboard navigation, selection preserved while options refresh.
- DX: shared option normalizer retains original value types; avoid collisions between 1 and "1"; validate empty/duplicate values; implement clearable and event contracts.
- Acceptance: onOpen/onClose each fire once; required selection validates; clearing restores placeholder; numeric and string IDs are not conflated; obsolete async responses do not replace newer options.

### E16 — Multi-select

Priority: P1 · Size: M · Dependencies: E15/F05.

- Current: popover, local filter, checkboxes, selection count and maxSelected; removable value summary.
- UI: selected chips with overflow summary, clear outside the trigger button, full labels on demand.
- UX: announce selection limits; disable excess unselected options with explanation; select-all applies to a defined scope; keyboard remove/navigate; async selected-label hydration.
- DX: stable typed option identities, consistent labelKey/valueKey precedence, min/max selection validation, disabled/read-only behavior.
- Acceptance: nested interactive trigger controls are removed; maxSelected constrains methods as well as clicks; missing current options do not silently delete selected IDs; keyboard-only selection works.

### E17 — Checkbox

Priority: P1 · Size: S · Dependencies: F01/F04/F05.

- Current: label/description, boolean value, setValue/clear/toggle; fixed ID and initial-closure toggle.
- UI: consistent checked/unchecked/indeterminate and error presentation.
- UX: clickable associated label, optional required agreement, explicit indeterminate behavior and read-only policy.
- DX: strict common boolean normalization; optional tri-state is opt-in; methods operate on current state.
- Acceptance: two toggles restore original state; "false" does not initialize as true; multiple checkboxes have unique associations; no indeterminate string is accidentally stored as true.

### E18 — Radio group

Priority: P1 · Size: M · Dependencies: F01/F04/F05/F13.

- Current: static/bound options, horizontal/vertical orientation, value/clear; option IDs can collide.
- UI: optional card/segmented presentation, wrapped horizontal layout, descriptions and per-option disabled state.
- UX: labelled group, arrow-key behavior, required validation, no-selection/reset choice where appropriate.
- DX: typed values and stable option identity; expose bound options and label/value keys in the editor; instance-scoped IDs.
- Acceptance: identical option sets in different widgets remain independent; label/value mapping and disabled options work; arrow keys change exactly one selection.

### E19 — Switch

Priority: P1 · Size: S · Dependencies: F01/F02/F05.

- Current: boolean default, label/description, toggle/clear methods.
- UI: optional on/off captions and pending feedback, correct control-label association.
- UX: define immediate setting behavior; optional async confirmation with rollback; failure stays visible and recoverable.
- DX: current-state toggle and common coercion; distinguish a committed value from an in-flight requested value.
- Acceptance: repeated toggles and changed defaults behave correctly; a failed remote update restores the previous value without emitting an endless loop; disabled applies to every route.

### E20 — Slider

Priority: P1 · Size: M · Dependencies: F01/F04/F05.

- Current: one native range, numeric min/max/step, current value and programmatic methods.
- UI: larger interaction area, optional ticks/units and paired numeric input; vertical orientation only with deliberate sizing.
- UX: separate continuous onChange from committed onCommit to control query traffic; precise keyboard adjustment and disabled semantics.
- DX: finite bounds, min <= max, step > 0, clamp/snap across user/programmatic values; live methods use current limits.
- Acceptance: bad values never yield NaN/Infinity; methods respect changed bounds; drag updates display immediately but one commit triggers the expensive action; label and value are announced.

### E21 — Search input

Priority: P1 · Size: M · Dependencies: F01/F02/F05/F13.

- Current: local text, immediate change, debounced search, clear and methods.
- UI: compact/comfortable variants, visible search/clear labels, searching/result status.
- UX: cancel timers on clear/setValue/unmount; Enter optionally commits immediately; Escape follows explicit clear policy; IME composition does not launch partial searches.
- DX: normalized debounce/minLength, cancellation signal/request version, optional query-param sync through existing page URL facilities.
- Acceptance: typing "abc" then clearing before debounce never emits a later "abc"; only newest results are applied; empty search and no matches differ.

### E22 — File upload

Priority: P1 · Size: L · Dependencies: F01/F02/F05/F11.

- Current: file picker, size guard and metadata list. Runtime uploading and byte access are absent from this widget.
- UI: accessible dropzone plus browse button, per-file previews/progress/status, clear size/type limits and individual errors.
- UX: batch limits/count, remove/cancel/retry, partial success, upload-on-select vs manual-upload mode, disabled/read-only and duplicate selection policy.
- DX: keep raw Files ephemeral; state contains asset IDs/metadata/status only; service validates content, limits and tenant scope; revoke preview object URLs; never persist base64 by default.
- Target methods/events: upload/cancel/retry/remove/clear; onSelect/onUploadProgress/onUploadSuccess/onUploadError/onRemove with fileId.
- Acceptance: workflow can use an authorized persisted asset; disallowed content is rejected server-side; failed files retry independently; navigate away without leaked requests or URLs.

### E23 — Divider

Priority: P2 · Size: S · Dependencies: F08.

- Current: horizontal/vertical, label, spacing; thin and medium use identical horizontal classes; vertical ignores thickness.
- UI: distinct supported thicknesses, token colors, label alignment and wrapping.
- UX: use decorative/semantic separator modes deliberately; vertical sizing follows container; avoid unreadable narrow labels.
- DX: simplify duplicate values or render real differences; share spacing tokens with layout.
- Acceptance: each advertised thickness has observable intended behavior in both orientations; labelled divider does not create misleading heading hierarchy.

### E24 — Tabs

Priority: P1 · Size: L · Dependencies: F01/F02/F05/F12.

- Current: selection bar only; no owned content panels in renderer. Preserve this as selector mode.
- UI: scrollable/overflow tabs, disabled items, optional badges/icons and vertical presentation.
- UX: selector vs container modes explicit; optional URL sync; stable selected value when tabs change; lazy/persist panel state policy; keyboard access and focus management.
- DX: integrate owned child slots for container mode, stable tab IDs and import/export remapping; method setTab validates the target.
- Acceptance: selector mode keeps existing pages working; container mode shows the selected panel with correct associations; unmounting one panel does not destroy unrelated instance state.

### E25 — Key/value details

Priority: P2 · Size: M · Dependencies: F04/F08/F13.

- Current: bound object or items, one to three columns, string formatting.
- UI: responsive detail rows, optional dividers, labels wrapping, configurable order, null display and typed status/link/date values.
- UX: copy individual values with feedback, optional reveal/redaction, expand long/nested values; default display has no clickable outer wrapper.
- DX: nested paths, field descriptors/formatters, semantic dl markup, shared locale formatting; redact before copy/export.
- Acceptance: small card becomes one column; 0/false remain meaningful; long values do not overflow; masked values cannot be copied unmasked without explicit authorized reveal.

### E26 — JSON viewer

Priority: P1 · Size: M · Dependencies: F04/F05/F16.

- Current: shared tree and copy; collapsed is passed but not consumed as an expansion control.
- UI: expand/collapse all, path search, type styling, large-string preview and copy-path/value.
- UX: clear primitive/null/undefined cases; accessible tree expansion, preserved focus and expansion on compatible refresh; visible clipboard failure.
- DX: shared component expansion API, depth/node limits, safe circular/large-value behavior; redact configured secrets before display/copy; avoid root click actions from internal expansion buttons.
- Acceptance: collapsed controls initial and subsequent expansion as documented; rejected clipboard writes never show false success; huge/circular inputs degrade safely without freezing.

### E27 — List

Priority: P1 · Size: M · Dependencies: F01/F02/F04/F13/F16.

- Current: rows/cards, local JSON-string filter, title/subtitle/meta mapping, clicked-item state.
- UI: consistent item templates, optional avatars/status/actions, container-aware cards and useful empty/loading states.
- UX: stable selected ID across filtering/refresh, pagination/infinite loading, separate no-data/no-match messages; per-item actions do not select/open accidentally.
- DX: itemKey, nested mapping paths, typed searchable fields, actual onSearch emission with debounce policy; selectedItemId and sourceIndex vs visibleIndex.
- Acceptance: filter/reorder never changes selected record identity; onSearch receives the documented term once; large lists use bounded rendering; hidden metadata is not searched accidentally.

### E28 — Badge

Priority: P2 · Size: S · Dependencies: F04/F05/F08.

- Current: text/variant/size and outer-div click handler.
- UI: semantic status presets, icon/dot/count and configurable alignment, long-text handling.
- UX: static badge remains noninteractive; actionable badge becomes a keyboard-operable button/link with a clear name; status not encoded by color alone.
- DX: status-to-presentation mapping, optional tooltip, bounded count formatting and serializable action payload.
- Acceptance: all supported variants are legible in supported themes; an action fires once by keyboard; long status stays understandable without breaking layout.

### E29 — Progress

Priority: P1 semantics, P2 expansion · Size: M · Dependencies: F04/F05/F08.

- Current: percent clamped 0–100, bar/ring, label/status; no progress semantics.
- UI: adaptive ring size, labels/units, semantic status tokens and optional segment stages.
- UX: determinate/indeterminate distinction, current/total display, completion/failure messages, cancel action where backed by a real operation; reduced motion.
- DX: min/max/value, explicit unknown value, role/attributes, optional completion event fired only on state transition; no implicit action on static progress.
- Acceptance: unknown is not displayed as 0%; accessible value/name reflect actual progress; ring fits a narrow card; completion does not repeatedly fire on rerender.

### E30 — Timeline

Priority: P2 · Size: M · Dependencies: F04/F08/F13/F16.

- Current: bound events, title/time/description mapping and item clicks.
- UI: actor/avatar/status, grouped dates, compact/expanded entries and responsive time placement.
- UX: locale/timezone formatting, stable event IDs, chronological ordering, load older events, filters and live-arrival indicator without moving the reader.
- DX: eventKey, timestamp parsing policy, cursor pagination, rich content through safe renderers; distinguish business activity from authoritative audit records.
- Acceptance: invalid timestamps show a fallback; equal timestamps have deterministic order; append/refresh preserves focus and scroll; action payload includes stable ID.

### E31 — Video

Priority: P2 · Size: M · Dependencies: F02/F03/F07/F11.

- Current: native video URL/poster, controls/autoplay/loop/muted.
- UI: aspect ratio and fallback, loading/buffering/error feedback, caption-track configuration.
- UX: captions/transcript, playback speed, poster, preload policy; autoplay default off and blocked autoplay recoverable; controls remain accessible.
- DX: play/pause/seek methods, bounded timeupdate event frequency, onPlay/onPause/onEnded/onError, validated sources/tracks and resource cleanup.
- Acceptance: invalid URL has recovery UI; captions can be selected; events are not duplicated by wrapper clicks; remote play rejection is handled; unmounted media does not keep playing.

### E32 — Code block

Priority: P2 · Size: M · Dependencies: F03/F05/F08/F16.

- Current: escaped read-only code, language label, wrap and copy; language does not drive syntax highlighting.
- UI: optional lazy syntax highlighting, line numbers, configurable wrap, filename/title and highlighted lines.
- UX: copy success/failure feedback, keyboard access, useful empty state, no accidental outer-click action while copying.
- DX: lazy language modules, maximum display size, optional download, timer cleanup; no execution capability implied by read-only code.
- Acceptance: markup remains escaped; clipboard denial shows failure; huge snippets are bounded; exact source whitespace is preserved on copy regardless of visual wrapping.

## 7. Additional widget catalogue

These **40 additions are proposals** absent as standalone registered types in the inspected WIDGETS_MAP. Some are compositions or presets over existing functionality. Prefer reuse and do not create duplicate chart/rendering/layout engines.

All N items require a descriptor/schema, editor, sample, state/events/methods when relevant, safe empty/error states, page/preview integration, and tests. Names are proposed stable type IDs.

### Inputs and selection

| ID / proposed type | Priority / size | MVP specification, state and interaction contract | Acceptance / dependencies |
|---|---|---|---|
| N01 · number-input | P1 / M | Typed numeric/decimal field, min/max/step, precision, optional locale display and increment controls; state value:number|null plus rawDraft; onChange/onCommit; setValue/clear/focus. | Empty is null, partial typing survives, invalid/overflow values show errors; no precision loss silently accepted. F01/F05/F13. |
| N02 · currency-input | P2 / M | Number-input specialization with ISO currency, locale, minor-unit policy and explicit storage representation; state amount and currency; optional currency selector. | Amount round-trips for 0/2/3 decimal currencies without float surprises; currency changes do not silently convert amounts. N01. |
| N03 · time-picker | P2 / M | Standalone time-of-day field, 12/24-hour display, step seconds/minutes, min/max, typed entry; value HH:mm:ss or null; onChange/onCommit. | Keyboard/typed selection agree; timezone-free time remains distinct from an instant. E11/F05. |
| N04 · autocomplete | P1 / M | Searchable single select with static/remote suggestions, debounce/min characters, grouping and optional explicit free text; value and inputValue tracked separately. | Only newest request applies; selected ID persists when suggestion list changes; keyboard combobox works. E15/F13. |
| N05 · checkbox-group | P2 / M | Multi-choice options without a popover, layout/orientation, min/max, descriptions, select-all scope; value array of typed IDs; onChange and clear. | Group validity and select-all announced; disabled items excluded from mutation; stable types. E16/E17. |
| N06 · segmented-control | P2 / S | Small mutually exclusive choices with text/icons/counts, responsive overflow and disabled items; value; onChange/setValue. | Uses selection semantics, distinct from content tabs; arrow-key and RTL behavior verified. E18/F05. |
| N07 · tree-select | P2 / L | Hierarchical single/multiple selection, lazy children, search, parent/leaf policy and indeterminate states; selectedIds/expandedIds; onSelect/onExpand. | No ambiguous parent selection; lazy errors recover; keyboard expansion and large-tree limits. E15/F13/F16. |
| N08 · cascading-select | P2 / M | Dependent levels such as country/state/city with explicit parent-child mappings and remote options; path values; onLevelChange/onChange. | Changing parent clears incompatible descendants; race cancellation prevents stale children; required validation per level. E15/F13. |
| N09 · tags-input | P2 / M | Create/select tokens with validation, deduplication, max items/length, paste delimiters and optional suggestions; string[] or typed IDs. | Paste respects limits; keyboard delete and invalid-token recovery; no silent duplicate loss. E16/F05. |
| N10 · rich-text-editor | P2 / L | Limited formatting, links, lists and optional sanitized images; structured document as canonical state plus safe read-only output; onChange/onBlur. | Paste sanitization, keyboard toolbar, predictable serialization and no unsafe HTML; heavy editor lazy-loaded. F03/F11/F16. |
| N11 · code-editor | P2 / L | Editable code with lazy language modules, validation, format, read-only and save; value/dirty/diagnostics; onChange/onSave; focus/format. | Editor never executes source; bounded size; accessible controls, unsaved-state behavior; reuse shared CodeEditor. F05/F16. |
| N12 · json-editor | P2 / M | Code-editor specialization with JSON schema validation, tree/raw modes, errors by path and format; value plus rawDraft/isValid. | Invalid draft never overwrites last valid value; tree/raw round trips; circular/non-JSON input explained. N11/F04. |
| N13 · rating | P3 / S | Numeric rating with min/max/step, labels, optional aggregate count, editable/read-only modes; value; onChange. | Keyboard selects fractional steps; accessible text equivalent; static ratings not actionable. F05. |
| N14 · color-picker | P3 / M | Token/palette selection plus optional custom color with format/alpha controls; canonical color or token ID; onChange/onCommit. | Invalid colors recover; keyboard text alternative; token references preserved; browser eye-dropper optional. F05/F08. |
| N15 · signature-pad | P3 / M | Pointer/touch signature capture, clear/undo, stroke options and explicit save to asset service; transient drawing, persisted assetId. | Touch does not trap page scrolling outside pad; interruption cleanup; empty signatures rejected; no claim of legal identity verification. F11. |

### Data, analysis and work management

| ID / proposed type | Priority / size | MVP specification, state and interaction contract | Acceptance / dependencies |
|---|---|---|---|
| N16 · chart presets | P1 / M | Bar/line/area/scatter/pie/heatmap presets backed by existing Vega-Lite; typed x/y/series mapping, aggregation, legend and drill-down. Ship as recipes before new type IDs. | Users make a valid chart without raw JSON; generated spec opens in existing editor; no second chart engine. E01/F13. |
| N17 · pivot-table | P2 / L | Row/column/value dimensions, aggregates, totals, sorting, drill-through and export; config stores pivot definition; onCellClick carries dimension filters. | Aggregates reconcile with source fixture; empty/null grouping documented; bounded data and server path for scale. E04/F13/F16. |
| N18 · kanban | P2 / L | Cards grouped by status with configured itemId/group/order fields; columns, WIP count, card actions and move confirmation; onMove {id,from,to,index}. | Keyboard move alternative; optimistic rollback on failure; stable IDs and concurrent-update conflict handling. F01/F02/F16. |
| N19 · calendar | P2 / L | Month/week/list views, timezone-aware events, all-day distinction, resources optional; selectedEvent/dateRange/view; onEventClick/onRangeChange/onEventMove. | Daylight-boundary/all-day fixtures; no hover-only actions; edits preserve timezone; keyboard agenda alternative. E11/E12/F13. |
| N20 · tree-table | P2 / L | Hierarchical rows with configurable parent/children keys, expansion, selection and lazy load; expandedIds/selectedIds; row actions. | Parent/child identity stable under loading; keyboard navigation; cycles/depth constrained; reuse table formatters. E04/F16. |
| N21 · map | P3 / L | Marker/cluster view from lat/lng and IDs, selected marker, fit bounds, optional GeoJSON layers; onMarkerClick/onBoundsChange. | Invalid coordinates rejected; accessible list alternative; provider configuration stays server-managed where secret; explicit tile attribution. F03/F13/F16. |
| N22 · gantt | P3 / L | Tasks with stable IDs, start/end/progress, dependencies and zoom; onTaskSelect/onDateChange; read-only MVP before drag edits. | Date-range validation, dependency cycles detected; keyboard/table alternative; failed changes rollback. E11/F02/F16. |
| N23 · record-detail | P1 / M | Structured details using key-value formats, sections, selected record binding and edit action; recordId/record; onAction. | Field order/redaction/null formatting configurable; table → detail binding works; reuse E25 rather than duplicate formatting. E25/F13. |
| N24 · card-grid | P2 / M | Repeated responsive cards, image/title/status/actions and pagination from mapped records; selectedIds; onItemClick/onAction/loadMore. | Responsive by card width; stable IDs; nested action does not trigger card opening; implement as List preset first. E27/F12/F16. |
| N25 · audit-log | P2 / M | Read-only actor/action/resource/time/outcome list, filters, details and export; cursor-based source; onEntrySelect. | Displays server audit records and permissions; never implies UI state is an authoritative audit trail; no secret payload leakage. E30/E04/F13. |
| N26 · diff-viewer | P2 / M | Before/after text or JSON with inline/side-by-side modes, path filters, wrap and copy; selectedChange optional. | Handles added/removed/null keys; narrow view uses inline; long diffs bounded; no code execution. E32/F16. |

### Composition, navigation and feedback

| ID / proposed type | Priority / size | MVP specification, state and interaction contract | Acceptance / dependencies |
|---|---|---|---|
| N27 · container-card | P1 / M | Child-slot card with optional title/description/actions and token-based surface/padding; integrates existing Craft container. | Nested widgets retain IDs/bindings; editor/viewer sizing agrees; no parallel layout model. F12/F08. |
| N28 · modal | P1 / L | Portal dialog owning child slots, title/description, controlled open, size/close policy; open/close/toggle methods and onOpen/onClose. | Focus trap/return, Escape and backdrop policy, nested overlays, scroll lock; unsaved forms guarded. F12/F05. |
| N29 · drawer | P2 / M | Side/bottom panel variant over shared overlay contract, child slots, responsive side/size; open/close and events. | Narrow-screen fit and focus return; repeated instance isolation; avoid creating a second modal lifecycle. N28. |
| N30 · accordion | P2 / M | Labelled collapsible sections with child slots, single/multiple expansion, optional persistence and lazy mount; expandedIds. | Header keyboard behavior and associations; hidden controls not focusable; child-state policy explicit. F12/F05. |
| N31 · stepper-wizard | P2 / L | Ordered step panels, progress, validation gates, Back/Next/Finish, optional resumable draft; activeStep/completedSteps; next/back/goTo/submit. | Invalid step cannot advance; failed submit keeps draft; hidden panels handle focus/state correctly. E08/F12/N28. |
| N32 · navigation-menu | P2 / M | Page/route/external destinations, nested groups, permissions, active route, icons and collapse; onNavigate optional. | Uses existing router and authorization; keyboard and mobile menu; hiding a link does not substitute for server checks. F03/F05. |
| N33 · breadcrumb | P2 / S | Explicit or route-derived ancestry, labels, current-page semantics and overflow; navigation uses router. | Current node not misleadingly linked; long path collapses accessibly; user-controlled labels escaped. F05. |
| N34 · button-group-menu | P2 / M | Related actions, split button or overflow menu, per-action busy/disabled/confirmation and payload; onAction {actionId}. | Action chain executes once; keyboard menu works; destructive action has specific confirmation; preserve action identities. E03/F02/F05. |
| N35 · status-stepper | P2 / M | Read-only process stages with labels/timestamps/outcomes and optional configured actions; currentStage/stages; onStageClick. | Unknown/failed/skipped states explicit; status conveyed without color; process state comes from data, not implied completion. E29/F08. |

### Files, identity and operations

| ID / proposed type | Priority / size | MVP specification, state and interaction contract | Acceptance / dependencies |
|---|---|---|---|
| N36 · document-viewer | P2 / L | Authorized PDF/image preview, filename, page controls, search where supported and optional download; page/status; onLoad/onError. | Unsupported formats explain fallback; signed URLs refreshed safely; large files bounded; download permissions checked server-side. F03/F11/F16. |
| N37 · audio-player | P3 / M | Native audio with title/artwork, controls, playback speed, optional transcript; playback status; play/pause/seek events/methods. | Keyboard controls; blocked play/errors recover; unmount stops media; transcript access; no autoplay surprise. E31. |
| N38 · avatar-user | P2 / S | Image/initials/name/status with optional profile action and group overflow; user ID retained separately from display text. | Broken images fall back; alt/name avoids duplication; presence has text equivalent; action keyboard accessible. E09/E28. |
| N39 · comments-thread | P3 / L | Paged comments with author/time, safe rich/plain body, reply/edit/delete based on server permissions; draft/pending; onCreate/onEdit/onDelete. | Failed posts preserve draft; optimistic IDs reconcile; permission checked on server; safe content and attachments. F02/F03/F11. |
| N40 · query-filter-builder | P1 / L | Typed AND/OR filter tree, field/operator/value controls, nesting limits, saved presets; emits serialized filter AST and onApply/onClear. | Adapter compiles parameterized queries server-side; no concatenated raw SQL; field/operator validation; keyboard grouping; works with table/chart queries. F04/F05/F13/F15. |

### Additions intentionally implemented through reuse

- Chart varieties, sparklines, gauges and geographic Vega visualizations can first be templates/presets under existing chart support.
- Email/password/URL inputs and textareas are generic text-input modes until a dedicated validation/interaction need justifies a new type.
- Currency/percentage are shared numeric formatting specializations.
- Card-grid, record-detail and audit-log share list/key-value/timeline/table primitives.
- Toasts already exist as runtime actions; add a persistent notification-centre widget only if a persisted notification source and product demand exist.
- Rows/columns/repetition already exist in layout; container/modal/accordion work is about editor-owned child slots and interaction, not rebuilding positioning.

## 8. Proposed delivery order

| Wave | Scope | Exit condition |
|---|---|---|
| 0 — Restore correctness | B01–B06/B20; F01/F03; targeted state, sandbox, Markdown and duplicate-event fixes | Reproductions 1–4 pass; old pages still load; no silent configuration changes |
| 1 — Make contracts trustworthy | F02/F04/F05/F06/F09/F15; schema reconciliation; E08/E11/E12/E15/E17/E19/E21/E26/E27 critical behavior | Registered capabilities match real behavior; preview parity and migrations verified |
| 2 — Strengthen daily operations | E04/E22; F07/F11/F13; N01/N04/N16/N23/N40 | Record search/filter/edit/upload workflows succeed and recover from failure |
| 3 — Enable composition | F12; E24; N27/N28/N29/N30/N31 | Child slots, isolated state, focus lifecycle and import/export verified |
| 4 — Broaden common tools | E06/E09/E25/E28–E32; F08/F10/F14/F16; N02/N03/N05–N12/N17–N20/N24–N26/N32–N36/N38 | Catalogue examples, performance measurements and library compatibility pass |
| 5 — Specialized expansion | N13–N15/N21/N22/N37/N39 | Demand and integration constraints documented before implementation |

Suggested independently reviewable slices:

1. Runtime functional-update repair with regression tests.
2. Instance identity migration and repeated-widget tests.
3. Embed sandbox/message correction and safe Markdown.
4. Single chart-event route.
5. Schema aliases/default/example reconciliation.
6. Method capability conformance and current-state references.
7. Preview runtime adapter.
8. Form and date picker state/validation.
9. Table identity/save/sort/export.
10. Runtime upload service and widget.
11. Shared composition slots and overlays.
12. New widgets in small compatible groups.

## 9. Common acceptance and verification plan

### Functional contract

- Defaults, samples, editor output and MCP examples validate against the same descriptor.
- Literal and expression values both work; arrays/objects/numbers/booleans preserve intended types.
- Object patches and functional state updates behave identically through the page runtime.
- Declared methods are callable, current, cleanly registered/unregistered and return documented results.
- Declared events fire once per intended action with serializable documented payloads.
- Required/disabled/read-only/clear/reset behavior is consistent across UI and methods.
- Failed operations preserve user input and expose actionable recovery.
- Multiple placements and repeated layouts have isolated state and correct binding scopes.

### Visual and interaction matrix

For a changed widget, capture representative ready/loading/empty/error/disabled states in supported themes, at narrow widget widths, tablet and desktop. Include long labels/values, 200% zoom, keyboard-only operation and reduced motion. Review visual screenshots in one batched pass, fix observed defects together, and confirm once.

Suggested fixtures: container widths 240, 360, 768 and 1280 px, unless documented minimum size requires another strategy. These are test proposals, not measured current support.

- Accessible name, role and value; unique IDs; focus visibility and logical order.
- Screen-reader-friendly help/errors/loading; calendar/select/tree keyboard patterns.
- Touch targets sized for the density mode with adequate spacing; test gestures separately from viewport layout.
- No unintended page-level horizontal overflow; internal table/code overflow is deliberate.
- Theme colors and text contrast measured from actual rendered colors.

### Data and scale

- Cover undefined/null/empty/zero/false, malformed types, duplicate IDs and missing option/record references.
- Cover delayed/error/partial/out-of-order query results and navigation/unmount.
- Benchmark realistic representative pages, not only isolated empty widgets.
- Proposed stress fixtures: 10,000 table/list records, deeply nested/large JSON with defined bounds, 20 mixed page widgets, repeated mount/unmount. Record hardware/browser/build and actual numbers before setting enforced budgets.
- Confirm heavy modules are absent from unrelated routes/chunks where feasible; React.lazy alone is not proof of a reduced production bundle.

### Compatibility and service behavior

- Saved examples for every legacy alias still render; normalization is idempotent.
- Import/export and library installation remap instances, references and owned child slots.
- Tenant access, upload/download access and record mutations are checked on the server.
- Full-replace updates retain compatibility; safer patch/revision handling protects against lost fields.
- Runtime state contains serializable values; Files/DOM nodes/views stay out of persisted config.

### Repository validation commands for implementing agents

Inspect current scripts first. The root test script is a placeholder; do not treat it as coverage. Package tests currently consume dist in several places, so ensure fresh builds.

~~~powershell
npm run build --workspace=@jet-admin/widget-types
npm run build --workspace=@jet-admin/widgets-logic
npm run build --workspace=@jet-admin/widgets-ui
npm run test --workspace=@jet-admin/widget-types -- --runInBand
npm run test --workspace=@jet-admin/widgets-logic -- --runInBand
npm run test --workspace=@jet-admin/widgets-ui -- --runInBand
npm run test --workspace=frontend -- --runInBand
npm run build --workspace=frontend
~~~

Run focused checks appropriate to the selected slice; run backend/service checks when those paths change. Report missing dependencies or pre-existing failures accurately. Do not claim a passing suite from this specification's creation.

## 10. Completion record for each implementation slice

Attach these fields to the implementation PR or handoff:

| Field | Required content |
|---|---|
| Requirement IDs | Selected F/E/N/B IDs, including prerequisites completed |
| Problem and result | Concrete before/after behavior |
| Schema/version | Canonical fields, aliases, migration and compatibility |
| UI/UX | States, keyboard/focus, responsive behavior and recovery |
| Runtime/DX | State, events, methods, binding examples and discovery |
| Validation | Actual commands/results, meaningful regression fixtures and reviewed screenshots |
| Remaining limits | Only real unimplemented requirements or external constraints |

Use the companion prompt pack to assign work. Do not mark the entire widget expansion complete after landing only shared infrastructure or a subset of the catalogue.
