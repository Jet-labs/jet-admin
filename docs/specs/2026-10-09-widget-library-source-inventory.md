# Widget library source inventory

Date: 9 October 2026  
Source snapshot: local working tree at Git revision `404dc424`; source is authoritative if this document ages.  
Specification: [Enhancement and expansion](2026-10-09-widget-library-enhancement-spec.md) · [AI prompts](2026-10-09-widget-library-agent-prompts.md)

## Review method and coverage

All 32 registered widget types and JSON schemas were inventoried. All renderer implementations were read, alongside their editor field-write surfaces and selected complex editor flows. Vega and Vega-Lite share a renderer/editor directory. The sections below expose every published top-level schema property, current schema events, renderer property access and editor writes. Runtime, preview, validators, processors and library paths were reviewed separately.

The property scan is intentionally mechanical: it detects direct widgetConfig property access and literal setFieldValue paths. It cannot prove a field is unused when a builder, shared component, dynamic key or envelope consumes it. In particular, table dataArrayTemplate is consumed in its builder. Treat differences as reconciliation leads, and use the verified findings in the specification for conclusions.

No live browser inspection or application tests were performed. Performance and visual behavior require follow-up in an implementation assignment. Existing uncommitted files outside this documentation were left alone.

## Verified evidence index

| Finding | Source location | Relevant implementation |
|---|---|---|
| B01 | [apps/frontend/src/logic/appPageRuntime/useWidgetState.js:21](../../apps/frontend/src/logic/appPageRuntime/useWidgetState.js) | Setter forwards update unchanged |
| B01 | [apps/frontend/src/logic/appPageRuntime/appPageReducer.js:78](../../apps/frontend/src/logic/appPageRuntime/appPageReducer.js) | Reducer spreads payload as an object |
| B01 | [packages/widgets-ui/src/text-input/textInputWidget.jsx:33](../../packages/widgets-ui/src/text-input/textInputWidget.jsx) | Input sends a functional updater |
| B02 | [packages/widgets-ui/src/html/htmlWidget.jsx:75](../../packages/widgets-ui/src/html/htmlWidget.jsx) | Empty sandbox token list becomes undefined |
| B02 | [packages/widgets-ui/src/iframe/iframeWidget.jsx:54](../../packages/widgets-ui/src/iframe/iframeWidget.jsx) | Empty sandbox token string becomes undefined |
| B03 | [packages/widgets-ui/src/text/textWidget.jsx:197](../../packages/widgets-ui/src/text/textWidget.jsx) | Generated Markdown HTML enters application DOM |
| B04 | [packages/widgets-ui/src/vega/index.js:117](../../packages/widgets-ui/src/vega/index.js) | Callback follows direct event dispatch |
| B04 | [apps/frontend/src/presentation/components/appPageComponents/editor/appPageWidgetSlot.jsx:71](../../apps/frontend/src/presentation/components/appPageComponents/editor/appPageWidgetSlot.jsx) | Callback redispatches the same event |
| B04 | [packages/widgets-ui/src/table/tableWidget.jsx:475](../../packages/widgets-ui/src/table/tableWidget.jsx) | Table callback and direct dispatcher both deliver row selection |
| B04 | [apps/frontend/src/presentation/components/appPageComponents/editor/appPageWidgetSlot.jsx:228](../../apps/frontend/src/presentation/components/appPageComponents/editor/appPageWidgetSlot.jsx) | Generic callback wraps and redispatches event inputs |
| B05 | [packages/widgets-ui/src/switch/switchWidget.jsx:29](../../packages/widgets-ui/src/switch/switchWidget.jsx) | Once-created method captures checked value |
| B06 | [packages/widgets-ui/src/date-picker/datePickerWidget.jsx:16](../../packages/widgets-ui/src/date-picker/datePickerWidget.jsx) | Falsy state triggers default initialization |
| B06 | [packages/widgets-ui/src/date-range-picker/dateRangePickerWidget.jsx:18](../../packages/widgets-ui/src/date-range-picker/dateRangePickerWidget.jsx) | Empty range triggers configured defaults |
| B08 | [apps/backend/modules/widget/widget.validator.js:11](../../apps/backend/modules/widget/widget.validator.js) | Passthrough config and unconstrained type string |
| B09 | [packages/widgets-ui/src/checkbox/checkboxWidget.jsx:51](../../packages/widgets-ui/src/checkbox/checkboxWidget.jsx) | Fixed instance-independent control ID |
| B10 | [packages/widgets-ui/src/_shared/calendarGrid.jsx:31](../../packages/widgets-ui/src/_shared/calendarGrid.jsx) | Icon-only calendar navigation button |
| B11 | [packages/widgets-ui/src/file-upload/fileUploadWidget.jsx:6](../../packages/widgets-ui/src/file-upload/fileUploadWidget.jsx) | Files converted to metadata |
| B12 | [packages/widgets-ui/src/table/tableWidget.jsx:216](../../packages/widgets-ui/src/table/tableWidget.jsx) | Selection sync signature excludes row content |
| B13 | [packages/widgets-ui/src/table/tableWidget.jsx:453](../../packages/widgets-ui/src/table/tableWidget.jsx) | Drafts cleared after dispatch without awaiting outcomes |
| B14 | [packages/widgets-ui/src/list/listWidget.jsx:54](../../packages/widgets-ui/src/list/listWidget.jsx) | Visible indices used for selection/key |
| B15 | [apps/frontend/src/presentation/components/widgetComponents/widgetPreview.jsx:45](../../apps/frontend/src/presentation/components/widgetComponents/widgetPreview.jsx) | Preview init adapter expects a ref-like object |
| B16 | [packages/widgets-ui/src/form/formWidget.jsx:33](../../packages/widgets-ui/src/form/formWidget.jsx) | Defaults replace complete local draft |
| B17 | [packages/widgets-ui/src/select/selectWidget.jsx:66](../../packages/widgets-ui/src/select/selectWidget.jsx) | No open-change/clearable UI contract wired here |
| B18 | [packages/ui/src/components/json-viewer.jsx:142](../../packages/ui/src/components/json-viewer.jsx) | Collapsed prop not consumed by shared component |
| B19 | [packages/widgets-ui/src/text-input/textInputWidget.jsx:70](../../packages/widgets-ui/src/text-input/textInputWidget.jsx) | Representative repeated loading overlay |
| B20 | [packages/widgets-ui/src/html/htmlWidget.jsx:27](../../packages/widgets-ui/src/html/htmlWidget.jsx) | Message filter checks envelope but not source window |
| B21 | [packages/widgets-ui/package.json:6](../../packages/widgets-ui/package.json) | Declared declaration output; compare build script |
| B22 | [packages/widgets-ui/src/table/tableWidget.jsx:523](../../packages/widgets-ui/src/table/tableWidget.jsx) | Server display uses core row model |
| B23 | [packages/widgets-ui/src/search-input/searchInputWidget.jsx:34](../../packages/widgets-ui/src/search-input/searchInputWidget.jsx) | Clear does not cancel pending timer |
| B24 | [apps/frontend/src/presentation/components/appPageComponents/editor/appPageWidgetSlot.jsx:140](../../apps/frontend/src/presentation/components/appPageComponents/editor/appPageWidgetSlot.jsx) | Runtime state keyed by resource rather than placement |

## Shared integration map

| Surface | Source | Review relevance |
|---|---|---|
| UI registry | [packages/widgets-ui/src/widget.map.js](../../packages/widgets-ui/src/widget.map.js) | Renderer/editor/default registration for all types |
| Types/events/methods | [packages/widget-types/src/index.js](../../packages/widget-types/src/index.js) | Capabilities and event input definitions |
| Schema registry | [packages/widget-types/src/schemas/index.js](../../packages/widget-types/src/schemas/index.js) | Published JSON config descriptors |
| Processor registry | [packages/widgets-logic/src/index.js](../../packages/widgets-logic/src/index.js) | Three registered type entries; two builder classes |
| Builder contract | [packages/widgets-logic/src/core/baseWidgetBuilder.js](../../packages/widgets-logic/src/core/baseWidgetBuilder.js) | Data manifests and resolution |
| Table builder | [packages/widgets-logic/src/table/builder.js](../../packages/widgets-logic/src/table/builder.js) | Resolved dataArrayTemplate and feature config |
| Vega builder | [packages/widgets-logic/src/vega/builder.js](../../packages/widgets-logic/src/vega/builder.js) | vegaSpec normalization and safe clone |
| Page widget | [apps/frontend/src/presentation/components/appPageComponents/editor/appPageWidgetSlot.jsx](../../apps/frontend/src/presentation/components/appPageComponents/editor/appPageWidgetSlot.jsx) | Config resolution, state, event and method wiring |
| Craft widget slot | [apps/frontend/src/presentation/components/appPageComponents/layout/components/CanvasWidgetSlot.jsx](../../apps/frontend/src/presentation/components/appPageComponents/layout/components/CanvasWidgetSlot.jsx) | Placement sizing, conditions and live-preview behavior |
| State reducer | [apps/frontend/src/logic/appPageRuntime/appPageReducer.js](../../apps/frontend/src/logic/appPageRuntime/appPageReducer.js) | State patches and method registration |
| Event engine | [apps/frontend/src/logic/appPageRuntime/useWidgetEventHandlers.js](../../apps/frontend/src/logic/appPageRuntime/useWidgetEventHandlers.js) | Sequential actions and structured outcomes |
| Method registry | [apps/frontend/src/logic/appPageRuntime/useWidgetMethodRegistry.js](../../apps/frontend/src/logic/appPageRuntime/useWidgetMethodRegistry.js) | Register/unregister lifecycle |
| Standalone preview | [apps/frontend/src/presentation/components/widgetComponents/widgetPreview.jsx](../../apps/frontend/src/presentation/components/widgetComponents/widgetPreview.jsx) | Differences from runtime integration |
| Inspector | [apps/frontend/src/presentation/components/widgetComponents/widgetConfigEditor.jsx](../../apps/frontend/src/presentation/components/widgetComponents/widgetConfigEditor.jsx) | Data bindings, upload context and configuration surfaces |
| Widget drawer | [apps/frontend/src/presentation/components/appPageComponents/editor/appPageWidgetList.jsx](../../apps/frontend/src/presentation/components/appPageComponents/editor/appPageWidgetList.jsx) | Search, insertion, dragging and hover actions |
| Library browser | [apps/frontend/src/presentation/components/widgetLibraryComponents/widgetLibraryBrowserDialog.jsx](../../apps/frontend/src/presentation/components/widgetLibraryComponents/widgetLibraryBrowserDialog.jsx) | Search/pagination, installation preview and failures |
| API validation | [apps/backend/modules/widget/widget.validator.js](../../apps/backend/modules/widget/widget.validator.js) | Create/update authoring validation |
| Widget service | [apps/backend/modules/widget/widget.service.js](../../apps/backend/modules/widget/widget.service.js) | Persistence and separately exposed schemas |
| MCP tools | [packages/mcp-server/src/tools/widget.tools.js](../../packages/mcp-server/src/tools/widget.tools.js) | AI authoring examples and full-replace update guidance |
| Shared JSON viewer | [packages/ui/src/components/json-viewer.jsx](../../packages/ui/src/components/json-viewer.jsx) | Expansion and clipboard behavior |
| UI registry tests | [packages/widgets-ui/__tests__/widgetsRegistry.test.js](../../packages/widgets-ui/__tests__/widgetsRegistry.test.js) | Existence/default checks and table helper tests |
| Type tests | [packages/widget-types/__tests__/widgetTypes.test.js](../../packages/widget-types/__tests__/widgetTypes.test.js) | Type/schema/capability metadata checks |
| Page reducer tests | [apps/frontend/__tests__/appPageReducer.test.js](../../apps/frontend/__tests__/appPageReducer.test.js) | Existing object-patch coverage |
| Library documentation | [docs/docs/platform/widget-library.md](../../docs/docs/platform/widget-library.md) | Current reuse architecture; verify evolving details in code |

## Per-widget source and schema sheet

### E01 — vega-lite

Vega-Lite chart widget. Bind live data via vegaSpec.data.values (and spec.data.values) using {{ state.queries.<alias>.data }}. Production pages use vegaSpec — set BOTH spec and vegaSpec or the chart renders empty.

- Renderer: [packages/widgets-ui/src/vega/index.js](../../packages/widgets-ui/src/vega/index.js)
- Editor: [packages/widgets-ui/src/vega/vegaConfigEditor.jsx](../../packages/widgets-ui/src/vega/vegaConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/vega-lite.schema.json](../../packages/widget-types/src/schemas/vega-lite.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: `onBrush`, `onMarkClick`
- Direct renderer properties: `isLoading`, `renderer`, `showActions`, `theme`
- Direct renderer properties absent from top-level schema: `theme`
- Editor field writes: `widgetConfig.editorMode`, `widgetConfig.isLoading`, `widgetConfig.shelfSpec`, `widgetConfig.vegaSpec`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `spec` | object | no | Vega-Lite JSON specification (https://vega.github.io/vega-lite/docs/spec.html). Set data.values to '{{ state.queries.<alias>.data }}' for live binding. |
| `vegaSpec` | object | no | Runtime Vega-Lite spec used by production pages (same shape as spec). Must include data.values bound to '{{ state.queries.<alias>.data }}'. |
| `options` | object | no | Runtime options wrapper (alternative to top-level showActions/renderer). |
| `showHeader` | boolean | no | — |
| `isLoading` | string | no | Template, e.g. '{{ state.queries.<alias>.isLoading }}' |
| `showActions` | boolean | no | Show Vega embed action buttons |
| `renderer` | string; "svg", "canvas" | no | Rendering engine for the chart |

Implementation requirements and acceptance: `E01` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E02 — vega

Vega chart widget. widgetConfig.spec is the full Vega JSON specification.

- Renderer: [packages/widgets-ui/src/vega/index.js](../../packages/widgets-ui/src/vega/index.js)
- Editor: [packages/widgets-ui/src/vega/vegaConfigEditor.jsx](../../packages/widgets-ui/src/vega/vegaConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/vega.schema.json](../../packages/widget-types/src/schemas/vega.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: `onBrush`, `onMarkClick`
- Direct renderer properties: `isLoading`, `renderer`, `showActions`, `theme`
- Direct renderer properties absent from top-level schema: `isLoading`, `theme`
- Editor field writes: `widgetConfig.editorMode`, `widgetConfig.isLoading`, `widgetConfig.shelfSpec`, `widgetConfig.vegaSpec`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `spec` | object | no | Vega JSON specification (https://vega.github.io/vega/docs/specification/) |
| `showActions` | boolean | no | Show Vega embed action buttons |
| `renderer` | string; "svg", "canvas" | no | Rendering engine for the chart |

Implementation requirements and acceptance: `E02` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E03 — button

Button widget. A clickable button that triggers an action.

- Renderer: [packages/widgets-ui/src/button/buttonWidget.jsx](../../packages/widgets-ui/src/button/buttonWidget.jsx)
- Editor: [packages/widgets-ui/src/button/buttonConfigEditor.jsx](../../packages/widgets-ui/src/button/buttonConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/button.schema.json](../../packages/widget-types/src/schemas/button.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onSubmit`
- Direct renderer event-name scan: none detected; inspect callbacks/runtime-owned events
- Direct renderer properties: `alignment`, `disabled`, `fullWidth`, `icon`, `iconPosition`, `isLoading`, `label`, `size`, `text`, `variant`
- Direct renderer properties absent from top-level schema: none detected
- Editor field writes: `widgetConfig.${key}`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `text` | string | no | Button text. Supports template expressions. Legacy alias: label. |
| `label` | string | no | Legacy alias of text (frontend renders text ?? label). |
| `variant` | string; "default", "secondary", "green", "destructive", "white", "outline", "ghost", "link", "pill", "primary-ghost", "destructive-ghost", "primary-outline" | no | Visual style variant (matches @jet-admin/ui Button) |
| `size` | string; "default", "sm", "lg", "icon", "circle", "pill" | no | Button size (matches @jet-admin/ui Button) |
| `icon` | string | no | Optional icon name (play, plus, download, upload, trash, edit, save, search, refresh, arrowRight, check, close, filter, settings, chevronDown) |
| `iconPosition` | string; "left", "right" | no | — |
| `alignment` | string; "left", "center", "right" | no | Horizontal alignment of the button in its row |
| `fullWidth` | boolean or string | no | Stretch button to fill the row width |
| `disabled` | boolean or string | no | Disabled state — boolean or template expression |
| `isLoading` | string or boolean | no | Loading overlay — boolean or template expression (e.g. {{ state.queries.myQuery.isLoading }}). Legacy alias: loading. |
| `loading` | boolean or string | no | Legacy alias of isLoading. |

Implementation requirements and acceptance: `E03` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E04 — table

Data table widget. Displays rows of data with configurable columns, sorting, pagination, search, export, selection and inline editing. Supports nested field paths (e.g. user.name).

- Renderer: [packages/widgets-ui/src/table/tableWidget.jsx](../../packages/widgets-ui/src/table/tableWidget.jsx)
- Editor: [packages/widgets-ui/src/table/tableConfigEditor.jsx](../../packages/widgets-ui/src/table/tableConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/table.schema.json](../../packages/widget-types/src/schemas/table.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onRowSelect`, `onPageChange`, `onSearch`, `onExport`, `onRowSave`, `onBulkDelete`, `onBulkExport`, `onBulkAction`, `onBulkEdit`
- Direct renderer event-name scan: `onBulkAction`, `onBulkDelete`, `onBulkEdit`, `onBulkExport`, `onExport`, `onPageChange`, `onRowSave`, `onRowSelect`, `onSearch`
- Direct renderer properties: `bulkEdit`, `columns`, `dense`, `editing`, `emptyHint`, `emptyText`, `export`, `isLoading`, `multiSelect`, `pagination`, `search`, `stickyHeader`, `striped`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.${field}`, `widgetConfig.columns`, `widgetConfig.multiSelect.actions`, `widgetConfig.pagination`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `columns` | array | no | Column definitions for the table |
| `pagination` | object | no | — |
| `searchable` | boolean | no | Legacy alias — use search.enabled |
| `search` | object | no | — |
| `exportable` | boolean | no | Legacy alias — use export.enabled |
| `export` | object | no | — |
| `selectable` | boolean | no | Legacy alias — use multiSelect.enabled |
| `multiSelect` | object | no | — |
| `editing` | object | no | — |
| `bulkEdit` | object | no | — |
| `bulkActions` | array | no | Legacy alias — use multiSelect.actions |
| `emptyText` | string | no | Text to show when table has no data |
| `emptyHint` | string | no | Helper line under the empty state |
| `striped` | boolean | no | Zebra-strip rows |
| `dense` | boolean | no | Compact row padding |
| `stickyHeader` | boolean | no | Keep header visible while scrolling |

Implementation requirements and acceptance: `E04` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E05 — text

Text / Markdown widget. Renders static or dynamic markdown/plain text content.

- Renderer: [packages/widgets-ui/src/text/textWidget.jsx](../../packages/widgets-ui/src/text/textWidget.jsx)
- Editor: [packages/widgets-ui/src/text/textConfigEditor.jsx](../../packages/widgets-ui/src/text/textConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/text.schema.json](../../packages/widget-types/src/schemas/text.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: none detected; inspect callbacks/runtime-owned events
- Direct renderer properties: `content`, `fontSize`, `format`, `isLoading`, `textAlign`
- Direct renderer properties absent from top-level schema: `isLoading`, `textAlign`
- Editor field writes: `widgetConfig.content`, `widgetConfig.fontSize`, `widgetConfig.format`, `widgetConfig.isLoading`, `widgetConfig.textAlign`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `content` | string | no | Markdown or plain text content. Supports template expressions {{ variable }} |
| `format` | string; "markdown", "plain" | no | — |
| `fontSize` | string | no | CSS font-size value e.g. '16px', '1rem' |
| `fontWeight` | string; "normal", "bold", "semibold" | no | — |
| `color` | string | no | CSS color value |
| `align` | string; "left", "center", "right" | no | — |

Implementation requirements and acceptance: `E05` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E06 — stat

Stat / KPI widget. Displays a single metric value with optional trend indicator and comparison.

- Renderer: [packages/widgets-ui/src/stat/statWidget.jsx](../../packages/widgets-ui/src/stat/statWidget.jsx)
- Editor: [packages/widgets-ui/src/stat/statConfigEditor.jsx](../../packages/widgets-ui/src/stat/statConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/stat.schema.json](../../packages/widget-types/src/schemas/stat.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: none detected; inspect callbacks/runtime-owned events
- Direct renderer properties: `isLoading`, `label`, `prefix`, `suffix`, `textAlign`, `trendDirection`, `trendTemplate`, `valueTemplate`
- Direct renderer properties absent from top-level schema: none detected
- Editor field writes: `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.prefix`, `widgetConfig.suffix`, `widgetConfig.textAlign`, `widgetConfig.trendDirection`, `widgetConfig.trendTemplate`, `widgetConfig.valueTemplate`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `value` | string or number | no | Main metric value. Supports template expressions. Legacy alias — frontend renders valueTemplate; set both to the same template for compat. |
| `valueTemplate` | string | no | Main metric template actually rendered by the frontend (statWidget.jsx reads valueTemplate ?? ''). Supports {{ }} expressions. Set to the same value as `value`. |
| `label` | string | no | Label below the metric value |
| `prefix` | string | no | Prefix text/symbol (e.g. '$') |
| `suffix` | string | no | Suffix text/symbol (e.g. '%') |
| `trend` | object | no | — |
| `icon` | string | no | Icon name to display alongside the metric |
| `iconColor` | string | no | CSS color for the icon |
| `trendTemplate` | string | no | Trend value template actually rendered by the frontend (statWidget.jsx reads trendTemplate). |
| `trendDirection` | string | no | Trend semantics: 'up-is-good' \| 'down-is-good'. Frontend default 'up-is-good'. |
| `textAlign` | string | no | Text alignment rendered by the frontend: 'left' \| 'center' \| 'right'. |
| `isLoading` | string or boolean | no | Loading overlay flag (true/'true' shows overlay). |
| `decimals` | number | no | Number of decimal places to display |

Implementation requirements and acceptance: `E06` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E07 — alert

Alert Banner widget. Shows an informational, success, warning, or error message.

- Renderer: [packages/widgets-ui/src/alert/alertWidget.jsx](../../packages/widgets-ui/src/alert/alertWidget.jsx)
- Editor: [packages/widgets-ui/src/alert/alertConfigEditor.jsx](../../packages/widgets-ui/src/alert/alertConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/alert.schema.json](../../packages/widget-types/src/schemas/alert.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onDismiss`
- Direct renderer event-name scan: `onDismiss`
- Direct renderer properties: `dismissible`, `isLoading`, `message`, `title`, `variant`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.dismissible`, `widgetConfig.isLoading`, `widgetConfig.message`, `widgetConfig.title`, `widgetConfig.variant`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `message` | string | yes | Alert message text. Supports template expressions. |
| `title` | string | no | Optional alert title |
| `variant` | string; "info", "success", "warning", "error" | no | Alert severity type |
| `dismissible` | boolean | no | Whether the user can dismiss the alert |
| `icon` | boolean | no | Show variant icon |
| `visible` | boolean or string | no | Visibility — boolean or template expression |

Implementation requirements and acceptance: `E07` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E08 — form

Form widget. Renders an input form with configurable fields and submit action.

- Renderer: [packages/widgets-ui/src/form/formWidget.jsx](../../packages/widgets-ui/src/form/formWidget.jsx)
- Editor: [packages/widgets-ui/src/form/formConfigEditor.jsx](../../packages/widgets-ui/src/form/formConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/form.schema.json](../../packages/widget-types/src/schemas/form.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onSubmit`, `onFieldChange`
- Direct renderer event-name scan: `onFieldChange`, `onSubmit`
- Direct renderer properties: `fields`, `showReset`, `size`, `submitLabel`
- Direct renderer properties absent from top-level schema: `showReset`, `size`
- Editor field writes: `widgetConfig.fields`, `widgetConfig.fields[${idx}].${key}`, `widgetConfig.showReset`, `widgetConfig.size`, `widgetConfig.submitLabel`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `fields` | array | yes | Form field definitions |
| `submitLabel` | string | no | — |
| `resetLabel` | string | no | Label for reset button; omit to hide reset button |
| `layout` | string; "vertical", "horizontal", "grid" | no | — |
| `columns` | number | no | Number of columns when layout is 'grid' |

Implementation requirements and acceptance: `E08` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E09 — image

Image widget. Displays an image from a URL.

- Renderer: [packages/widgets-ui/src/image/imageWidget.jsx](../../packages/widgets-ui/src/image/imageWidget.jsx)
- Editor: [packages/widgets-ui/src/image/imageConfigEditor.jsx](../../packages/widgets-ui/src/image/imageConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/image.schema.json](../../packages/widget-types/src/schemas/image.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: `onClick`
- Direct renderer properties: `alt`, `borderRadius`, `isLoading`, `objectFit`, `src`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.alt`, `widgetConfig.borderRadius`, `widgetConfig.isLoading`, `widgetConfig.objectFit`, `widgetConfig.src`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `src` | string | yes | Image URL. Supports template expressions. |
| `alt` | string | no | Alt text for accessibility |
| `objectFit` | string; "cover", "contain", "fill", "none", "scale-down" | no | — |
| `borderRadius` | string | no | CSS border-radius e.g. '8px', '50%' |
| `linkUrl` | string | no | Optional URL to navigate to when clicking the image |
| `linkTarget` | string; "_blank", "_self" | no | — |

Implementation requirements and acceptance: `E09` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E10 — iframe

IFrame Embed widget. Embeds an external URL inside the dashboard.

- Renderer: [packages/widgets-ui/src/iframe/iframeWidget.jsx](../../packages/widgets-ui/src/iframe/iframeWidget.jsx)
- Editor: [packages/widgets-ui/src/iframe/iframeConfigEditor.jsx](../../packages/widgets-ui/src/iframe/iframeConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/iframe.schema.json](../../packages/widget-types/src/schemas/iframe.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: none detected; inspect callbacks/runtime-owned events
- Direct renderer properties: `allowForms`, `allowPopups`, `allowSameOrigin`, `allowScripts`, `isLoading`, `url`
- Direct renderer properties absent from top-level schema: `allowForms`, `allowPopups`, `allowSameOrigin`, `allowScripts`, `isLoading`, `url`
- Editor field writes: `widgetConfig.allowForms`, `widgetConfig.allowPopups`, `widgetConfig.allowSameOrigin`, `widgetConfig.allowScripts`, `widgetConfig.isLoading`, `widgetConfig.url`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `src` | string | yes | URL to embed. Supports template expressions. |
| `height` | number or string | no | Frame height in px or CSS value |
| `scrolling` | boolean | no | — |
| `allowFullscreen` | boolean | no | — |
| `sandbox` | string | no | HTML sandbox attribute value (space-separated tokens) |

Implementation requirements and acceptance: `E10` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E11 — date-picker

Date / Time Picker widget. Allows users to select a date and optionally a time.

- Renderer: [packages/widgets-ui/src/date-picker/datePickerWidget.jsx](../../packages/widgets-ui/src/date-picker/datePickerWidget.jsx)
- Editor: [packages/widgets-ui/src/date-picker/datePickerConfigEditor.jsx](../../packages/widgets-ui/src/date-picker/datePickerConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/date-picker.schema.json](../../packages/widget-types/src/schemas/date-picker.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`, `onOpen`, `onClose`, `onClear`
- Direct renderer event-name scan: `onChange`, `onClear`, `onClose`
- Direct renderer properties: `defaultValue`, `enableTime`, `isLoading`, `label`, `placeholder`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.defaultValue`, `widgetConfig.enableTime`, `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.placeholder`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | Input label |
| `placeholder` | string | no | — |
| `defaultValue` | string | no | Default ISO date string |
| `enableTime` | boolean | no | Show time picker alongside date |
| `dateFormat` | string | no | Display format (e.g. 'YYYY-MM-DD') |
| `minDate` | string | no | Minimum selectable ISO date |
| `maxDate` | string | no | Maximum selectable ISO date |
| `disabled` | boolean or string | no | — |

Implementation requirements and acceptance: `E11` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E12 — date-range-picker

Date Range Picker widget. Allows users to select a start and end date range.

- Renderer: [packages/widgets-ui/src/date-range-picker/dateRangePickerWidget.jsx](../../packages/widgets-ui/src/date-range-picker/dateRangePickerWidget.jsx)
- Editor: [packages/widgets-ui/src/date-range-picker/dateRangePickerConfigEditor.jsx](../../packages/widgets-ui/src/date-range-picker/dateRangePickerConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/date-range-picker.schema.json](../../packages/widget-types/src/schemas/date-range-picker.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`, `onOpen`, `onClose`, `onClear`
- Direct renderer event-name scan: `onChange`, `onClear`, `onClose`
- Direct renderer properties: `defaultEnd`, `defaultStart`, `enableTime`, `isLoading`, `label`, `placeholderEnd`, `placeholderStart`, `presets`
- Direct renderer properties absent from top-level schema: `isLoading`, `placeholderEnd`, `placeholderStart`
- Editor field writes: `widgetConfig.defaultEnd`, `widgetConfig.defaultStart`, `widgetConfig.enableTime`, `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.placeholderEnd`, `widgetConfig.placeholderStart`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | Input label |
| `startPlaceholder` | string | no | — |
| `endPlaceholder` | string | no | — |
| `defaultStart` | string | no | Default start ISO date |
| `defaultEnd` | string | no | Default end ISO date |
| `enableTime` | boolean | no | — |
| `dateFormat` | string | no | — |
| `minDate` | string | no | — |
| `maxDate` | string | no | — |
| `presets` | array | no | Quick-select preset ranges |
| `disabled` | boolean or string | no | — |

Implementation requirements and acceptance: `E12` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E13 — html

HTML Widget. Renders arbitrary custom HTML/CSS/JS in an isolated sandbox. Communicates with the dashboard via window.postMessage.

- Renderer: [packages/widgets-ui/src/html/htmlWidget.jsx](../../packages/widgets-ui/src/html/htmlWidget.jsx)
- Editor: [packages/widgets-ui/src/html/htmlConfigEditor.jsx](../../packages/widgets-ui/src/html/htmlConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/html.schema.json](../../packages/widget-types/src/schemas/html.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onMessage`
- Direct renderer event-name scan: `onMessage`
- Direct renderer properties: `allowForms`, `allowPopups`, `allowScripts`, `css`, `html`, `isLoading`
- Direct renderer properties absent from top-level schema: `allowForms`, `allowPopups`, `allowScripts`, `isLoading`
- Editor field writes: `widgetConfig.allowForms`, `widgetConfig.allowPopups`, `widgetConfig.allowScripts`, `widgetConfig.css`, `widgetConfig.html`, `widgetConfig.isLoading`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `html` | string | no | Full HTML document content (or body fragment) |
| `css` | string | no | Additional CSS to inject |
| `js` | string | no | JavaScript to inject. Use window.parent.postMessage({ type: 'JET_MESSAGE', data: {...} }, '*') to emit the onMessage event. |
| `height` | number or string | no | Widget height in px |
| `scrollable` | boolean | no | — |

Implementation requirements and acceptance: `E13` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E14 — text-input

Text Input widget. Single-line or multi-line user text entry with template default value. Writes its value to widget state for use in queries.

- Renderer: [packages/widgets-ui/src/text-input/textInputWidget.jsx](../../packages/widgets-ui/src/text-input/textInputWidget.jsx)
- Editor: [packages/widgets-ui/src/text-input/textInputConfigEditor.jsx](../../packages/widgets-ui/src/text-input/textInputConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/text-input.schema.json](../../packages/widget-types/src/schemas/text-input.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`, `onFocus`, `onBlur`, `onClear`
- Direct renderer event-name scan: `onBlur`, `onChange`, `onClear`, `onFocus`
- Direct renderer properties: `defaultValue`, `disabled`, `inputType`, `isLoading`, `label`, `maxLength`, `placeholder`, `required`, `rows`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.defaultValue`, `widgetConfig.inputType`, `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.placeholder`, `widgetConfig.rows`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | Input label |
| `placeholder` | string | no | — |
| `inputType` | string; "text", "number", "email", "password", "url", "textarea" | no | — |
| `defaultValue` | string | no | Default value. Supports template expressions. |
| `required` | boolean | no | — |
| `disabled` | boolean or string | no | — |
| `maxLength` | number | no | Maximum character length |
| `rows` | number | no | Visible rows when inputType is textarea |

Implementation requirements and acceptance: `E14` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E15 — select

Select / Dropdown widget. Single-choice picker with static or template-bound options. Writes selected value to widget state.

- Renderer: [packages/widgets-ui/src/select/selectWidget.jsx](../../packages/widgets-ui/src/select/selectWidget.jsx)
- Editor: [packages/widgets-ui/src/select/selectConfigEditor.jsx](../../packages/widgets-ui/src/select/selectConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/select.schema.json](../../packages/widget-types/src/schemas/select.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`, `onClear`, `onOpen`, `onClose`
- Direct renderer event-name scan: `onChange`, `onClear`
- Direct renderer properties: `defaultValue`, `disabled`, `isLoading`, `label`, `labelKey`, `options`, `optionsTemplate`, `placeholder`, `required`, `valueKey`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.defaultValue`, `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.labelKey`, `widgetConfig.options`, `widgetConfig.optionsTemplate`, `widgetConfig.valueKey`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | Input label |
| `placeholder` | string | no | — |
| `options` | array | no | Static options list |
| `optionsTemplate` | string | no | Template resolving to an options array, e.g. {{state.queries.users.data}} |
| `labelKey` | string | no | Object key for option label when using optionsTemplate |
| `valueKey` | string | no | Object key for option value when using optionsTemplate |
| `defaultValue` | string or number or boolean | no | Default selected value |
| `required` | boolean | no | — |
| `disabled` | boolean or string | no | — |
| `clearable` | boolean | no | — |

Implementation requirements and acceptance: `E15` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E16 — multi-select

Multi-Select widget. Pick zero or more options. Writes an array of selected values to widget state.

- Renderer: [packages/widgets-ui/src/multi-select/multiSelectWidget.jsx](../../packages/widgets-ui/src/multi-select/multiSelectWidget.jsx)
- Editor: [packages/widgets-ui/src/multi-select/multiSelectConfigEditor.jsx](../../packages/widgets-ui/src/multi-select/multiSelectConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/multi-select.schema.json](../../packages/widget-types/src/schemas/multi-select.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`, `onClear`
- Direct renderer event-name scan: `onChange`, `onClear`
- Direct renderer properties: `defaultValue`, `disabled`, `isLoading`, `label`, `labelKey`, `maxSelected`, `options`, `optionsTemplate`, `placeholder`, `valueKey`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.maxSelected`, `widgetConfig.options`, `widgetConfig.optionsTemplate`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | — |
| `placeholder` | string | no | — |
| `options` | array | no | — |
| `optionsTemplate` | string | no | Template resolving to an options array |
| `labelKey` | string | no | — |
| `valueKey` | string | no | — |
| `defaultValue` | array | no | Default selected values array |
| `maxSelected` | number | no | Maximum selectable options |
| `disabled` | boolean or string | no | — |

Implementation requirements and acceptance: `E16` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E17 — checkbox

Checkbox widget. Single boolean toggle with label. Writes boolean to widget state.

- Renderer: [packages/widgets-ui/src/checkbox/checkboxWidget.jsx](../../packages/widgets-ui/src/checkbox/checkboxWidget.jsx)
- Editor: [packages/widgets-ui/src/checkbox/checkboxConfigEditor.jsx](../../packages/widgets-ui/src/checkbox/checkboxConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/checkbox.schema.json](../../packages/widget-types/src/schemas/checkbox.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`
- Direct renderer event-name scan: `onChange`
- Direct renderer properties: `defaultChecked`, `description`, `disabled`, `isLoading`, `label`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.defaultChecked`, `widgetConfig.description`, `widgetConfig.isLoading`, `widgetConfig.label`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | Checkbox label |
| `defaultChecked` | boolean or string | no | Default state. Supports template. |
| `disabled` | boolean or string | no | — |
| `description` | string | no | Helper text under the label |

Implementation requirements and acceptance: `E17` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E18 — radio-group

Radio Group widget. Single-choice from a small set of mutually exclusive options.

- Renderer: [packages/widgets-ui/src/radio-group/radioGroupWidget.jsx](../../packages/widgets-ui/src/radio-group/radioGroupWidget.jsx)
- Editor: [packages/widgets-ui/src/radio-group/radioGroupConfigEditor.jsx](../../packages/widgets-ui/src/radio-group/radioGroupConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/radio-group.schema.json](../../packages/widget-types/src/schemas/radio-group.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`
- Direct renderer event-name scan: `onChange`
- Direct renderer properties: `defaultValue`, `disabled`, `isLoading`, `label`, `labelKey`, `options`, `optionsTemplate`, `orientation`, `valueKey`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.defaultValue`, `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.options`, `widgetConfig.orientation`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | — |
| `options` | array | no | — |
| `optionsTemplate` | string | no | — |
| `labelKey` | string | no | — |
| `valueKey` | string | no | — |
| `defaultValue` | string or number or boolean | no | — |
| `orientation` | string; "horizontal", "vertical" | no | — |
| `disabled` | boolean or string | no | — |

Implementation requirements and acceptance: `E18` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E19 — switch

Switch / Toggle widget. Boolean on/off control, ideal for feature flags and filters.

- Renderer: [packages/widgets-ui/src/switch/switchWidget.jsx](../../packages/widgets-ui/src/switch/switchWidget.jsx)
- Editor: [packages/widgets-ui/src/switch/switchConfigEditor.jsx](../../packages/widgets-ui/src/switch/switchConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/switch.schema.json](../../packages/widget-types/src/schemas/switch.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`
- Direct renderer event-name scan: `onChange`
- Direct renderer properties: `defaultChecked`, `description`, `disabled`, `isLoading`, `label`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.defaultChecked`, `widgetConfig.description`, `widgetConfig.isLoading`, `widgetConfig.label`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | — |
| `defaultChecked` | boolean or string | no | — |
| `disabled` | boolean or string | no | — |
| `description` | string | no | — |

Implementation requirements and acceptance: `E19` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E20 — slider

Slider widget. Numeric range picker for thresholds and quantities.

- Renderer: [packages/widgets-ui/src/slider/sliderWidget.jsx](../../packages/widgets-ui/src/slider/sliderWidget.jsx)
- Editor: [packages/widgets-ui/src/slider/sliderConfigEditor.jsx](../../packages/widgets-ui/src/slider/sliderConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/slider.schema.json](../../packages/widget-types/src/schemas/slider.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`
- Direct renderer event-name scan: `onChange`
- Direct renderer properties: `defaultValue`, `disabled`, `isLoading`, `label`, `max`, `min`, `showValue`, `step`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.defaultValue`, `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.max`, `widgetConfig.min`, `widgetConfig.showValue`, `widgetConfig.step`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | — |
| `min` | number | no | — |
| `max` | number | no | — |
| `step` | number | no | — |
| `defaultValue` | number or string | no | — |
| `showValue` | boolean | no | — |
| `disabled` | boolean or string | no | — |

Implementation requirements and acceptance: `E20` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E21 — search-input

Search Input widget. Text field with search icon, clear button and debounced onSearch event for filtering queries.

- Renderer: [packages/widgets-ui/src/search-input/searchInputWidget.jsx](../../packages/widgets-ui/src/search-input/searchInputWidget.jsx)
- Editor: [packages/widgets-ui/src/search-input/searchInputConfigEditor.jsx](../../packages/widgets-ui/src/search-input/searchInputConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/search-input.schema.json](../../packages/widget-types/src/schemas/search-input.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`, `onSearch`, `onClear`, `onFocus`, `onBlur`
- Direct renderer event-name scan: `onBlur`, `onChange`, `onClear`, `onFocus`, `onSearch`
- Direct renderer properties: `debounceMs`, `defaultValue`, `disabled`, `isLoading`, `label`, `placeholder`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.debounceMs`, `widgetConfig.defaultValue`, `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.placeholder`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | — |
| `placeholder` | string | no | — |
| `defaultValue` | string | no | — |
| `debounceMs` | number | no | Debounce delay for onSearch event |
| `disabled` | boolean or string | no | — |

Implementation requirements and acceptance: `E21` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E22 — file-upload

File Upload widget. Pick files for upload workflows. Exposes file metadata (name, size, type) to widget state and events.

- Renderer: [packages/widgets-ui/src/file-upload/fileUploadWidget.jsx](../../packages/widgets-ui/src/file-upload/fileUploadWidget.jsx)
- Editor: [packages/widgets-ui/src/file-upload/fileUploadConfigEditor.jsx](../../packages/widgets-ui/src/file-upload/fileUploadConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/file-upload.schema.json](../../packages/widget-types/src/schemas/file-upload.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`, `onClear`
- Direct renderer event-name scan: `onChange`, `onClear`
- Direct renderer properties: `accept`, `buttonLabel`, `isLoading`, `label`, `maxSizeMB`, `multiple`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.accept`, `widgetConfig.buttonLabel`, `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.maxSizeMB`, `widgetConfig.multiple`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | — |
| `accept` | string | no | Accepted MIME/extensions, e.g. '.csv,.json,image/*' |
| `multiple` | boolean | no | — |
| `maxSizeMB` | number | no | Max file size in MB |
| `buttonLabel` | string | no | — |

Implementation requirements and acceptance: `E22` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E23 — divider

Divider / Spacer widget. Visual separator with optional label for section grouping.

- Renderer: [packages/widgets-ui/src/divider/dividerWidget.jsx](../../packages/widgets-ui/src/divider/dividerWidget.jsx)
- Editor: [packages/widgets-ui/src/divider/dividerConfigEditor.jsx](../../packages/widgets-ui/src/divider/dividerConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/divider.schema.json](../../packages/widget-types/src/schemas/divider.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: none detected; inspect callbacks/runtime-owned events
- Direct renderer properties: `label`, `orientation`, `spacing`, `thickness`
- Direct renderer properties absent from top-level schema: none detected
- Editor field writes: `widgetConfig.label`, `widgetConfig.orientation`, `widgetConfig.spacing`, `widgetConfig.thickness`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `label` | string | no | Optional centered label |
| `orientation` | string; "horizontal", "vertical" | no | — |
| `thickness` | string; "thin", "medium", "thick" | no | — |
| `spacing` | string; "sm", "md", "lg" | no | — |

Implementation requirements and acceptance: `E23` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E24 — tabs

Tabs widget. Tab bar that writes the selected tab value to widget state for conditional filtering and navigation.

- Renderer: [packages/widgets-ui/src/tabs/tabsWidget.jsx](../../packages/widgets-ui/src/tabs/tabsWidget.jsx)
- Editor: [packages/widgets-ui/src/tabs/tabsConfigEditor.jsx](../../packages/widgets-ui/src/tabs/tabsConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/tabs.schema.json](../../packages/widget-types/src/schemas/tabs.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onChange`
- Direct renderer event-name scan: `onChange`
- Direct renderer properties: `defaultTab`, `isLoading`, `tabs`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.defaultTab`, `widgetConfig.isLoading`, `widgetConfig.tabs`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `tabs` | array | no | — |
| `defaultTab` | string | no | Initially selected tab value |

Implementation requirements and acceptance: `E24` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E25 — key-value

Key-Value widget. Displays a single record as label/value rows. Ideal for detail panels.

- Renderer: [packages/widgets-ui/src/key-value/keyValueWidget.jsx](../../packages/widgets-ui/src/key-value/keyValueWidget.jsx)
- Editor: [packages/widgets-ui/src/key-value/keyValueConfigEditor.jsx](../../packages/widgets-ui/src/key-value/keyValueConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/key-value.schema.json](../../packages/widget-types/src/schemas/key-value.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: `onClick`
- Direct renderer properties: `columns`, `dataTemplate`, `emptyText`, `isLoading`, `items`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.columns`, `widgetConfig.dataTemplate`, `widgetConfig.emptyText`, `widgetConfig.isLoading`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `dataTemplate` | string | no | Template resolving to an object, e.g. {{state.queries.user.data[0]}} |
| `items` | array | no | Static rows (used when dataTemplate is empty) |
| `columns` | number | no | Grid columns 1-3 |
| `emptyText` | string | no | — |

Implementation requirements and acceptance: `E25` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E26 — json-viewer

JSON Viewer widget. Pretty-prints query results and objects for debugging and ops inspection.

- Renderer: [packages/widgets-ui/src/json-viewer/jsonViewerWidget.jsx](../../packages/widgets-ui/src/json-viewer/jsonViewerWidget.jsx)
- Editor: [packages/widgets-ui/src/json-viewer/jsonViewerConfigEditor.jsx](../../packages/widgets-ui/src/json-viewer/jsonViewerConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/json-viewer.schema.json](../../packages/widget-types/src/schemas/json-viewer.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: `onClick`
- Direct renderer properties: `collapsed`, `dataTemplate`, `isLoading`, `maxHeight`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.collapsed`, `widgetConfig.dataTemplate`, `widgetConfig.isLoading`, `widgetConfig.maxHeight`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `dataTemplate` | string | no | Template resolving to any value |
| `collapsed` | boolean | no | — |
| `maxHeight` | number | no | Max height in px before scrolling |

Implementation requirements and acceptance: `E26` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E27 — list

List / Card Grid widget. Renders an array as rows or cards with title, subtitle and meta lines.

- Renderer: [packages/widgets-ui/src/list/listWidget.jsx](../../packages/widgets-ui/src/list/listWidget.jsx)
- Editor: [packages/widgets-ui/src/list/listConfigEditor.jsx](../../packages/widgets-ui/src/list/listConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/list.schema.json](../../packages/widget-types/src/schemas/list.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onItemClick`, `onSearch`
- Direct renderer event-name scan: `onItemClick`
- Direct renderer properties: `dataTemplate`, `emptyText`, `isLoading`, `items`, `layout`, `metaKeys`, `searchable`, `subtitleKey`, `titleKey`
- Direct renderer properties absent from top-level schema: `isLoading`, `items`
- Editor field writes: `widgetConfig.dataTemplate`, `widgetConfig.emptyText`, `widgetConfig.isLoading`, `widgetConfig.layout`, `widgetConfig.searchable`, `widgetConfig.subtitleKey`, `widgetConfig.titleKey`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `dataTemplate` | string | no | Template resolving to an array |
| `titleKey` | string | no | — |
| `subtitleKey` | string | no | — |
| `metaKeys` | array | no | Extra keys to show as meta line |
| `layout` | string; "rows", "cards" | no | — |
| `emptyText` | string | no | — |
| `searchable` | boolean | no | — |

Implementation requirements and acceptance: `E27` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E28 — badge

Badge / Tag widget. Status pill with template-driven text and variant mapping.

- Renderer: [packages/widgets-ui/src/badge/badgeWidget.jsx](../../packages/widgets-ui/src/badge/badgeWidget.jsx)
- Editor: [packages/widgets-ui/src/badge/badgeConfigEditor.jsx](../../packages/widgets-ui/src/badge/badgeConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/badge.schema.json](../../packages/widget-types/src/schemas/badge.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: `onClick`
- Direct renderer properties: `isLoading`, `size`, `text`, `variant`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.isLoading`, `widgetConfig.size`, `widgetConfig.text`, `widgetConfig.variant`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `text` | string | no | Badge text. Supports templates. |
| `variant` | string; "default", "secondary", "success", "warning", "destructive", "outline" | no | — |
| `size` | string; "sm", "default", "lg" | no | — |

Implementation requirements and acceptance: `E28` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E29 — progress

Progress widget. Bar or ring showing completion, quota usage or SLA. Value 0-100.

- Renderer: [packages/widgets-ui/src/progress/progressWidget.jsx](../../packages/widgets-ui/src/progress/progressWidget.jsx)
- Editor: [packages/widgets-ui/src/progress/progressConfigEditor.jsx](../../packages/widgets-ui/src/progress/progressConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/progress.schema.json](../../packages/widget-types/src/schemas/progress.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: `onClick`
- Direct renderer properties: `isLoading`, `label`, `showValue`, `status`, `valueTemplate`, `variant`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.isLoading`, `widgetConfig.label`, `widgetConfig.showValue`, `widgetConfig.status`, `widgetConfig.valueTemplate`, `widgetConfig.variant`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `valueTemplate` | string | no | Numeric 0-100 template |
| `variant` | string; "bar", "ring" | no | — |
| `label` | string | no | — |
| `showValue` | boolean | no | — |
| `status` | string; "default", "success", "warning", "error" | no | — |

Implementation requirements and acceptance: `E29` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E30 — timeline

Timeline / Activity Feed widget. Vertical event feed for audit logs, run history and comments.

- Renderer: [packages/widgets-ui/src/timeline/timelineWidget.jsx](../../packages/widgets-ui/src/timeline/timelineWidget.jsx)
- Editor: [packages/widgets-ui/src/timeline/timelineConfigEditor.jsx](../../packages/widgets-ui/src/timeline/timelineConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/timeline.schema.json](../../packages/widget-types/src/schemas/timeline.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`, `onItemClick`
- Direct renderer event-name scan: `onItemClick`
- Direct renderer properties: `dataTemplate`, `descriptionKey`, `emptyText`, `isLoading`, `timeKey`, `titleKey`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.dataTemplate`, `widgetConfig.descriptionKey`, `widgetConfig.emptyText`, `widgetConfig.isLoading`, `widgetConfig.timeKey`, `widgetConfig.titleKey`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `dataTemplate` | string | no | Template resolving to an event array |
| `titleKey` | string | no | — |
| `timeKey` | string | no | — |
| `descriptionKey` | string | no | — |
| `emptyText` | string | no | — |

Implementation requirements and acceptance: `E30` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E31 — video

Video widget. Embeds MP4/HLS video by URL for onboarding and catalog apps.

- Renderer: [packages/widgets-ui/src/video/videoWidget.jsx](../../packages/widgets-ui/src/video/videoWidget.jsx)
- Editor: [packages/widgets-ui/src/video/videoConfigEditor.jsx](../../packages/widgets-ui/src/video/videoConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/video.schema.json](../../packages/widget-types/src/schemas/video.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: `onClick`
- Direct renderer properties: `autoplay`, `controls`, `isLoading`, `loop`, `muted`, `poster`, `src`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.autoplay`, `widgetConfig.controls`, `widgetConfig.isLoading`, `widgetConfig.loop`, `widgetConfig.muted`, `widgetConfig.poster`, `widgetConfig.src`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `src` | string | no | Video URL. Supports templates. |
| `poster` | string | no | — |
| `autoplay` | boolean | no | — |
| `controls` | boolean | no | — |
| `loop` | boolean | no | — |
| `muted` | boolean | no | — |

Implementation requirements and acceptance: `E31` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

### E32 — code-block

Code Block widget. Displays SQL, JSON or logs with copy button. Ideal for ops and debugging panels.

- Renderer: [packages/widgets-ui/src/code-block/codeBlockWidget.jsx](../../packages/widgets-ui/src/code-block/codeBlockWidget.jsx)
- Editor: [packages/widgets-ui/src/code-block/codeBlockConfigEditor.jsx](../../packages/widgets-ui/src/code-block/codeBlockConfigEditor.jsx)
- Schema: [packages/widget-types/src/schemas/code-block.schema.json](../../packages/widget-types/src/schemas/code-block.schema.json)
- Schema-declared events: `onClick`, `onRefresh`, `onLoad`
- Direct renderer event-name scan: `onClick`
- Direct renderer properties: `code`, `isLoading`, `language`, `maxHeight`, `showCopy`
- Direct renderer properties absent from top-level schema: `isLoading`
- Editor field writes: `widgetConfig.code`, `widgetConfig.isLoading`, `widgetConfig.language`, `widgetConfig.maxHeight`, `widgetConfig.showCopy`

| Published top-level property | Type / enum | Required | Description |
|---|---|---|---|
| `code` | string | no | Code content. Supports templates. |
| `language` | string | no | Language label e.g. sql, json, bash, javascript |
| `showCopy` | boolean | no | — |
| `maxHeight` | number | no | Max height in px before scrolling |

Implementation requirements and acceptance: `E32` in the main specification. Nested option/field/column details remain in the linked JSON schema and current source.

## Verification performed for this documentation

- Counted 32 unique type values, 32 schema descriptors and matching renderer/editor source coverage.
- Verified the linked evidence tokens and shared integration files exist in the inspected working tree.
- Cross-checked that E01–E32 align with the registry inventory and N01–N40 are proposed additions.
- Documentation integrity checks cover unique requirement IDs, local links and source paths; they do not substitute for application tests.

