import { CalendarWeek, DbStream, LiveActualStart, TimelineCard, WeekGroup } from "@/features/schedule/types";
import {
  BASE_VIEW_END_MINUTES,
  VIEW_START_MINUTES,
  WEEKS_COUNT,
  addDays,
  dateKey,
  formatDateDot,
  formatDurationHours,
  minutesSinceDayStart,
  startOfWeek,
  timeRu,
  weekLabel,
} from "@/features/schedule/lib/date";
import { getGlebActivity } from "@/features/schedule/lib/gleb-activities";

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

export function buildWeeks(dbStreams: DbStream[], liveActualStart: LiveActualStart | null): WeekGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = dateKey(today);

  const dbStreamByDate = new Map<string, DbStream>();
  for (const stream of dbStreams) {
    const startedAt = new Date(stream.started_at);
    if (Number.isNaN(startedAt.getTime())) continue;
    if (startedAt > now) continue;

    const key = dateKey(startedAt);
    const existing = dbStreamByDate.get(key);
    if (!existing || new Date(existing.started_at).getTime() < startedAt.getTime()) {
      dbStreamByDate.set(key, stream);
    }
  }

  const currentWeekStart = startOfWeek(today);
  const weeks: WeekGroup[] = [];

  for (let weekOffset = WEEKS_COUNT - 1; weekOffset >= 0; weekOffset -= 1) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - weekOffset * 7);

    const cards: TimelineCard[] = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const current = new Date(weekStart);
      current.setDate(weekStart.getDate() + dayOffset);

      const key = dateKey(current);
      const isToday = key === todayKey;
      const isFuture = current > today;
      const isLiveForDate = Boolean(liveActualStart && liveActualStart.key === key);
      const dbStream = isFuture ? undefined : dbStreamByDate.get(key);
      const isPendingToday = isToday && !isLiveForDate && !dbStream;

      let timeRange = "";
      let durationLabel = "—";
      let title = "";
      let streamUrl: string | null = null;
      let startMinutes: number | null = null;
      let endMinutes: number | null = null;
      let isLive = false;
      let ratingAvg: number | null = null;
      let ratingCount = 0;

      if (isLiveForDate && liveActualStart) {
        timeRange = timeRu(liveActualStart.startedAt);
        durationLabel = "В эфире";
        title = liveActualStart.title || "Прямой эфир";
        streamUrl = "https://www.twitch.tv/sasavot";
        startMinutes = minutesSinceDayStart(liveActualStart.startedAt, current);
        endMinutes = Math.max(
          startMinutes ?? VIEW_START_MINUTES,
          minutesSinceDayStart(new Date().toISOString(), current) ?? BASE_VIEW_END_MINUTES
        );
        isLive = true;
        if (dbStream) {
          ratingAvg = typeof dbStream.ratingAvg === "number" ? dbStream.ratingAvg : null;
          ratingCount = typeof dbStream.ratingCount === "number" ? dbStream.ratingCount : 0;
        }
      } else if (dbStream) {
        const durationHours = Number(dbStream.duration_hours);
        const hasDuration = Number.isFinite(durationHours) && durationHours > 0;
        const endAt = hasDuration ? new Date(new Date(dbStream.started_at).getTime() + durationHours * 3600000).toISOString() : null;

        if (hasDuration && endAt) {
          timeRange = `${timeRu(dbStream.started_at)} - ${timeRu(endAt)}`;
          durationLabel = formatDurationHours(durationHours);
        } else {
          timeRange = timeRu(dbStream.started_at);
          durationLabel = "Длительность неизвестна";
        }

        title = dbStream.title?.trim() || "Без названия";
        streamUrl = dbStream.stream_url?.trim() || null;
        startMinutes = minutesSinceDayStart(dbStream.started_at, current);
        endMinutes = endAt ? minutesSinceDayStart(endAt, current) : null;
        ratingAvg = typeof dbStream.ratingAvg === "number" ? dbStream.ratingAvg : null;
        ratingCount = typeof dbStream.ratingCount === "number" ? dbStream.ratingCount : 0;
      } else if (isPendingToday) {
        title = "Стрим еще не начался";
        timeRange = "До конца дня";
      } else if (!isFuture) {
        title = getGlebActivity(key);
        timeRange = "Стрима не было";
      }

      cards.push({
        key,
        dayLabel: current.toLocaleDateString("ru-RU", { weekday: "short" }).replace(".", ""),
        dateLabel: formatDateDot(current),
        timeRange,
        durationLabel,
        title,
        streamUrl,
        isToday,
        isFuture,
        isPendingToday,
        isActive: Boolean(dbStream) || isLiveForDate,
        isLive,
        startMinutes,
        endMinutes,
        ratingAvg,
        ratingCount,
      });
    }

    weeks.push({ key: dateKey(weekStart), label: weekLabel(weekStart), cards });
  }

  return weeks;
}

export function streamBlockStyle(
  card: TimelineCard,
  viewStartMinutes: number,
  viewEndMinutes: number
): { left: string; width: string } | null {
  if (card.startMinutes === null) return null;

  const total = viewEndMinutes - viewStartMinutes;
  const start = Math.max(viewStartMinutes, Math.min(viewEndMinutes, card.startMinutes));
  const rawEnd = card.endMinutes ?? Math.min(viewEndMinutes, start + 45);
  const end = Math.max(start + 20, Math.max(viewStartMinutes, Math.min(viewEndMinutes, rawEnd)));

  const left = ((start - viewStartMinutes) / total) * 100;
  const width = Math.max(5, ((end - start) / total) * 100);

  return { left: `${left}%`, width: `${width}%` };
}
