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
  showNavigation = true,
  hideLeftArrow = false,
  hideRightArrow = false,
  isDateDisabled = null,
  gridLabel = null,
  instanceId = "",
}) {
  const days = getCalendarDays(year, month);
  const currentMonthDate = new Date(year, month, 1);
  const today = new Date();
  const monthLabel = format(currentMonthDate, 'MMMM yyyy');
  const labelId = instanceId ? `${instanceId}-cal-${year}-${month}` : undefined;

  const handleDayKeyDown = (e, day) => {
    // Full keyboard calendar navigation (E11/E12, F05): arrows move by
    // day/week, Home/End week bounds, PageUp/Down change month.
    const move = (d) => {
      e.preventDefault();
      const next = new Date(d);
      onDayClick?.(next);
    };
    if (e.key === "ArrowLeft") {
      const next = new Date(day); next.setDate(next.getDate() - 1); move(next);
    } else if (e.key === "ArrowRight") {
      const next = new Date(day); next.setDate(next.getDate() + 1); move(next);
    } else if (e.key === "ArrowUp") {
      const next = new Date(day); next.setDate(next.getDate() - 7); move(next);
    } else if (e.key === "ArrowDown") {
      const next = new Date(day); next.setDate(next.getDate() + 7); move(next);
    } else if (e.key === "Home") {
      e.preventDefault();
      const next = new Date(day); next.setDate(next.getDate() - ((next.getDay() + 7) % 7)); move(next);
    } else if (e.key === "End") {
      e.preventDefault();
      const next = new Date(day); next.setDate(next.getDate() + (6 - ((next.getDay() + 7) % 7))); move(next);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      onMonthChange?.(e.shiftKey ? -12 : -1);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      onMonthChange?.(e.shiftKey ? 12 : 1);
    }
  };

  return (
    <div className="w-[252px]" role="group" aria-labelledby={labelId} aria-label={labelId ? undefined : (gridLabel || monthLabel)}>
      {showNavigation && (
        <div className="flex justify-between items-center mb-4 px-1">
          {!hideLeftArrow ? (
            <button
              type="button"
              onClick={() => onMonthChange(-1)}
              aria-label={`Previous month, ${monthLabel}`}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <div className="w-6 h-6" aria-hidden="true" />
          )}
          <div className="font-semibold text-sm" id={labelId} aria-live="polite">
            {monthLabel}
          </div>
          {!hideRightArrow ? (
            <button
              type="button"
              onClick={() => onMonthChange(1)}
              aria-label={`Next month, ${monthLabel}`}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <div className="w-6 h-6" aria-hidden="true" />
          )}
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs text-muted-foreground font-medium">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center" role="grid" aria-label={monthLabel}>
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonthDate);
          const isSelected = checkIsSameDay(day, selectedDate);
          const isStart = checkIsSameDay(day, rangeStart);
          const isEnd = checkIsSameDay(day, rangeEnd);
          const isRange = rangeStart && rangeEnd && checkIsInRange(day, rangeStart, rangeEnd);
          const isHoverRange = rangeStart && !rangeEnd && hoverDate && checkIsInRange(day, rangeStart, hoverDate) && day > rangeStart;
          const isToday = checkIsSameDay(day, today);
          const disabled = typeof isDateDisabled === "function" ? isDateDisabled(day) : false;

          let bgClass = '';
          let textClass = isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50';
          let roundedClass = 'rounded';

          if (isSelected || isStart || isEnd) {
            bgClass = 'bg-primary';
            textClass = 'text-primary-foreground font-medium';
            if (isStart && rangeEnd) roundedClass = 'rounded-l-md rounded-r-none';
            if (isEnd && rangeStart) roundedClass = 'rounded-r-md rounded-l-none';
          } else if (isRange || isHoverRange) {
            bgClass = 'bg-primary/20';
            roundedClass = 'rounded-none';
          }

          const dayLabel = format(day, 'MMMM d, yyyy');
          const stateSuffix = isStart ? ", range start" : isEnd ? ", range end" : isSelected ? ", selected" : "";
          const todaySuffix = isToday ? ", today" : "";
          const disabledSuffix = disabled ? ", disabled" : "";

          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              aria-selected={isSelected || isStart || isEnd}
              aria-disabled={disabled || undefined}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${dayLabel}${stateSuffix}${todaySuffix}${disabledSuffix}`}
              disabled={disabled}
              onClick={() => { if (!disabled) onDayClick?.(day); }}
              onKeyDown={(e) => { if (!disabled) handleDayKeyDown(e, day); }}
              onMouseEnter={() => onDayHover?.(day)}
              onFocus={() => onDayHover?.(day)}
              tabIndex={disabled ? -1 : undefined}
              className={`h-8 w-8 text-sm flex items-center justify-center ${bgClass} ${textClass} ${roundedClass} ${isToday && !isSelected && !isStart && !isEnd ? 'border border-primary/50' : ''} ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-inherit' : 'hover:bg-primary/80 hover:text-primary-foreground'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition-colors motion-reduce:transition-none`}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
