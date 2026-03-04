export const VIEW_START_MINUTES = 17 * 60;
export const BASE_VIEW_END_MINUTES = 26 * 60;
export const MAX_VIEW_END_MINUTES = 36 * 60;
export const SLOT_MINUTES = 60;
export const WEEKS_COUNT = 12;

export function dateKey(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function startOfWeek(date: Date): Date {
  const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - day);
  return weekStart;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function parseTwitchDurationToHours(raw: string): number {
  const hours = Number(raw.match(/(\d+)h/)?.[1] ?? 0);
  const minutes = Number(raw.match(/(\d+)m/)?.[1] ?? 0);
  const seconds = Number(raw.match(/(\d+)s/)?.[1] ?? 0);
  return Math.round((hours + minutes / 60 + seconds / 3600) * 100) / 100;
}

export function elapsedHours(isoDate: string): number {
  const startedAt = new Date(isoDate).getTime();
  if (Number.isNaN(startedAt)) return 0;
  const diffMs = Math.max(0, Date.now() - startedAt);
  return Math.round((diffMs / 3600000) * 100) / 100;
}

export function formatDurationHours(hoursTotal: number): string {
  const totalMinutes = Math.max(0, Math.round(hoursTotal * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}м`;
  if (minutes === 0) return `${hours}ч`;
  return `${hours}ч ${minutes}м`;
}

export function timeRu(dateInput: string): string {
  return new Date(dateInput).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function weekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return `${weekStart.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })} - ${weekEnd.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}`;
}

export function formatDateDot(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabelRu(monthStart: Date): string {
  return monthStart.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

export function minutesSinceDayStart(dateInput: string, day: Date): number | null {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  return Math.round((date.getTime() - dayStart.getTime()) / 60000);
}

export function formatAxis(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
