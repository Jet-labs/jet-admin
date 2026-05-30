# Date/Time Picker Widgets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a single date/time picker and a date/time range picker as native Jet Admin widgets.

**Architecture:** Pure React components using `@jet-admin/ui` primitives (Popover, Input, Button) and `date-fns` for date math. State is synchronized with the AppPage runtime via `useWidgetState`.

**Tech Stack:** React, Tailwind CSS, `date-fns`, `lucide-react`.

---

### Task 1: Type Registration & Calendar Utilities

**Files:**
- Modify: `packages/widget-types/src/index.js`
- Create: `packages/widgets-ui/src/_shared/calendarUtils.js`

- [ ] **Step 1: Register widget types and events**

Modify `packages/widget-types/src/index.js`.
Add to `WIDGET_TYPES`:
```javascript
  DATE_PICKER: {
    name: "Date / Time Picker",
    value: "date-picker",
  },
  DATE_RANGE_PICKER: {
    name: "Date Range Picker",
    value: "date-range-picker",
  },
```

Add to `WIDGET_EVENT_TYPES`:
```javascript
  "date-picker": [
    { value: "onChange", label: "On Change", desc: "Fires when the selected date/time changes." },
    { value: "onOpen", label: "On Open", desc: "Fires when the picker popover opens" },
    { value: "onClose", label: "On Close", desc: "Fires when the picker popover closes" },
    { value: "onClear", label: "On Clear", desc: "Fires when the selected value is cleared" },
  ],
  "date-range-picker": [
    { value: "onChange", label: "On Change", desc: "Fires when the selected range changes." },
    { value: "onOpen", label: "On Open", desc: "Fires when the picker popover opens" },
    { value: "onClose", label: "On Close", desc: "Fires when the picker popover closes" },
    { value: "onClear", label: "On Clear", desc: "Fires when the range is cleared" },
  ],
```

- [ ] **Step 2: Install date-fns in widgets-ui**

```bash
cd packages/widgets-ui
npm install date-fns
```

- [ ] **Step 3: Create calendarUtils.js**

Create `packages/widgets-ui/src/_shared/calendarUtils.js`:

```javascript
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameDay, isWithinInterval, 
  parseISO, isValid 
} from 'date-fns';

export function getCalendarDays(year, month) {
  const date = new Date(year, month, 1);
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  
  return eachDayOfInterval({ start, end });
}

export function formatDateISO(date) {
  if (!date || !isValid(date)) return "";
  return format(date, 'yyyy-MM-dd');
}

export function formatDateTimeISO(date) {
  if (!date || !isValid(date)) return "";
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

export function formatDisplayDate(date) {
  if (!date || !isValid(date)) return "";
  return format(date, 'MMM d, yyyy');
}

export function formatDisplayDateTime(date) {
  if (!date || !isValid(date)) return "";
  return format(date, 'MMM d, yyyy · h:mm a');
}

export function checkIsSameDay(a, b) {
  if (!a || !b || !isValid(a) || !isValid(b)) return false;
  return isSameDay(a, b);
}

export function checkIsInRange(date, start, end) {
  if (!date || !start || !end || !isValid(date) || !isValid(start) || !isValid(end)) return false;
  return isWithinInterval(date, { start, end });
}

export function parseISOSafe(str) {
  if (!str) return null;
  const parsed = parseISO(str);
  return isValid(parsed) ? parsed : null;
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/widget-types/src/index.js packages/widgets-ui/package.json packages/widgets-ui/src/_shared/calendarUtils.js
git commit -m "feat: register date picker types and add calendar utils"
```

---

### Task 2: Shared UI Components (CalendarGrid & TimeInput)

**Files:**
- Create: `packages/widgets-ui/src/_shared/calendarGrid.jsx`
- Create: `packages/widgets-ui/src/_shared/timeInput.jsx`

- [ ] **Step 1: Create TimeInput**

Create `packages/widgets-ui/src/_shared/timeInput.jsx`:

```javascript
import React from 'react';
import { Input } from '@jet-admin/ui';
import { Clock } from 'lucide-react';

export function TimeInput({ hours = 0, minutes = 0, seconds = 0, onChange }) {
  const handleChange = (field, value) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0;
    
    if (field === 'hours') {
      if (num > 23) num = 0;
      if (num < 0) num = 23;
    } else {
      if (num > 59) num = 0;
      if (num < 0) num = 59;
    }
    
    onChange({ hours, minutes, seconds, [field]: num });
  };

  const handleKeyDown = (e, field, value) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleChange(field, value + 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleChange(field, value - 1);
    }
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 justify-center border-t border-border pt-3 mt-3">
      <Clock className="w-4 h-4 text-muted-foreground mr-1" />
      <Input 
        type="text" 
        value={pad(hours)} 
        onChange={(e) => handleChange('hours', e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'hours', hours)}
        className="w-12 h-8 text-center px-1" 
      />
      <span className="text-muted-foreground">:</span>
      <Input 
        type="text" 
        value={pad(minutes)} 
        onChange={(e) => handleChange('minutes', e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'minutes', minutes)}
        className="w-12 h-8 text-center px-1" 
      />
      <span className="text-muted-foreground">:</span>
      <Input 
        type="text" 
        value={pad(seconds)} 
        onChange={(e) => handleChange('seconds', e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'seconds', seconds)}
        className="w-12 h-8 text-center px-1" 
      />
    </div>
  );
}
```

- [ ] **Step 2: Create CalendarGrid**

Create `packages/widgets-ui/src/_shared/calendarGrid.jsx`:

```javascript
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameMonth } from 'date-fns';
import { getCalendarDays, checkIsSameDay, checkIsInRange } from './calendarUtils';

export function CalendarGrid({
  month,
  year,
  selectedDate,
  rangeStart,
  rangeEnd,
  hoverDate,
  onDayClick,
  onDayHover,
  onMonthChange,
  showNavigation = true
}) {
  const days = getCalendarDays(year, month);
  const currentMonthDate = new Date(year, month, 1);
  const today = new Date();

  return (
    <div className="w-[252px]">
      {showNavigation && (
        <div className="flex justify-between items-center mb-4 px-1">
          <button onClick={() => onMonthChange(-1)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="font-semibold text-sm">
            {format(currentMonthDate, 'MMMM yyyy')}
          </div>
          <button onClick={() => onMonthChange(1)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs text-muted-foreground font-medium">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonthDate);
          const isSelected = checkIsSameDay(day, selectedDate);
          const isStart = checkIsSameDay(day, rangeStart);
          const isEnd = checkIsSameDay(day, rangeEnd);
          const isRange = rangeStart && rangeEnd && checkIsInRange(day, rangeStart, rangeEnd);
          const isHoverRange = rangeStart && !rangeEnd && hoverDate && checkIsInRange(day, rangeStart, hoverDate) && day > rangeStart;
          const isToday = checkIsSameDay(day, today);

          let bgClass = '';
          let textClass = isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50';
          let roundedClass = 'rounded-md';

          if (isSelected || isStart || isEnd) {
            bgClass = 'bg-primary';
            textClass = 'text-primary-foreground font-medium';
            if (isStart && rangeEnd) roundedClass = 'rounded-l-md rounded-r-none';
            if (isEnd && rangeStart) roundedClass = 'rounded-r-md rounded-l-none';
          } else if (isRange || isHoverRange) {
            bgClass = 'bg-primary/20';
            roundedClass = 'rounded-none';
          }

          return (
            <button
              key={i}
              onClick={() => onDayClick?.(day)}
              onMouseEnter={() => onDayHover?.(day)}
              className={`h-8 w-8 text-sm flex items-center justify-center ${bgClass} ${textClass} ${roundedClass} ${isToday && !isSelected && !isStart && !isEnd ? 'border border-primary/50' : ''} hover:bg-primary/80 hover:text-primary-foreground transition-colors`}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/widgets-ui/src/_shared/
git commit -m "feat: add shared CalendarGrid and TimeInput components"
```

---

### Task 3: Date Picker Widget & Config Editor

**Files:**
- Create: `packages/widgets-ui/src/date-picker/datePickerWidget.jsx`
- Create: `packages/widgets-ui/src/date-picker/datePickerConfigEditor.jsx`
- Create: `packages/widgets-ui/src/date-picker/index.js`

- [ ] **Step 1: Create DatePickerWidget**

Create `packages/widgets-ui/src/date-picker/datePickerWidget.jsx`:

```javascript
import React, { useState, useEffect, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger, Label, Input } from '@jet-admin/ui';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useWidgetState } from 'frontend/src/logic/appPageRuntime/useWidgetState';
import { CalendarGrid } from '../_shared/calendarGrid';
import { TimeInput } from '../_shared/timeInput';
import { parseISOSafe, formatDateISO, formatDateTimeISO, formatDisplayDate, formatDisplayDateTime } from '../_shared/calendarUtils';
import { setYear, setMonth, setHours, setMinutes, setSeconds } from 'date-fns';

export function DatePickerWidget({ widgetConfig, widgetId, fireWidgetEvent }) {
  const { widgetState, setWidgetState } = useWidgetState(widgetId);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const parsedValue = useMemo(() => parseISOSafe(widgetState?.value), [widgetState?.value]);

  useEffect(() => {
    if (!widgetState && widgetConfig.defaultValue) {
      const parsed = parseISOSafe(widgetConfig.defaultValue);
      if (parsed) {
        updateState(parsed);
      }
    }
  }, [widgetConfig.defaultValue]);

  useEffect(() => {
    if (parsedValue) {
      setCurrentDate(parsedValue);
    }
  }, [parsedValue]);

  const updateState = (date) => {
    if (!date) {
      setWidgetState({ value: "", date: "", time: "", isOpen: false });
      fireWidgetEvent("onClear");
      fireWidgetEvent("onChange", { value: "", date: "", time: "" });
      return;
    }

    const value = widgetConfig.enableTime ? formatDateTimeISO(date) : formatDateISO(date);
    const dateStr = formatDateISO(date);
    const timeStr = widgetConfig.enableTime ? formatDateTimeISO(date).split('T')[1] : "";

    setWidgetState({ value, date: dateStr, time: timeStr });
    fireWidgetEvent("onChange", { value, date: dateStr, time: timeStr });
  };

  const handleDayClick = (day) => {
    let newDate = day;
    if (parsedValue && widgetConfig.enableTime) {
      newDate = setHours(newDate, parsedValue.getHours());
      newDate = setMinutes(newDate, parsedValue.getMinutes());
      newDate = setSeconds(newDate, parsedValue.getSeconds());
    }
    updateState(newDate);
    if (!widgetConfig.enableTime) {
      setWidgetState({ isOpen: false });
      fireWidgetEvent("onClose");
    }
  };

  const handleTimeChange = ({ hours, minutes, seconds }) => {
    let newDate = parsedValue || new Date();
    newDate = setHours(newDate, hours);
    newDate = setMinutes(newDate, minutes);
    newDate = setSeconds(newDate, seconds);
    updateState(newDate);
  };

  const displayValue = parsedValue ? (widgetConfig.enableTime ? formatDisplayDateTime(parsedValue) : formatDisplayDate(parsedValue)) : "";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {widgetConfig.label && <Label>{widgetConfig.label}</Label>}
      
      <Popover open={widgetState?.isOpen} onOpenChange={(open) => {
        setWidgetState({ isOpen: open });
        fireWidgetEvent(open ? "onOpen" : "onClose");
      }}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input 
              readOnly
              placeholder={widgetConfig.placeholder || "Select date..."}
              value={displayValue}
              className="pl-9 pr-8 cursor-pointer"
            />
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            {parsedValue && (
              <button 
                onClick={(e) => { e.stopPropagation(); updateState(null); }}
                className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <CalendarGrid
            month={currentDate.getMonth()}
            year={currentDate.getFullYear()}
            selectedDate={parsedValue}
            onDayClick={handleDayClick}
            onMonthChange={(delta) => setCurrentDate(setMonth(currentDate, currentDate.getMonth() + delta))}
          />
          {widgetConfig.enableTime && (
            <TimeInput
              hours={parsedValue?.getHours() || 0}
              minutes={parsedValue?.getMinutes() || 0}
              seconds={parsedValue?.getSeconds() || 0}
              onChange={handleTimeChange}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

- [ ] **Step 2: Create DatePickerConfigEditor**

Create `packages/widgets-ui/src/date-picker/datePickerConfigEditor.jsx`:

```javascript
import React from 'react';
import { widgetEditorForm } from '../widgetEditorForm';

export const DatePickerConfigEditor = widgetEditorForm([
  {
    name: 'label',
    label: 'Label',
    type: 'string',
    defaultValue: 'Select date'
  },
  {
    name: 'placeholder',
    label: 'Placeholder',
    type: 'string',
    defaultValue: 'Pick a date...'
  },
  {
    name: 'enableTime',
    label: 'Enable Time',
    type: 'boolean',
    defaultValue: false
  },
  {
    name: 'defaultValue',
    label: 'Default Value',
    type: 'string',
    defaultValue: ''
  }
]);
```

- [ ] **Step 3: Create index.js**

Create `packages/widgets-ui/src/date-picker/index.js`:

```javascript
export { DatePickerWidget } from './datePickerWidget';
export { DatePickerConfigEditor } from './datePickerConfigEditor';
```

- [ ] **Step 4: Commit**

```bash
git add packages/widgets-ui/src/date-picker/
git commit -m "feat: add date picker widget and config editor"
```

---

### Task 4: Date Range Picker Widget & Config Editor

**Files:**
- Create: `packages/widgets-ui/src/date-range-picker/dateRangePickerWidget.jsx`
- Create: `packages/widgets-ui/src/date-range-picker/dateRangePickerConfigEditor.jsx`
- Create: `packages/widgets-ui/src/date-range-picker/index.js`

- [ ] **Step 1: Create DateRangePickerWidget**

Create `packages/widgets-ui/src/date-range-picker/dateRangePickerWidget.jsx`:

```javascript
import React, { useState, useEffect, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger, Label, Input } from '@jet-admin/ui';
import { CalendarRange, ArrowRight, X } from 'lucide-react';
import { useWidgetState } from 'frontend/src/logic/appPageRuntime/useWidgetState';
import { CalendarGrid } from '../_shared/calendarGrid';
import { TimeInput } from '../_shared/timeInput';
import { parseISOSafe, formatDateISO, formatDateTimeISO, formatDisplayDate, formatDisplayDateTime } from '../_shared/calendarUtils';
import { setMonth, setHours, setMinutes, setSeconds, addDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export function DateRangePickerWidget({ widgetConfig, widgetId, fireWidgetEvent }) {
  const { widgetState, setWidgetState } = useWidgetState(widgetId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);
  
  const parsedStart = useMemo(() => parseISOSafe(widgetState?.start), [widgetState?.start]);
  const parsedEnd = useMemo(() => parseISOSafe(widgetState?.end), [widgetState?.end]);

  useEffect(() => {
    if (!widgetState && (widgetConfig.defaultStart || widgetConfig.defaultEnd)) {
      const start = parseISOSafe(widgetConfig.defaultStart);
      const end = parseISOSafe(widgetConfig.defaultEnd);
      if (start || end) {
        updateState(start, end);
      }
    }
  }, [widgetConfig.defaultStart, widgetConfig.defaultEnd]);

  useEffect(() => {
    if (parsedStart) {
      setCurrentDate(parsedStart);
    }
  }, [parsedStart]);

  const updateState = (start, end) => {
    if (!start && !end) {
      setWidgetState({ start: "", end: "", startDate: "", endDate: "", isOpen: false });
      fireWidgetEvent("onClear");
      fireWidgetEvent("onChange", { start: "", end: "", startDate: "", endDate: "" });
      return;
    }

    const startVal = start ? (widgetConfig.enableTime ? formatDateTimeISO(start) : formatDateISO(start)) : "";
    const endVal = end ? (widgetConfig.enableTime ? formatDateTimeISO(end) : formatDateISO(end)) : "";
    const startDateStr = start ? formatDateISO(start) : "";
    const endDateStr = end ? formatDateISO(end) : "";

    setWidgetState({ start: startVal, end: endVal, startDate: startDateStr, endDate: endDateStr });
    
    if (start && end) {
      fireWidgetEvent("onChange", { start: startVal, end: endVal, startDate: startDateStr, endDate: endDateStr });
    }
  };

  const handleDayClick = (day) => {
    if (!parsedStart || (parsedStart && parsedEnd)) {
      // First click: set start, clear end
      let newStart = day;
      if (parsedStart && widgetConfig.enableTime) {
        newStart = setHours(newStart, parsedStart.getHours());
        newStart = setMinutes(newStart, parsedStart.getMinutes());
        newStart = setSeconds(newStart, parsedStart.getSeconds());
      }
      updateState(newStart, null);
    } else {
      // Second click: set end
      let newEnd = day;
      let newStart = parsedStart;
      
      if (day < parsedStart) {
        newEnd = parsedStart;
        newStart = day;
      }
      
      if (widgetConfig.enableTime) {
        newEnd = setHours(newEnd, parsedEnd ? parsedEnd.getHours() : 23);
        newEnd = setMinutes(newEnd, parsedEnd ? parsedEnd.getMinutes() : 59);
        newEnd = setSeconds(newEnd, parsedEnd ? parsedEnd.getSeconds() : 59);
      }
      
      updateState(newStart, newEnd);
      if (!widgetConfig.enableTime) {
        setWidgetState({ isOpen: false });
        fireWidgetEvent("onClose");
      }
    }
  };

  const handleTimeChange = (type, { hours, minutes, seconds }) => {
    if (type === 'start' && parsedStart) {
      let newStart = setHours(parsedStart, hours);
      newStart = setMinutes(newStart, minutes);
      newStart = setSeconds(newStart, seconds);
      updateState(newStart, parsedEnd);
    } else if (type === 'end' && parsedEnd) {
      let newEnd = setHours(parsedEnd, hours);
      newEnd = setMinutes(newEnd, minutes);
      newEnd = setSeconds(newEnd, seconds);
      updateState(parsedStart, newEnd);
    }
  };

  const handlePresetClick = (preset) => {
    const today = new Date();
    let start, end;

    if (preset.startOffset === 'startOfMonth') start = startOfMonth(today);
    else if (preset.startOffset === 'startOfYear') start = startOfYear(today);
    else start = addDays(today, preset.startOffset || 0);

    if (preset.endOffset === 'endOfMonth') end = endOfMonth(today);
    else if (preset.endOffset === 'endOfYear') end = endOfYear(today);
    else end = addDays(today, preset.endOffset || 0);

    updateState(start, end);
    setWidgetState({ isOpen: false });
    fireWidgetEvent("onClose");
  };

  const displayStart = parsedStart ? (widgetConfig.enableTime ? formatDisplayDateTime(parsedStart) : formatDisplayDate(parsedStart)) : "";
  const displayEnd = parsedEnd ? (widgetConfig.enableTime ? formatDisplayDateTime(parsedEnd) : formatDisplayDate(parsedEnd)) : "";
  const nextMonthDate = setMonth(currentDate, currentDate.getMonth() + 1);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {widgetConfig.label && <Label>{widgetConfig.label}</Label>}
      
      <Popover open={widgetState?.isOpen} onOpenChange={(open) => {
        setWidgetState({ isOpen: open });
        fireWidgetEvent(open ? "onOpen" : "onClose");
      }}>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input 
                readOnly
                placeholder={widgetConfig.placeholderStart || "Start date"}
                value={displayStart}
                className="pl-9 cursor-pointer"
              />
              <CalendarRange className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="relative flex-1">
              <Input 
                readOnly
                placeholder={widgetConfig.placeholderEnd || "End date"}
                value={displayEnd}
                className="pl-9 pr-8 cursor-pointer"
              />
              <CalendarRange className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              {(parsedStart || parsedEnd) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); updateState(null, null); }}
                  className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex flex-col" align="start">
          <div className="flex p-3 gap-4">
            <div className="flex flex-col">
              <CalendarGrid
                month={currentDate.getMonth()}
                year={currentDate.getFullYear()}
                rangeStart={parsedStart}
                rangeEnd={parsedEnd}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
                onMonthChange={(delta) => setCurrentDate(setMonth(currentDate, currentDate.getMonth() + delta))}
              />
              {widgetConfig.enableTime && parsedStart && (
                <TimeInput
                  hours={parsedStart.getHours()}
                  minutes={parsedStart.getMinutes()}
                  seconds={parsedStart.getSeconds()}
                  onChange={(time) => handleTimeChange('start', time)}
                />
              )}
            </div>
            <div className="flex flex-col">
              <CalendarGrid
                month={nextMonthDate.getMonth()}
                year={nextMonthDate.getFullYear()}
                rangeStart={parsedStart}
                rangeEnd={parsedEnd}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
                onMonthChange={(delta) => setCurrentDate(setMonth(currentDate, currentDate.getMonth() + delta))}
                showNavigation={false}
              />
              <div className="flex justify-between items-center mb-4 px-1 -mt-[256px] pointer-events-none">
                <div />
                <div className="font-semibold text-sm pointer-events-auto">
                  {format(nextMonthDate, 'MMMM yyyy')}
                </div>
                <button onClick={() => setCurrentDate(setMonth(currentDate, currentDate.getMonth() + 1))} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground pointer-events-auto">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-[212px]" />
              {widgetConfig.enableTime && parsedEnd && (
                <TimeInput
                  hours={parsedEnd.getHours()}
                  minutes={parsedEnd.getMinutes()}
                  seconds={parsedEnd.getSeconds()}
                  onChange={(time) => handleTimeChange('end', time)}
                />
              )}
            </div>
          </div>
          {widgetConfig.presets && widgetConfig.presets.length > 0 && (
            <div className="border-t border-border p-3 flex flex-wrap gap-2 bg-muted/30">
              {widgetConfig.presets.map((preset, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => handlePresetClick(preset)}>
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

- [ ] **Step 2: Create DateRangePickerConfigEditor**

Create `packages/widgets-ui/src/date-range-picker/dateRangePickerConfigEditor.jsx`:

```javascript
import React from 'react';
import { widgetEditorForm } from '../widgetEditorForm';

export const DateRangePickerConfigEditor = widgetEditorForm([
  {
    name: 'label',
    label: 'Label',
    type: 'string',
    defaultValue: 'Select range'
  },
  {
    name: 'placeholderStart',
    label: 'Start Placeholder',
    type: 'string',
    defaultValue: 'Start date'
  },
  {
    name: 'placeholderEnd',
    label: 'End Placeholder',
    type: 'string',
    defaultValue: 'End date'
  },
  {
    name: 'enableTime',
    label: 'Enable Time',
    type: 'boolean',
    defaultValue: false
  },
  {
    name: 'defaultStart',
    label: 'Default Start Value',
    type: 'string',
    defaultValue: ''
  },
  {
    name: 'defaultEnd',
    label: 'Default End Value',
    type: 'string',
    defaultValue: ''
  }
]);
```

- [ ] **Step 3: Create index.js**

Create `packages/widgets-ui/src/date-range-picker/index.js`:

```javascript
export { DateRangePickerWidget } from './dateRangePickerWidget';
export { DateRangePickerConfigEditor } from './dateRangePickerConfigEditor';
```

- [ ] **Step 4: Commit**

```bash
git add packages/widgets-ui/src/date-range-picker/
git commit -m "feat: add date range picker widget and config editor"
```

---

### Task 5: Register Widgets in WIDGETS_MAP

**Files:**
- Modify: `packages/widgets-ui/src/widget.map.js`
- Modify: `packages/widgets-ui/src/index.js`

- [ ] **Step 1: Export from index.js**

Modify `packages/widgets-ui/src/index.js` to add exports:
```javascript
export * from './date-picker';
export * from './date-range-picker';
```

- [ ] **Step 2: Register in widget.map.js**

Modify `packages/widgets-ui/src/widget.map.js`. Add the imports at the top:
```javascript
import { Calendar, CalendarRange } from 'lucide-react';
import { DatePickerConfigEditor } from './date-picker';
import { DateRangePickerConfigEditor } from './date-range-picker';

const DatePickerWidget = React.lazy(() => import('./date-picker').then(module => ({ default: module.DatePickerWidget })));
const DateRangePickerWidget = React.lazy(() => import('./date-range-picker').then(module => ({ default: module.DateRangePickerWidget })));
```

Add to `WIDGETS_MAP`:
```javascript
  'date-picker': {
    label: "Date / Time Picker",
    value: WIDGET_TYPES.DATE_PICKER.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Pick a single date and optional time",
    component: (props) => (
      <React.Suspense fallback={<div>Loading...</div>}>
        <DatePickerWidget {...props} />
      </React.Suspense>
    ),
    configEditor: DatePickerConfigEditor,
    icon: <Calendar className="w-4 h-4 text-muted-foreground" />,
    sampleConfig: {
      label: "Select date",
      placeholder: "Pick a date...",
      enableTime: false,
      defaultValue: "",
      minDate: "",
      maxDate: "",
      showHeader: false,
    },
  },
  'date-range-picker': {
    label: "Date Range Picker",
    value: WIDGET_TYPES.DATE_RANGE_PICKER.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Select a date/time range with start and end",
    component: (props) => (
      <React.Suspense fallback={<div>Loading...</div>}>
        <DateRangePickerWidget {...props} />
      </React.Suspense>
    ),
    configEditor: DateRangePickerConfigEditor,
    icon: <CalendarRange className="w-4 h-4 text-muted-foreground" />,
    sampleConfig: {
      label: "Select range",
      placeholderStart: "Start date",
      placeholderEnd: "End date",
      enableTime: false,
      defaultStart: "",
      defaultEnd: "",
      minDate: "",
      maxDate: "",
      presets: [
        { label: "Today", startOffset: 0, endOffset: 0 },
        { label: "Last 7 days", startOffset: -7, endOffset: 0 },
        { label: "This month", startOffset: "startOfMonth", endOffset: "endOfMonth" }
      ],
      showHeader: false,
    },
  },
```

- [ ] **Step 3: Commit**

```bash
git add packages/widgets-ui/src/widget.map.js packages/widgets-ui/src/index.js
git commit -m "feat: register date picker widgets in map"
```
