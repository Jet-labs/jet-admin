import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Popover, PopoverContent, PopoverTrigger, Label, Input, Button } from '@jet-admin/ui';
import { CalendarRange, ArrowRight, X } from 'lucide-react';
import { CalendarGrid } from '../_shared/calendarGrid';
import { TimeInput } from '../_shared/timeInput';
import { parseISOSafe, formatDateISO, formatDateTimeISO, formatDisplayDate, formatDisplayDateTime } from '../_shared/calendarUtils';
import { setMonth, setHours, setMinutes, setSeconds, addDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export function DateRangePickerWidget({ widgetConfig = {}, fireWidgetEvent, widgetState = {}, setWidgetState }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);
  
  const parsedStart = useMemo(() => parseISOSafe(widgetState?.start), [widgetState?.start]);
  const parsedEnd = useMemo(() => parseISOSafe(widgetState?.end), [widgetState?.end]);

  useEffect(() => {
    if (!widgetState?.start && !widgetState?.end && (widgetConfig.defaultStart || widgetConfig.defaultEnd)) {
      const start = parseISOSafe(widgetConfig.defaultStart);
      const end = parseISOSafe(widgetConfig.defaultEnd);
      if (start || end) {
        updateState(start, end);
      }
    }
  }, [widgetConfig.defaultStart, widgetConfig.defaultEnd, widgetState?.start, widgetState?.end]);

  useEffect(() => {
    if (parsedStart) {
      setCurrentDate(parsedStart);
    }
  }, [parsedStart]);

  const updateState = (start, end) => {
    if (!start && !end) {
      if (setWidgetState) {
        setWidgetState({ start: "", end: "", startDate: "", endDate: "", isOpen: false });
      }
      if (fireWidgetEvent) {
        fireWidgetEvent("onClear");
        fireWidgetEvent("onChange", { start: "", end: "", startDate: "", endDate: "" });
      }
      return;
    }

    const enableTime = !!widgetConfig.enableTime;
    const startVal = start ? (enableTime ? formatDateTimeISO(start) : formatDateISO(start)) : "";
    const endVal = end ? (enableTime ? formatDateTimeISO(end) : formatDateISO(end)) : "";
    const startDateStr = start ? formatDateISO(start) : "";
    const endDateStr = end ? formatDateISO(end) : "";

    if (setWidgetState) {
      setWidgetState({ start: startVal, end: endVal, startDate: startDateStr, endDate: endDateStr });
    }
    
    if (start && end && fireWidgetEvent) {
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
        if (setWidgetState) {
          setWidgetState({ isOpen: false });
        }
        if (fireWidgetEvent) {
          fireWidgetEvent("onClose");
        }
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

    if (end) {
      end = setHours(end, 23);
      end = setMinutes(end, 59);
      end = setSeconds(end, 59);
    }

    updateState(start, end);
    if (setWidgetState) {
      setWidgetState({ isOpen: false });
    }
    if (fireWidgetEvent) {
      fireWidgetEvent("onClose");
    }
  };

  const displayStart = parsedStart ? (widgetConfig.enableTime ? formatDisplayDateTime(parsedStart) : formatDisplayDate(parsedStart)) : "";
  const displayEnd = parsedEnd ? (widgetConfig.enableTime ? formatDisplayDateTime(parsedEnd) : formatDisplayDate(parsedEnd)) : "";
  const nextMonthDate = setMonth(new Date(currentDate), currentDate.getMonth() + 1);
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  return (
    <div className="relative flex flex-col gap-1.5 w-full h-full min-h-0">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-md">
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}

      {widgetConfig.label && <Label>{widgetConfig.label}</Label>}
      
      <Popover open={!!widgetState?.isOpen} onOpenChange={(open) => {
        if (setWidgetState) {
          setWidgetState({ isOpen: open });
        }
        if (fireWidgetEvent) {
          fireWidgetEvent(open ? "onOpen" : "onClose");
        }
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
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
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
                  type="button"
                  onClick={(e) => { e.stopPropagation(); updateState(null, null); }}
                  className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground flex items-center justify-center"
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
                onMonthChange={(delta) => setCurrentDate(setMonth(new Date(currentDate), currentDate.getMonth() + delta))}
                hideRightArrow={true}
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
                onMonthChange={(delta) => setCurrentDate(setMonth(new Date(currentDate), currentDate.getMonth() + delta))}
                hideLeftArrow={true}
              />
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

DateRangePickerWidget.propTypes = {
  widgetConfig: PropTypes.object,
  fireWidgetEvent: PropTypes.func,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
};

export default DateRangePickerWidget;
