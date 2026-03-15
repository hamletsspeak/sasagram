"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RatingCard } from "@/features/ratings/components/RatingCard";
import { fetchRatedStreams, submitStreamRating } from "@/features/ratings/lib/api";
import { RatedStream } from "@/features/ratings/types";
import { buildCalendarWeeks, buildRatingWeeks } from "@/features/ratings/lib/build-rating-weeks";
import { WeekPicker } from "@/features/schedule/components/WeekPicker";
import { dateKey, monthLabelRu } from "@/features/schedule/lib/date";
import { fetchJsonWithCache } from "@/lib/client-api-cache";

type SubmitState = {
  pendingStreamId: string | null;
  messages: Record<string, string>;
};

type TwitchLiveStatePayload = {
  isLive?: boolean;
  stream?: {
    started_at?: string;
  } | null;
};

export function StreamRatingsPage() {
  const [topBarVisible, setTopBarVisible] = useState(false);
  const [streams, setStreams] = useState<RatedStream[]>([]);
  const [liveStreamStartedAt, setLiveStreamStartedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ pendingStreamId: null, messages: {} });
  const [selectedWeekKey, setSelectedWeekKey] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hoveredWeekKey, setHoveredWeekKey] = useState<string | null>(null);
  const [calendarMonthStart, setCalendarMonthStart] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTopBarVisible(true);
    }, 780);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [payload, liveState] = await Promise.all([
          fetchRatedStreams(),
          fetchJsonWithCache<TwitchLiveStatePayload>("api:twitch-live-state-rating", "/api/twitch", { ttlMs: 30_000 }).catch(() => null),
        ]);
        if (cancelled) return;
        setStreams(payload.streams);
        if (liveState?.isLive && liveState.stream?.started_at) {
          setLiveStreamStartedAt(liveState.stream.started_at);
        } else {
          setLiveStreamStartedAt(null);
        }
        const weeks = buildRatingWeeks(payload.streams);
        const latestWeekKey = weeks[weeks.length - 1]?.key ?? null;
        setSelectedWeekKey((current) => current ?? latestWeekKey);
        if (latestWeekKey) {
          const latestWeekStart = new Date(`${latestWeekKey}T00:00:00`);
          setCalendarMonthStart(new Date(latestWeekStart.getFullYear(), latestWeekStart.getMonth(), 1));
        }
        setError(null);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить список стримов");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const weeks = useMemo(() => buildRatingWeeks(streams), [streams]);
  const selectedWeekIndex = selectedWeekKey ? weeks.findIndex((week) => week.key === selectedWeekKey) : weeks.length - 1;
  const safeWeekIndex = selectedWeekIndex >= 0 ? selectedWeekIndex : Math.max(weeks.length - 1, 0);
  const selectedWeek = weeks[safeWeekIndex] ?? null;
  const selectedWeekRangeLabel = selectedWeek?.label ?? monthLabelRu(calendarMonthStart);
  const availableWeekKeys = useMemo(() => new Set(weeks.map((week) => week.key)), [weeks]);
  const calendarWeeks = useMemo(() => buildCalendarWeeks(calendarMonthStart), [calendarMonthStart]);
  const calendarTodayKey = dateKey(new Date());
  const weekPickerMin = weeks[0]?.key;
  const weekPickerMax = weeks[weeks.length - 1]?.key;

  const syncCalendarMonthToSelectedWeek = () => {
    if (!selectedWeek?.key) {
      return;
    }

    const selectedWeekStart = new Date(`${selectedWeek.key}T00:00:00`);
    setCalendarMonthStart(new Date(selectedWeekStart.getFullYear(), selectedWeekStart.getMonth(), 1));
  };

  const handleRate = async (streamId: string, rating: number) => {
    setSubmitState((current) => ({
      pendingStreamId: streamId,
      messages: { ...current.messages, [streamId]: "Отправляем оценку..." },
    }));

    try {
      const payload = await submitStreamRating(streamId, rating);
      setStreams((current) =>
        current.map((stream) =>
          stream.id === streamId
            ? {
                ...stream,
                ratingAvg: payload.ratingAvg,
                ratingCount: payload.ratingCount,
                myRating: payload.myRating,
              }
            : stream
        )
      );
      setSubmitState((current) => ({
        pendingStreamId: null,
        messages: { ...current.messages, [streamId]: "Голос принят. Повторное изменение отключено." },
      }));
    } catch (submitError: unknown) {
      const maybePayload = submitError as { code?: string; payload?: { ratingAvg: number | null; ratingCount: number; myRating: number | null; error?: string } };

      if (maybePayload.code === "ALREADY_RATED" && maybePayload.payload) {
        setStreams((current) =>
          current.map((stream) =>
            stream.id === streamId
              ? {
                  ...stream,
                  ratingAvg: maybePayload.payload?.ratingAvg ?? stream.ratingAvg,
                  ratingCount: maybePayload.payload?.ratingCount ?? stream.ratingCount,
                  myRating: maybePayload.payload?.myRating ?? stream.myRating,
                }
              : stream
          )
        );
        setSubmitState((current) => ({
          pendingStreamId: null,
          messages: {
            ...current.messages,
            [streamId]: maybePayload.payload?.error ?? "Этот браузер уже проголосовал за этот стрим.",
          },
        }));
        return;
      }

      setSubmitState((current) => ({
        pendingStreamId: null,
        messages: {
          ...current.messages,
          [streamId]: submitError instanceof Error ? submitError.message : "Не удалось отправить оценку",
        },
      }));
    }
  };

  return (
    <section id="rating" className="relative flex h-full flex-col overflow-hidden bg-transparent">
      <div
        className={`relative z-10 w-full border-y border-white/12 bg-black/82 px-[12px] py-3 shadow-[0_12px_30px_rgba(0,0,0,0.32)] transition-all duration-[900ms] ease-out will-change-transform ${
          topBarVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <h2 className="font-fontick text-2xl font-bold text-white md:text-3xl">Оценка стримов</h2>
          <a
            href="/schedule"
            className="inline-flex items-center rounded-full border border-red-500/80 bg-black/85 px-4 py-2 text-sm font-bold text-red-200 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition hover:border-red-400 hover:bg-red-700/85 hover:text-white"
          >
            К расписанию
          </a>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 w-full flex-col">
        {loading ? (
          <div className="h-full space-y-3 border-y border-white/10 p-4">
            <div className="h-10 w-72 animate-pulse bg-zinc-700/70" />
            <div className="h-[calc(100%-3.25rem)] animate-pulse bg-zinc-800/80" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center border-y border-red-400/30 px-4 text-sm text-red-100">
            {error}
          </div>
        ) : streams.length === 0 ? (
          <div className="flex h-full items-center justify-center border-y border-white/10 px-4 text-sm text-zinc-300">
            Для оценки пока нет сохраненных стримов.
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col overflow-hidden border-y border-white/10 bg-[linear-gradient(180deg,rgba(15,15,18,0.86),rgba(8,8,11,0.92))]">
            <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(24,24,27,0.9),rgba(12,12,14,0.9))] px-[12px] py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (safeWeekIndex <= 0) return;
                      setSelectedWeekKey(weeks[safeWeekIndex - 1].key);
                    }}
                    disabled={safeWeekIndex === 0}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/90 bg-zinc-900/75 text-gray-200 transition hover:border-red-500/65 hover:text-red-200 disabled:opacity-40"
                    aria-label="Предыдущая неделя"
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                      <path d="M11.5 4.5 6 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <WeekPicker
                    calendarRef={calendarRef}
                    calendarOpen={calendarOpen}
                    calendarMonthStart={calendarMonthStart}
                    calendarWeeks={calendarWeeks}
                    selectedWeek={selectedWeek ? { ...selectedWeek, cards: [] } : null}
                    selectedWeekRangeLabel={selectedWeekRangeLabel}
                    calendarTodayKey={calendarTodayKey}
                    hoveredWeekKey={hoveredWeekKey}
                    availableWeekKeys={availableWeekKeys}
                    weekPickerMin={weekPickerMin}
                    weekPickerMax={weekPickerMax}
                    onToggle={() =>
                      setCalendarOpen((prev) => {
                        if (!prev) {
                          syncCalendarMonthToSelectedWeek();
                        }
                        return !prev;
                      })
                    }
                    onPrevMonth={() => setCalendarMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    onNextMonth={() => setCalendarMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    onHoverWeek={setHoveredWeekKey}
                    onSelectWeek={(key) => {
                      setSelectedWeekKey(key);
                      setCalendarOpen(false);
                      setHoveredWeekKey(null);
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (safeWeekIndex >= weeks.length - 1) return;
                      setSelectedWeekKey(weeks[safeWeekIndex + 1].key);
                    }}
                    disabled={safeWeekIndex >= weeks.length - 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/90 bg-zinc-900/75 text-gray-200 transition hover:border-red-500/65 hover:text-red-200 disabled:opacity-40"
                    aria-label="Следующая неделя"
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                      <path d="M8.5 4.5 14 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (weeks.length === 0) return;
                      setSelectedWeekKey(weeks[weeks.length - 1].key);
                    }}
                    className="rounded-full bg-rose-700/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    Сегодня
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-[12px] py-3 md:py-4">
              {!selectedWeek || selectedWeek.streams.length === 0 ? (
                <div className="flex h-full items-center justify-center border border-white/10 p-6 text-sm text-zinc-300">
                  В выбранной неделе нет стримов для оценки.
                </div>
              ) : (
                <div className="hide-scrollbar flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1 md:pr-2">
                  {selectedWeek.streams.map((stream) => (
                    <div key={stream.id}>
                      <RatingCard
                        stream={stream}
                        isLive={
                          Boolean(liveStreamStartedAt) &&
                          Number.isFinite(Date.parse(stream.started_at)) &&
                          Number.isFinite(Date.parse(liveStreamStartedAt ?? "")) &&
                          Math.abs(Date.parse(stream.started_at) - Date.parse(liveStreamStartedAt ?? "")) <= 5 * 60 * 1000
                        }
                        pending={submitState.pendingStreamId === stream.id}
                        locked={stream.myRating !== null}
                        errorMessage={submitState.messages[stream.id] ?? null}
                        onRate={(value) => void handleRate(stream.id, value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
