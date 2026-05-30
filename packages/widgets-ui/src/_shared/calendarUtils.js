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
