import { RatedStream } from "@/features/ratings/types";
import { CalendarWeek } from "@/features/schedule/types";
import { addDays, dateKey, startOfWeek, weekLabel } from "@/features/schedule/lib/date";

export interface RatingWeekGroup {
  key: string;
  label: string;
  streams: RatedStream[];
}

export function buildRatingWeeks(streams: RatedStream[]): RatingWeekGroup[] {
  const grouped = new Map<string, RatedStream[]>();

  for (const stream of streams) {
    const startedAt = new Date(stream.started_at);
    if (Number.isNaN(startedAt.getTime())) continue;

    const weekStart = startOfWeek(startedAt);
    const key = dateKey(weekStart);
    const current = grouped.get(key) ?? [];
    current.push(stream);
    grouped.set(key, current);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, weekStreams]) => ({
      key,
      label: weekLabel(new Date(`${key}T00:00:00`)),
      streams: [...weekStreams].sort(
        (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      ),
    }));
}

export function buildCalendarWeeks(monthStart: Date): CalendarWeek[] {
  const firstDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const gridStart = startOfWeek(firstDay);
  const month = monthStart.getMonth();
  const weeks: CalendarWeek[] = [];

  for (let weekOffset = 0; weekOffset < 6; weekOffset += 1) {
    const weekStart = addDays(gridStart, weekOffset * 7);
    const days = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const day = addDays(weekStart, dayOffset);
      days.push({ key: dateKey(day), label: day.getDate(), inMonth: day.getMonth() === month });
    }

    weeks.push({ key: dateKey(weekStart), days });
  }

  return weeks;
}
