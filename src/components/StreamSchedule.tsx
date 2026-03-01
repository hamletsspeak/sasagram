"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchJsonWithCache } from "@/lib/client-api-cache";

interface StreamData {
  isLive: boolean;
  stream: { started_at: string; title: string } | null;
  vods: Array<{ created_at: string; duration: string; title: string; url: string }>;
}

interface StreamsResponse {
  streams?: DbStream[];
}

interface DbStream {
  id: string;
  started_at: string;
  duration_hours: string | number;
  title: string | null;
  stream_url: string | null;
  created_at: string;
}

interface TimelineCard {
  key: string;
  dayLabel: string;
  dateLabel: string;
  timeRange: string;
  durationLabel: string;
  title: string;
  streamUrl: string | null;
  isToday: boolean;
  isActive: boolean;
  isLive: boolean;
  startMinutes: number | null;
  endMinutes: number | null;
}

interface WeekGroup {
  key: string;
  label: string;
  cards: TimelineCard[];
}

interface CalendarDay {
  key: string;
  label: number;
  inMonth: boolean;
}

interface CalendarWeek {
  key: string;
  days: CalendarDay[];
}

const VIEW_START_MINUTES = 17 * 60;
const BASE_VIEW_END_MINUTES = 26 * 60;
const MAX_VIEW_END_MINUTES = 36 * 60;
const SLOT_MINUTES = 60;
const WEEKS_COUNT = 12;

function dateKey(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function startOfWeek(date: Date): Date {
  const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - day);
  return weekStart;
}

function parseTwitchDurationToHours(raw: string): number {
  const hours = Number(raw.match(/(\d+)h/)?.[1] ?? 0);
  const minutes = Number(raw.match(/(\d+)m/)?.[1] ?? 0);
  const seconds = Number(raw.match(/(\d+)s/)?.[1] ?? 0);
  return Math.round((hours + minutes / 60 + seconds / 3600) * 100) / 100;
}

function elapsedHours(isoDate: string): number {
  const startedAt = new Date(isoDate).getTime();
  if (Number.isNaN(startedAt)) return 0;
  const diffMs = Math.max(0, Date.now() - startedAt);
  return Math.round((diffMs / 3600000) * 100) / 100;
}

function formatDurationHours(hoursTotal: number): string {
  const totalMinutes = Math.max(0, Math.round(hoursTotal * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}м`;
  if (minutes === 0) return `${hours}ч`;
  return `${hours}ч ${minutes}м`;
}

function timeRu(dateInput: string): string {
  return new Date(dateInput).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function weekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return `${weekStart.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })} - ${weekEnd.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}`;
}

function formatDateDot(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabelRu(monthStart: Date): string {
  return monthStart.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildCalendarWeeks(monthStart: Date): CalendarWeek[] {
  const firstDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const gridStart = startOfWeek(firstDay);
  const month = monthStart.getMonth();
  const weeks: CalendarWeek[] = [];

  for (let weekOffset = 0; weekOffset < 6; weekOffset += 1) {
    const weekStart = addDays(gridStart, weekOffset * 7);
    const days: CalendarDay[] = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const day = addDays(weekStart, dayOffset);
      days.push({ key: dateKey(day), label: day.getDate(), inMonth: day.getMonth() === month });
    }

    weeks.push({ key: dateKey(weekStart), days });
  }

  return weeks;
}

function minutesSinceDayStart(dateInput: string, day: Date): number | null {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  return Math.round((date.getTime() - dayStart.getTime()) / 60000);
}

function formatAxis(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildWeeks(dbStreams: DbStream[], liveActualStart: { key: string; startedAt: string; title: string } | null): WeekGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = dateKey(today);

  const dbStreamByDate = new Map<string, DbStream>();
  for (const stream of dbStreams) {
    const startedAt = new Date(stream.started_at);
    if (Number.isNaN(startedAt.getTime())) continue;
    if (startedAt > today) continue;

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

      let timeRange = "--:-- - --:--";
      let durationLabel = "—";
      let title = "—";
      let streamUrl: string | null = null;
      let startMinutes: number | null = null;
      let endMinutes: number | null = null;
      let isLive = false;

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
      } else if (dbStream) {
        const durationHours = Number(dbStream.duration_hours);
        const hasDuration = Number.isFinite(durationHours) && durationHours > 0;
        const endAt = hasDuration ? new Date(new Date(dbStream.started_at).getTime() + durationHours * 3600000).toISOString() : null;

        if (hasDuration && endAt) {
          timeRange = `${timeRu(dbStream.started_at)} - ${timeRu(endAt)}`;
          durationLabel = `Шел ${formatDurationHours(durationHours)}`;
        } else {
          timeRange = timeRu(dbStream.started_at);
          durationLabel = "Длительность неизвестна";
        }

        title = dbStream.title?.trim() || "Без названия";
        streamUrl = dbStream.stream_url?.trim() || null;
        startMinutes = minutesSinceDayStart(dbStream.started_at, current);
        endMinutes = endAt ? minutesSinceDayStart(endAt, current) : null;
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
        isActive: Boolean(dbStream) || isLiveForDate,
        isLive,
        startMinutes,
        endMinutes,
      });
    }

    weeks.push({ key: dateKey(weekStart), label: weekLabel(weekStart), cards });
  }

  return weeks;
}

function streamBlockStyle(card: TimelineCard, viewStartMinutes: number, viewEndMinutes: number): { left: string; width: string } | null {
  if (card.startMinutes === null) return null;

  const total = viewEndMinutes - viewStartMinutes;
  const start = Math.max(viewStartMinutes, Math.min(viewEndMinutes, card.startMinutes));
  const rawEnd = card.endMinutes ?? Math.min(viewEndMinutes, start + 45);
  const end = Math.max(start + 20, Math.max(viewStartMinutes, Math.min(viewEndMinutes, rawEnd)));

  const left = ((start - viewStartMinutes) / total) * 100;
  const width = Math.max(5, ((end - start) / total) * 100);

  return { left: `${left}%`, width: `${width}%` };
}

export default function StreamSchedule() {
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [dbStreams, setDbStreams] = useState<DbStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedWeekKey, setSelectedWeekKey] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hoveredWeekKey, setHoveredWeekKey] = useState<string | null>(null);
  const [calendarMonthStart, setCalendarMonthStart] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const mergeDbStream = (incoming: DbStream) => {
    setDbStreams((prev) => {
      const next = [...prev];
      const index = next.findIndex((item) => item.started_at === incoming.started_at);
      if (index >= 0) next[index] = incoming;
      else next.push(incoming);
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [stream, persisted] = await Promise.all([
          fetchJsonWithCache<StreamData>("api:twitch", "/api/twitch", { ttlMs: 45_000 }),
          fetchJsonWithCache<StreamsResponse>("api:streams", "/api/streams", { ttlMs: 45_000 }),
        ]);
        if (!isMounted) return;

        setStreamData(stream);
        setDbStreams(persisted.streams ?? []);
        setError(false);
        setLoading(false);
      } catch {
        if (!isMounted) return;
        setError(true);
        setLoading(false);
      }
    };

    loadData();
    const intervalId = window.setInterval(loadData, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const liveActualStart = useMemo(() => {
    if (!streamData?.isLive || !streamData.stream?.started_at) return null;
    const startedAt = new Date(streamData.stream.started_at);
    return { key: dateKey(startedAt), startedAt: streamData.stream.started_at, title: streamData.stream.title || "Прямой эфир" };
  }, [streamData]);

  useEffect(() => {
    if (!liveActualStart) return;

    let isMounted = true;
    const syncLiveDuration = async () => {
      const durationHours = elapsedHours(liveActualStart.startedAt);
      const response = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startedAt: liveActualStart.startedAt, durationHours, title: liveActualStart.title, streamUrl: "https://www.twitch.tv/sasavot" }),
      });

      if (!response.ok) throw new Error("Не удалось сохранить активный стрим");
      const payload = (await response.json()) as { stream: DbStream };
      if (isMounted) mergeDbStream(payload.stream);
    };

    syncLiveDuration().catch(() => {});
    const intervalId = window.setInterval(() => {
      syncLiveDuration().catch(() => {});
    }, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [liveActualStart]);

  const vodSyncKey = useMemo(() => (streamData?.vods ?? []).map((vod) => `${vod.created_at}|${vod.url}`).join(";"), [streamData?.vods]);

  useEffect(() => {
    if (!streamData?.vods?.length) return;

    const syncVods = async () => {
      const responses = await Promise.allSettled(
        streamData.vods.map((vod) =>
          fetch("/api/streams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startedAt: vod.created_at, durationHours: parseTwitchDurationToHours(vod.duration), title: vod.title, streamUrl: vod.url }),
          })
        )
      );

      for (const item of responses) {
        if (item.status !== "fulfilled" || !item.value.ok) continue;
        const payload = (await item.value.json()) as { stream: DbStream };
        mergeDbStream(payload.stream);
      }
    };

    syncVods().catch(() => {});
  }, [streamData, vodSyncKey]);

  const weeks = useMemo(() => buildWeeks(dbStreams, liveActualStart), [dbStreams, liveActualStart]);
  const selectedWeekIndex = selectedWeekKey ? weeks.findIndex((week) => week.key === selectedWeekKey) : weeks.length - 1;
  const safeWeekIndex = selectedWeekIndex >= 0 ? selectedWeekIndex : Math.max(weeks.length - 1, 0);
  const selectedWeek = weeks[safeWeekIndex] ?? null;
  const selectedWeekRangeLabel = selectedWeek?.key
    ? (() => {
        const start = new Date(`${selectedWeek.key}T00:00:00`);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `${formatDateDot(start)} - ${formatDateDot(end)}`;
      })()
    : monthLabelRu(calendarMonthStart);
  const calendarTodayKey = dateKey(new Date());
  const weekPickerMin = weeks[0]?.key;
  const weekPickerMax = weeks[weeks.length - 1]?.key;
  const availableWeekKeys = useMemo(() => new Set(weeks.map((week) => week.key)), [weeks]);
  const calendarWeeks = useMemo(() => buildCalendarWeeks(calendarMonthStart), [calendarMonthStart]);

  const viewEndMinutes = useMemo(() => {
    const cards = selectedWeek?.cards ?? [];
    let latestEnd = BASE_VIEW_END_MINUTES;

    for (const card of cards) {
      const candidateEnd = card.endMinutes ?? (card.startMinutes !== null ? card.startMinutes + 120 : null);
      if (candidateEnd !== null) {
        latestEnd = Math.max(latestEnd, candidateEnd);
      }
    }

    const roundedWithBuffer = Math.ceil((latestEnd + 30) / 60) * 60;
    return Math.min(MAX_VIEW_END_MINUTES, Math.max(BASE_VIEW_END_MINUTES, roundedWithBuffer));
  }, [selectedWeek]);

  useEffect(() => {
    if (!calendarOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setCalendarOpen(false);
        setHoveredWeekKey(null);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [calendarOpen]);

  const axisTicks = useMemo(() => {
    const ticks: string[] = [];
    for (let m = VIEW_START_MINUTES; m <= viewEndMinutes; m += SLOT_MINUTES) ticks.push(formatAxis(m));
    return ticks;
  }, [viewEndMinutes]);

  return (
    <section id="schedule" className="min-h-screen py-20 bg-black/35 border-y border-red-950/35">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Расписание стримов</h2>
        </div>

        {loading ? (
          <div className="h-80 rounded-2xl bg-zinc-900/80 animate-pulse" />
        ) : error ? (
          <div className="text-center text-gray-400 text-sm py-8">Не удалось загрузить расписание</div>
        ) : (
          <div className="rounded-2xl border border-red-950/45 bg-[#09090b] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between border-b border-red-950/45 px-4 py-3 bg-zinc-950/80 gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (safeWeekIndex <= 0) return;
                    setSelectedWeekKey(weeks[safeWeekIndex - 1].key);
                  }}
                  disabled={safeWeekIndex === 0}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700/90 bg-zinc-900/75 text-gray-200 shadow-[0_2px_0_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 hover:border-red-500/65 hover:bg-red-900/20 hover:text-red-200 hover:shadow-[0_8px_16px_-8px_rgba(200,38,67,0.55)] active:translate-y-px active:shadow-[0_1px_0_rgba(15,23,42,0.55)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:translate-y-0 disabled:hover:border-zinc-700/90 disabled:hover:bg-zinc-900/75 disabled:hover:text-gray-200"
                  aria-label="Предыдущая неделя"
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                    <path d="M11.5 4.5 6 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (safeWeekIndex >= weeks.length - 1) return;
                    setSelectedWeekKey(weeks[safeWeekIndex + 1].key);
                  }}
                  disabled={safeWeekIndex >= weeks.length - 1}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700/90 bg-zinc-900/75 text-gray-200 shadow-[0_2px_0_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 hover:border-red-500/65 hover:bg-red-900/20 hover:text-red-200 hover:shadow-[0_8px_16px_-8px_rgba(200,38,67,0.55)] active:translate-y-px active:shadow-[0_1px_0_rgba(15,23,42,0.55)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:translate-y-0 disabled:hover:border-zinc-700/90 disabled:hover:bg-zinc-900/75 disabled:hover:text-gray-200"
                  aria-label="Следующая неделя"
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                    <path d="M8.5 4.5 14 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div ref={calendarRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCalendarOpen((prev) => !prev)}
                    className="flex h-9 min-w-[168px] items-center justify-between rounded-xl border border-zinc-700/90 bg-zinc-900/75 px-3 text-sm text-gray-100 transition-colors hover:border-red-500/65 hover:bg-zinc-900"
                    aria-expanded={calendarOpen}
                    aria-label="Открыть календарь недель"
                  >
                    <span>{selectedWeekRangeLabel}</span>
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`h-4 w-4 transition-transform ${calendarOpen ? "rotate-180" : ""}`}>
                      <path d="m5.5 7.5 4.5 5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {calendarOpen ? (
                    <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[286px] rounded-2xl border border-red-950/45 bg-[#141116] p-3 shadow-2xl">
                      <div className="mb-3 flex items-center justify-between text-white">
                        <p className="text-2xl font-semibold capitalize">{monthLabelRu(calendarMonthStart)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCalendarMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-red-900/20 hover:text-white"
                            aria-label="Предыдущий месяц"
                          >
                            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                              <path d="M11.5 4.5 6 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCalendarMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-red-900/20 hover:text-white"
                            aria-label="Следующий месяц"
                          >
                            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                              <path d="M8.5 4.5 14 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mb-2 grid grid-cols-7 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-300/80">
                        {[
                          "пн",
                          "вт",
                          "ср",
                          "чт",
                          "пт",
                          "сб",
                          "вс",
                        ].map((weekday) => (
                          <span key={weekday} className="py-1 text-center">
                            {weekday}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-1" onMouseLeave={() => setHoveredWeekKey(null)}>
                        {calendarWeeks.map((week) => {
                          const isSelected = selectedWeek?.key === week.key;
                          const isHovered = hoveredWeekKey === week.key;
                          const isSelectable = availableWeekKeys.has(week.key) && (!weekPickerMin || week.key >= weekPickerMin) && (!weekPickerMax || week.key <= weekPickerMax);

                          return (
                            <div
                              key={week.key}
                              onMouseEnter={() => {
                                if (!isSelectable) return;
                                setHoveredWeekKey(week.key);
                              }}
                              className={`grid grid-cols-7 rounded-full px-2 py-1 transition-colors ${
                                isSelected
                                  ? "bg-red-900/55"
                                  : isHovered && isSelectable
                                    ? "bg-red-950/65"
                                    : "bg-transparent"
                              } ${isSelectable ? "cursor-pointer" : "opacity-35"}`}
                            >
                              {week.days.map((day) => {
                                const isTodayDay = day.key === calendarTodayKey;
                                return (
                                  <button
                                    key={day.key}
                                    type="button"
                                    disabled={!isSelectable}
                                    onClick={() => {
                                      if (!isSelectable) return;
                                      setSelectedWeekKey(week.key);
                                      setCalendarOpen(false);
                                      setHoveredWeekKey(null);
                                    }}
                                    className={`h-8 w-8 justify-self-center rounded-full text-sm transition-colors ${
                                      day.inMonth ? "text-white" : "text-zinc-500"
                                    } ${!isSelectable ? "cursor-not-allowed" : "hover:text-white"} ${
                                      isTodayDay ? "ring-1 ring-red-400/70 bg-red-900/25 font-semibold" : ""
                                    }`}
                                  >
                                    {day.label}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWeekKey(weeks.length > 0 ? weeks[weeks.length - 1].key : null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-rose-700/90 hover:bg-rose-600 text-white"
                >
                  Сегодня
                </button>
              </div>
            </div>

              <div className="grid grid-cols-[74px_1fr] border-b border-red-950/45 bg-zinc-950/50">
                <div className="text-xs text-red-300 px-3 py-2 border-r border-red-950/40">GMT+3</div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.max(axisTicks.length - 1, 1)}, minmax(0, 1fr))` }}>
                  {axisTicks.slice(0, -1).map((label) => (
                    <div
                      key={label}
                      className="text-[11px] text-gray-300 px-2 py-2 border-r border-red-950/35 last:border-r-0 transition-colors hover:bg-red-950/35 hover:text-white"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

            <div>
              {(selectedWeek?.cards ?? []).map((item) => {
                const style = streamBlockStyle(item, VIEW_START_MINUTES, viewEndMinutes);
                const laneClass = item.isToday ? "bg-zinc-900/45" : "bg-[#09090b]";

                return (
                  <div key={item.key} className={`grid grid-cols-[74px_1fr] min-h-[74px] border-b border-red-950/35 transition-colors hover:bg-zinc-900/70 ${laneClass}`}>
                    <div className="px-3 py-2 border-r border-red-950/40 text-center">
                      <p className="text-xs uppercase text-gray-300">{item.dayLabel}</p>
                      <p className="text-base leading-tight mt-2 text-white">{item.dateLabel}</p>
                    </div>

                    <div className="relative px-2 py-2">
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px)",
                          backgroundSize: `calc(100% / ${axisTicks.length - 1}) 100%`,
                        }}
                      />
                      {!style ? (
                        <div className="h-[58px] rounded-xl border border-dashed border-zinc-700/70 flex items-center px-3 text-gray-500 text-sm">--:-- - --:--</div>
                      ) : item.streamUrl ? (
                        <a
                          href={item.streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`absolute top-2 h-[58px] rounded-xl border px-3 py-2 overflow-hidden transition-colors ${
                            item.isLive
                              ? "border-rose-400/55 bg-rose-900/30"
                              : "border-zinc-500/60 bg-zinc-800/70"
                          }`}
                          style={style}
                          title={item.title}
                        >
                          {item.isLive ? (
                            <>
                              <div
                                className="pointer-events-none absolute inset-0 rounded-xl"
                                style={{
                                  backgroundImage: "linear-gradient(110deg, rgba(244,63,94,0.14) 0%, rgba(251,113,133,0.34) 35%, rgba(244,63,94,0.14) 70%)",
                                  backgroundSize: "220% 220%",
                                  animation: "liveShimmer 3.2s ease-in-out infinite alternate",
                                }}
                              />
                              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/8 via-rose-400/18 to-red-500/8" style={{ animation: "liveBreath 2.8s ease-in-out infinite" }} />
                            </>
                          ) : null}
                          <p className="text-xs font-semibold text-white line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-gray-200 line-clamp-1">{item.timeRange}</p>
                          <p className={`text-[11px] line-clamp-1 ${item.isLive ? "text-red-300" : "text-emerald-300"}`}>
                            {item.isLive ? "В эфире" : item.durationLabel}
                          </p>
                        </a>
                      ) : (
                        <div
                          className={`absolute top-2 h-[58px] rounded-xl border px-3 py-2 overflow-hidden ${
                            item.isLive
                              ? "border-rose-400/55 bg-rose-900/30"
                              : "border-zinc-600/70 bg-zinc-800/70"
                          }`}
                          style={style}
                        >
                          <p className="text-xs font-semibold text-white line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-gray-200 line-clamp-1">{item.timeRange}</p>
                          <p className="text-[11px] text-emerald-300 line-clamp-1">{item.isLive ? "В эфире" : item.durationLabel}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

