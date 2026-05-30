# Date/Time Picker Widgets — Design Spec

## Overview

Two new widgets for the Jet Admin widget system:

1. **Date Picker** (`date-picker`) — Single date/time selection via an input field that opens a popover calendar with optional time inputs.
2. **Date Range Picker** (`date-range-picker`) — Start/end date range selection via dual side-by-side calendars in a popover, with optional time inputs.

Both widgets work standalone (e.g., filtering a table) and as form-like inputs. They follow the existing widget architecture: type registration in `widget-types`, UI components + config editors in `widgets-ui`, and state exposed through the AppPage runtime's `widgetState` system.

## Use Cases

- **Filtering** — User selects a date/range to filter tables, charts, or data queries on an App Page (e.g., "show data from May 1–15").
- **Form input** — User fills in date/time fields as part of a submission workflow (e.g., "set start date").
- Both use cases are supported via the widget state system (`{{widgets.<id>.value}}`) and event system (`onChange` fires actions/workflows).

## Dependencies

- **`date-fns`** — Lightweight, tree-shakeable date math library. Used for calendar grid generation (days in month, start of week, date comparison, formatting). No other new dependencies.
- All UI built from existing `@jet-admin/ui` primitives: `Popover`, `PopoverTrigger`, `PopoverContent`, `Input`, `Button`, `Label`, `Select`.

## Widget Type Registration

### `packages/widget-types/src/index.js`

Add two new type constants:

```js
DATE_PICKER: {
  name: "Date / Time Picker",
  value: "date-picker",
},
DATE_RANGE_PICKER: {
  name: "Date Range Picker",
  value: "date-range-picker",
},
```

### Event Types

Add to `WIDGET_EVENT_TYPES`:

```js
"date-picker": [
  { value: "onChange", label: "On Change", desc: "Fires when the selected date/time changes. Event data: { value, date, time }" },
  { value: "onOpen", label: "On Open", desc: "Fires when the picker popover opens" },
  { value: "onClose", label: "On Close", desc: "Fires when the picker popover closes" },
  { value: "onClear", label: "On Clear", desc: "Fires when the selected value is cleared" },
],
"date-range-picker": [
  { value: "onChange", label: "On Change", desc: "Fires when the selected range changes. Event data: { start, end, startDate, endDate }" },
  { value: "onOpen", label: "On Open", desc: "Fires when the picker popover opens" },
  { value: "onClose", label: "On Close", desc: "Fires when the picker popover closes" },
  { value: "onClear", label: "On Clear", desc: "Fires when the range is cleared" },
],
```

## Component Architecture

### File Structure

```
packages/widgets-ui/src/
├── _shared/
│   ├── calendarGrid.jsx          # Reusable month grid component
│   ├── timeInput.jsx             # HH:MM:SS input component
│   └── calendarUtils.js          # date-fns helpers
├── date-picker/
│   ├── datePickerWidget.jsx      # Main widget component
│   ├── datePickerConfigEditor.jsx # Config editor panel
│   └── index.js                  # Barrel export
├── date-range-picker/
│   ├── dateRangePickerWidget.jsx  # Main widget component
│   ├── dateRangePickerConfigEditor.jsx
│   └── index.js
```

### Shared Components

#### `CalendarGrid`

Pure presentational component. Renders a single month as a 7-column day grid.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `month` | `number` | 0-indexed month (0 = January) |
| `year` | `number` | Full year |
| `selectedDate` | `Date \| null` | Currently selected date (single picker) |
| `rangeStart` | `Date \| null` | Range start date (range picker) |
| `rangeEnd` | `Date \| null` | Range end date (range picker) |
| `hoverDate` | `Date \| null` | Date being hovered (for range preview) |
| `onDayClick` | `(date: Date) => void` | Day click handler |
| `onDayHover` | `(date: Date) => void` | Day hover handler (range picker) |
| `onMonthChange` | `(delta: number) => void` | Navigate months (+1 / -1) |
| `minDate` | `Date \| null` | Earliest selectable date |
| `maxDate` | `Date \| null` | Latest selectable date |
| `showNavigation` | `boolean` | Show ◀ ▶ month arrows (default: true) |

**Rendering:**
- Day headers: Su Mo Tu We Th Fr Sa
- Days grid: 6 rows × 7 columns, offset by first day of month
- Selected day: solid primary background with white text
- Range days: translucent primary background
- Range start/end: solid primary with rounded corners on the appropriate side
- Disabled days (outside min/max): muted text, no click handler
- Today: subtle ring/outline indicator
- Hover preview (range mode): translucent fill from range start to hovered day

#### `TimeInput`

Three adjacent number inputs for hours, minutes, seconds.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `hours` | `number` | Current hours (0–23) |
| `minutes` | `number` | Current minutes (0–59) |
| `seconds` | `number` | Current seconds (0–59) |
| `onChange` | `({ hours, minutes, seconds }) => void` | Value change callback |

**Behavior:**
- Arrow up/down increments/decrements each field
- Mouse scroll increments/decrements each field
- Tab moves between fields
- Leading zeros displayed (e.g., "09")
- Values wrap around (59 → 0, 23 → 0)

#### `calendarUtils.js`

Thin wrappers around `date-fns`:
- `getCalendarDays(year, month)` — Returns array of Date objects for the grid (including leading/trailing empty slots)
- `formatDateISO(date)` — Format as `YYYY-MM-DD`
- `formatDateTimeISO(date, time)` — Format as `YYYY-MM-DDTHH:MM:SS`
- `formatDisplayDate(date)` — Format as "May 15, 2026"
- `formatDisplayDateTime(date, time)` — Format as "May 15, 2026 · 2:30 PM"
- `isSameDay(a, b)` — Compare two dates (day precision)
- `isInRange(date, start, end)` — Check if date is within a range
- `parseISOSafe(str)` — Parse ISO string, return null on failure

## Widget Configs

### Date Picker Config

```js
sampleConfig: {
  label: "Select date",
  placeholder: "Pick a date...",
  enableTime: false,
  defaultValue: "",
  minDate: "",
  maxDate: "",
  showHeader: false,
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | `"Select date"` | Display label above the input |
| `placeholder` | `string` | `"Pick a date..."` | Input placeholder text |
| `enableTime` | `boolean` | `false` | Show time inputs (HH:MM:SS) |
| `defaultValue` | `string` | `""` | Initial value (ISO string or `{{template}}`) |
| `minDate` | `string` | `""` | Minimum selectable date (ISO or template) |
| `maxDate` | `string` | `""` | Maximum selectable date (ISO or template) |
| `showHeader` | `boolean` | `false` | Standard widget header toggle |

### Date Range Picker Config

```js
sampleConfig: {
  label: "Select range",
  placeholderStart: "Start date",
  placeholderEnd: "End date",
  enableTime: false,
  defaultStart: "",
  defaultEnd: "",
  minDate: "",
  maxDate: "",
  presets: [],
  showHeader: false,
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | `"Select range"` | Display label |
| `placeholderStart` | `string` | `"Start date"` | Start input placeholder |
| `placeholderEnd` | `string` | `"End date"` | End input placeholder |
| `enableTime` | `boolean` | `false` | Show time inputs for start/end |
| `defaultStart` | `string` | `""` | Initial start value |
| `defaultEnd` | `string` | `""` | Initial end value |
| `minDate` | `string` | `""` | Earliest selectable date |
| `maxDate` | `string` | `""` | Latest selectable date |
| `presets` | `Array<{ label, startOffset, endOffset }>` | `[]` | Quick-select presets (see below) |
| `showHeader` | `boolean` | `false` | Standard widget header toggle |

**Presets format:**
```js
{ label: "Last 7 days", startOffset: -7, endOffset: 0 }
{ label: "This month", startOffset: "startOfMonth", endOffset: "endOfMonth" }
{ label: "Last 30 days", startOffset: -30, endOffset: 0 }
```
Offsets are relative to today. Special string values `"startOfMonth"`, `"endOfMonth"`, `"startOfYear"`, `"endOfYear"` are supported.

## Widget State

### Date Picker

Exposed via `{{widgets.<id>.<key>}}`:

| Key | Type | Description |
|-----|------|-------------|
| `value` | `string` | Full ISO 8601 string (`"2026-05-15T14:30:00"` or `"2026-05-15"` if time disabled) |
| `date` | `string` | Date-only part (`"2026-05-15"`) |
| `time` | `string` | Time-only part (`"14:30:00"`) or empty string if time disabled |
| `isOpen` | `boolean` | Whether the popover is open |

### Date Range Picker

| Key | Type | Description |
|-----|------|-------------|
| `start` | `string` | Start ISO string |
| `end` | `string` | End ISO string |
| `startDate` | `string` | Start date-only |
| `endDate` | `string` | End date-only |
| `isOpen` | `boolean` | Whether the popover is open |

State is pushed via `setWidgetState()` on every selection change, making it immediately available to other widgets and data source expressions.

## Widget Component Behavior

### Date Picker (`datePickerWidget.jsx`)

**Layout:** A styled input field displaying the formatted selected date. Click opens a `Popover` containing `CalendarGrid` + optional `TimeInput`.

**Flow:**
1. Input shows placeholder or formatted date
2. Click input → popover opens, `setWidgetState({ isOpen: true })`, fire `onOpen`
3. Click a day → update selected date, update state, fire `onChange`
4. Adjust time inputs → update state, fire `onChange`
5. Click outside / press Escape → popover closes, `setWidgetState({ isOpen: false })`, fire `onClose`
6. Clear button (small × in input) → reset to empty, fire `onClear`

**Default value handling:** On mount, if `widgetConfig.defaultValue` is set, parse it and set as the initial selection. Since the AppPage runtime resolves `{{templates}}` before the widget sees them, the value will already be a concrete ISO string.

### Date Range Picker (`dateRangePickerWidget.jsx`)

**Layout:** Two styled inputs (start / end) with an arrow between them. Click either input → popover opens with dual `CalendarGrid` (left = current month, right = next month). Optional `TimeInput` below each calendar.

**Range selection flow:**
1. First click → sets range start, clears range end
2. Hover after first click → preview highlight from start to hovered day
3. Second click → sets range end (if after start; if before start, swap them)
4. Both set → fire `onChange`, close popover

**Preset buttons:** If `presets` array is non-empty, render preset buttons in a row below the calendars. Clicking a preset calculates the dates and applies them immediately.

**Month navigation:** Left calendar has ◀, right calendar has ▶. They always show consecutive months. Navigating left shifts both back; navigating right shifts both forward.

## Config Editors

### Date Picker Config Editor

Fields:
- Label (text input)
- Placeholder (text input)
- Enable Time (checkbox)
- Default Value (text input, supports `{{templates}}`)
- Min Date (text input)
- Max Date (text input)

### Date Range Picker Config Editor

Fields:
- Label (text input)
- Start Placeholder (text input)
- End Placeholder (text input)
- Enable Time (checkbox)
- Default Start (text input)
- Default End (text input)
- Min Date (text input)
- Max Date (text input)
- Presets section: array of { label, startOffset, endOffset } entries with add/remove

## Widget Map Registration

### `widget.map.js` additions

Both widgets follow the same pattern as existing widgets (lazy-loaded, Suspense-wrapped):

```js
'date-picker': {
  label: "Date / Time Picker",
  value: WIDGET_TYPES.DATE_PICKER.value,
  datasetFields: [],
  defaultAutoRun: false,
  description: "Pick a single date and optional time",
  component: /* lazy-loaded DatePickerWidget */,
  configEditor: DatePickerConfigEditor,
  icon: /* Calendar icon from lucide-react */,
  sampleConfig: { /* see above */ },
},
'date-range-picker': {
  label: "Date Range Picker",
  value: WIDGET_TYPES.DATE_RANGE_PICKER.value,
  datasetFields: [],
  defaultAutoRun: false,
  description: "Select a date/time range with start and end",
  component: /* lazy-loaded DateRangePickerWidget */,
  configEditor: DateRangePickerConfigEditor,
  icon: /* CalendarRange icon from lucide-react */,
  sampleConfig: { /* see above */ },
},
```

### `index.js` additions

Add barrel exports for both widget components and config editors.

## Styling

All styling uses the existing CSS variable theme from `@jet-admin/ui`:
- `bg-background`, `bg-muted`, `border-border`, `text-foreground`, `text-muted-foreground`
- `bg-primary` for selected day
- `bg-primary/20` for range highlight
- Calendar cells use Tailwind utility classes consistent with the rest of the project

No new CSS files needed — everything uses Tailwind classes inline, matching the existing widget pattern.

## Out of Scope

- Timezone selection — values are naive (no timezone offset)
- Date-only range picker without time (covered: `enableTime: false` is the default)
- Multi-date selection (select multiple individual dates) — not needed
- Week/month selection modes — not needed
- Inline calendar mode for these widgets (the single picker could support it, but the user chose popover style)
