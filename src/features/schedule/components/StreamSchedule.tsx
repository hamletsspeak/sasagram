"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ScheduleDesktop } from "@/features/schedule/components/ScheduleDesktop";
import { ScheduleMobile } from "@/features/schedule/components/ScheduleMobile";
import { buildCalendarWeeks, buildWeeks } from "@/features/schedule/lib/build-weeks";
import { useScheduleData } from "@/features/schedule/lib/api";
import {
  BASE_VIEW_END_MINUTES,
  MAX_VIEW_END_MINUTES,
  SLOT_MINUTES,
  VIEW_START_MINUTES,
  dateKey,
  formatAxis,
  formatDateDot,
  monthLabelRu,
} from "@/features/schedule/lib/date";

export default function StreamSchedule() {
  const [selectedWeekKey, setSelectedWeekKey] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hoveredWeekKey, setHoveredWeekKey] = useState<string | null>(null);
  const [topBarVisible, setTopBarVisible] = useState(false);
  const [calendarMonthStart, setCalendarMonthStart] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const { liveActualStart, dbStreams, loading, error } = useScheduleData();

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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTopBarVisible(true);
    }, 780);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const axisTicks = useMemo(() => {
    const ticks: string[] = [];
    for (let m = VIEW_START_MINUTES; m <= viewEndMinutes; m += SLOT_MINUTES) ticks.push(formatAxis(m));
    return ticks;
  }, [viewEndMinutes]);

  const syncCalendarMonthToSelectedWeek = useCallback(() => {
    if (!selectedWeek?.key) {
      return;
    }

    const selectedWeekStart = new Date(`${selectedWeek.key}T00:00:00`);
    setCalendarMonthStart(new Date(selectedWeekStart.getFullYear(), selectedWeekStart.getMonth(), 1));
  }, [selectedWeek?.key]);

  const selectWeek = useCallback((weekKey: string) => {
    setSelectedWeekKey(weekKey);
    setCalendarOpen(false);
    setHoveredWeekKey(null);
  }, []);

  const handlePrevWeek = useCallback(() => {
    if (safeWeekIndex <= 0) return;
    setSelectedWeekKey(weeks[safeWeekIndex - 1].key);
  }, [safeWeekIndex, weeks]);

  const handleNextWeek = useCallback(() => {
    if (safeWeekIndex >= weeks.length - 1) return;
    setSelectedWeekKey(weeks[safeWeekIndex + 1].key);
  }, [safeWeekIndex, weeks]);

  const handleJumpToday = useCallback(() => {
    setSelectedWeekKey(weeks.length > 0 ? weeks[weeks.length - 1].key : null);
  }, [weeks]);

  const handleToggleCalendar = useCallback(() => {
    setCalendarOpen((prev) => {
      if (!prev) {
        syncCalendarMonthToSelectedWeek();
      }
      return !prev;
    });
  }, [syncCalendarMonthToSelectedWeek]);

  const handlePrevMonth = useCallback(() => {
    setCalendarMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCalendarMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  return (
    <section id="schedule" className="relative flex h-full flex-col overflow-hidden bg-transparent">
      <div
        className={`relative z-10 w-full border-y border-white/12 bg-black/82 px-[12px] py-3 shadow-[0_12px_30px_rgba(0,0,0,0.32)] transition-all duration-[900ms] ease-out will-change-transform ${
          topBarVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <h2 className="font-fontick text-2xl font-bold text-white md:text-3xl">Расписание стримов</h2>
          <Link
            href="/rating"
            className="inline-flex items-center rounded-full border border-red-500/80 bg-black/85 px-4 py-2 text-sm font-bold text-red-200 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition hover:border-red-400 hover:bg-red-700/85 hover:text-white"
          >
            Оценить стримы
          </Link>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 w-full flex-col">
        {loading ? (
          <div className="h-full space-y-3 border-y border-white/10 p-4">
            <div className="h-10 w-56 animate-pulse bg-zinc-700/70" />
            <div className="h-[calc(100%-3.25rem)] animate-pulse bg-zinc-800/80" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-gray-400">Не удалось загрузить расписание</div>
        ) : (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <ScheduleMobile
              selectedWeek={selectedWeek}
              selectedWeekRangeLabel={selectedWeekRangeLabel}
              safeWeekIndex={safeWeekIndex}
              weeks={weeks}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onJumpToday={handleJumpToday}
            />

            <ScheduleDesktop
              axisTicks={axisTicks}
              calendarOpen={calendarOpen}
              calendarMonthStart={calendarMonthStart}
              calendarRef={calendarRef}
              calendarTodayKey={calendarTodayKey}
              calendarWeeks={calendarWeeks}
              hoveredWeekKey={hoveredWeekKey}
              availableWeekKeys={availableWeekKeys}
              weekPickerMin={weekPickerMin}
              weekPickerMax={weekPickerMax}
              selectedWeek={selectedWeek}
              selectedWeekRangeLabel={selectedWeekRangeLabel}
              safeWeekIndex={safeWeekIndex}
              viewEndMinutes={viewEndMinutes}
              weeks={weeks}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onToggleCalendar={handleToggleCalendar}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onHoverWeek={setHoveredWeekKey}
              onSelectWeek={selectWeek}
              onJumpToday={handleJumpToday}
            />
          </div>
        )}
      </div>
    </section>
  );
}
