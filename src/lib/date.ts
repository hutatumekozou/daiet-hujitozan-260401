import {
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ja } from "date-fns/locale";

export function normalizeDate(date: Date) {
  return startOfDay(date);
}

export function today() {
  return normalizeDate(new Date());
}

export function parseDayString(value?: string | null) {
  if (!value) {
    return today();
  }

  return normalizeDate(parseISO(value));
}

export function formatDate(value: Date, pattern = "M/d(E)") {
  return format(value, pattern, { locale: ja });
}

export function formatDayKey(value: Date) {
  return format(value, "yyyy-MM-dd");
}

export function isSameDate(left: Date, right: Date) {
  return isSameDay(left, right);
}

export function weekStart(value: Date) {
  return startOfWeek(value, { weekStartsOn: 1 });
}
