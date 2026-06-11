import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";

export function getMonthDays(year: number, month: number) {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  return eachDayOfInterval({ start, end });
}

export function isWeekend(date: Date) {
  const day = getDay(date);
  return day === 0 || day === 6;
}

export function formatMonthYear(date: Date) {
  return format(date, "MMMM yyyy", { locale: es });
}

export function getNextMonth(date: Date) {
  return addMonths(date, 1);
}

export function getPrevMonth(date: Date) {
  return subMonths(date, 1);
}

export function toDateString(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function getDayName(date: Date) {
  return format(date, "EEE", { locale: es });
}
