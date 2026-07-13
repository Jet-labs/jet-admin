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
}) {
  const days = getCalendarDays(year, month);
  const currentMonthDate = new Date(year, month, 1);
  const today = new Date();

  return (
    <div className="w-[252px]">
      {showNavigation && (
        <div className="flex justify-between items-center mb-4 px-1">
          {!hideLeftArrow ? (
            <button 
              type="button"
              onClick={() => onMonthChange(-1)} 
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-6 h-6" />
          )}
          <div className="font-semibold text-sm">
            {format(currentMonthDate, 'MMMM yyyy')}
          </div>
          {!hideRightArrow ? (
            <button 
              type="button"
              onClick={() => onMonthChange(1)} 
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-6 h-6" />
          )}
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

          return (
            <button
              key={i}
              type="button"
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
