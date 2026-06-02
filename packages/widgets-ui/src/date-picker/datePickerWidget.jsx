import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Popover, PopoverContent, PopoverTrigger, Label, Input } from '@jet-admin/ui';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { CalendarGrid } from '../_shared/calendarGrid';
import { TimeInput } from '../_shared/timeInput';
import { parseISOSafe, formatDateISO, formatDateTimeISO, formatDisplayDate, formatDisplayDateTime } from '../_shared/calendarUtils';
import { setMonth, setHours, setMinutes, setSeconds } from 'date-fns';

export function DatePickerWidget({ widgetConfig = {}, fireWidgetEvent, widgetState = {}, setWidgetState }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const parsedValue = useMemo(() => parseISOSafe(widgetState?.value), [widgetState?.value]);

  useEffect(() => {
    if (!widgetState?.value && widgetConfig.defaultValue) {
      const parsed = parseISOSafe(widgetConfig.defaultValue);
      if (parsed) {
        updateState(parsed);
      }
    }
  }, [widgetConfig.defaultValue, widgetState?.value]);

  useEffect(() => {
    if (parsedValue) {
      setCurrentDate(parsedValue);
    }
  }, [parsedValue]);

  const updateState = (date) => {
    if (!date) {
      if (setWidgetState) {
        setWidgetState({ value: "", date: "", time: "", isOpen: false });
      }
      if (fireWidgetEvent) {
        fireWidgetEvent("onClear");
        fireWidgetEvent("onChange", { value: "", date: "", time: "" });
      }
      return;
    }

    const enableTime = !!widgetConfig.enableTime;
    const value = enableTime ? formatDateTimeISO(date) : formatDateISO(date);
    const dateStr = formatDateISO(date);
    const timeStr = enableTime ? formatDateTimeISO(date).split('T')[1] : "";

    if (setWidgetState) {
      setWidgetState({ value, date: dateStr, time: timeStr });
    }
    if (fireWidgetEvent) {
      fireWidgetEvent("onChange", { value, date: dateStr, time: timeStr });
    }
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
      if (setWidgetState) {
        setWidgetState({ isOpen: false });
      }
      if (fireWidgetEvent) {
        fireWidgetEvent("onClose");
      }
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
                type="button"
                onClick={(e) => { e.stopPropagation(); updateState(null); }}
                className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground flex items-center justify-center"
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

DatePickerWidget.propTypes = {
  widgetConfig: PropTypes.object,
  fireWidgetEvent: PropTypes.func,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
};

export default DatePickerWidget;
