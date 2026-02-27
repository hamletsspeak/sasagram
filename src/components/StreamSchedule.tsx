"use client";

import { useEffect, useMemo, useState } from "react";

interface StreamData {
  isLive: boolean;
  stream: { started_at: string; title: string } | null;
  vods: Array<{ created_at: string; duration: string; title: string; url: string }>;
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

const VIEW_START_MINUTES = 17 * 60;
const VIEW_END_MINUTES = 26 * 60;
const SLOT_MINUTES = 30;
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
      const isLiveToday = Boolean(isToday && liveActualStart && liveActualStart.key === todayKey);
      const dbStream = isFuture ? undefined : dbStreamByDate.get(key);

      let timeRange = "--:-- - --:--";
      let durationLabel = "—";
      let title = "—";
      let streamUrl: string | null = null;
      let startMinutes: number | null = null;
      let endMinutes: number | null = null;
      let isLive = false;

      if (isLiveToday && liveActualStart) {
        timeRange = timeRu(liveActualStart.startedAt);
        durationLabel = "В эфире";
        title = liveActualStart.title || "Прямой эфир";
        streamUrl = "https://www.twitch.tv/sasavot";
        startMinutes = minutesSinceDayStart(liveActualStart.startedAt, current);
        endMinutes = Math.max(startMinutes ?? VIEW_START_MINUTES, minutesSinceDayStart(new Date().toISOString(), current) ?? VIEW_END_MINUTES);
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
        dateLabel: current.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
        timeRange,
        durationLabel,
        title,
        streamUrl,
        isToday,
        isActive: Boolean(dbStream) || isLiveToday,
        isLive,
        startMinutes,
        endMinutes,
      });
    }

    weeks.push({ key: dateKey(weekStart), label: weekLabel(weekStart), cards });
  }

  return weeks;
}

function streamBlockStyle(card: TimelineCard): { left: string; width: string } | null {
  if (card.startMinutes === null) return null;

  const total = VIEW_END_MINUTES - VIEW_START_MINUTES;
  const start = Math.max(VIEW_START_MINUTES, Math.min(VIEW_END_MINUTES, card.startMinutes));
  const rawEnd = card.endMinutes ?? Math.min(VIEW_END_MINUTES, start + 45);
  const end = Math.max(start + 20, Math.max(VIEW_START_MINUTES, Math.min(VIEW_END_MINUTES, rawEnd)));

  const left = ((start - VIEW_START_MINUTES) / total) * 100;
  const width = Math.max(5, ((end - start) / total) * 100);

  return { left: `${left}%`, width: `${width}%` };
}

export default function StreamSchedule() {
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [dbStreams, setDbStreams] = useState<DbStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedWeekKey, setSelectedWeekKey] = useState<string | null>(null);

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
        const [streamRes, dbStreamsRes] = await Promise.all([fetch("/api/twitch"), fetch("/api/streams")]);
        if (!streamRes.ok || !dbStreamsRes.ok) throw new Error("API error");

        const [stream, persisted] = await Promise.all([streamRes.json(), dbStreamsRes.json()]);
        if (!isMounted) return;

        setStreamData(stream as StreamData);
        setDbStreams((persisted as { streams: DbStream[] }).streams ?? []);
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

  const axisTicks = useMemo(() => {
    const ticks: string[] = [];
    for (let m = VIEW_START_MINUTES; m <= VIEW_END_MINUTES; m += SLOT_MINUTES) ticks.push(formatAxis(m));
    return ticks;
  }, []);

  return (
    <section id="schedule" className="py-20 bg-gray-900/70 border-y border-gray-800/60">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Расписание стримов</h2>
          <button
            type="button"
            onClick={() => setSelectedWeekKey(weeks.length > 0 ? weeks[weeks.length - 1].key : null)}
            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-rose-700/90 hover:bg-rose-600 text-white"
          >
            Сегодня
          </button>
        </div>

        {loading ? (
          <div className="h-80 rounded-2xl bg-slate-800/80 animate-pulse" />
        ) : error ? (
          <div className="text-center text-gray-400 text-sm py-8">Не удалось загрузить расписание</div>
        ) : (
          <div className="rounded-2xl border border-slate-700/80 bg-[#0d111c] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700/80 px-4 py-3 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (safeWeekIndex <= 0) return;
                    setSelectedWeekKey(weeks[safeWeekIndex - 1].key);
                  }}
                  disabled={safeWeekIndex === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 text-sm text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (safeWeekIndex >= weeks.length - 1) return;
                    setSelectedWeekKey(weeks[safeWeekIndex + 1].key);
                  }}
                  disabled={safeWeekIndex >= weeks.length - 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 text-sm text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Вперед
                </button>
              </div>
              <p className="text-sm font-semibold text-white">{selectedWeek ? selectedWeek.label : "Неделя"}</p>
            </div>

            <div className="grid grid-cols-[74px_1fr] border-b border-slate-800 bg-slate-900/40">
              <div className="text-xs text-cyan-300 px-3 py-2 border-r border-slate-800">GMT+3</div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${axisTicks.length}, minmax(0, 1fr))` }}>
                {axisTicks.map((label) => (
                  <div key={label} className="text-[11px] text-gray-300 px-2 py-2 border-r border-slate-800/70 last:border-r-0">
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              {(selectedWeek?.cards ?? []).map((item) => {
                const style = streamBlockStyle(item);
                const laneClass = item.isToday ? "bg-slate-800/35" : "bg-[#0b1019]";

                return (
                  <div key={item.key} className={`grid grid-cols-[74px_1fr] min-h-[74px] border-b border-slate-800/70 ${laneClass}`}>
                    <div className="px-3 py-2 border-r border-slate-800 text-center">
                      <p className="text-xs uppercase text-gray-300">{item.dayLabel}</p>
                      <p className="text-xl leading-tight mt-1 text-white">{item.dateLabel.slice(0, 2)}</p>
                      <p className="text-[11px] text-gray-400">{item.dateLabel.slice(3)}</p>
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
                        <div className="h-[58px] rounded-xl border border-dashed border-slate-700/80 flex items-center px-3 text-gray-500 text-sm">--:-- - --:--</div>
                      ) : item.streamUrl ? (
                        <a
                          href={item.streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`absolute top-2 h-[58px] rounded-xl border px-3 py-2 overflow-hidden transition-colors ${item.isToday ? "border-rose-400/50 bg-rose-500/15" : "border-cyan-400/40 bg-cyan-500/10"}`}
                          style={style}
                          title={item.title}
                        >
                          <p className="text-xs font-semibold text-white line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-gray-200 line-clamp-1">{item.timeRange}</p>
                          <p className="text-[11px] text-emerald-300 line-clamp-1">{item.isLive ? "В эфире" : item.durationLabel}</p>
                        </a>
                      ) : (
                        <div
                          className={`absolute top-2 h-[58px] rounded-xl border px-3 py-2 overflow-hidden ${item.isToday ? "border-rose-400/50 bg-rose-500/15" : "border-slate-600 bg-slate-800/70"}`}
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
