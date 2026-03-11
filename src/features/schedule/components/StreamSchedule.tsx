"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

  const axisTicks = useMemo(() => {
    const ticks: string[] = [];
    for (let m = VIEW_START_MINUTES; m <= viewEndMinutes; m += SLOT_MINUTES) ticks.push(formatAxis(m));
    return ticks;
  }, [viewEndMinutes]);

  const syncCalendarMonthToSelectedWeek = () => {
    if (!selectedWeek?.key) {
      return;
    }

    const selectedWeekStart = new Date(`${selectedWeek.key}T00:00:00`);
    setCalendarMonthStart(new Date(selectedWeekStart.getFullYear(), selectedWeekStart.getMonth(), 1));
  };

  const selectWeek = (weekKey: string) => {
    setSelectedWeekKey(weekKey);
    setCalendarOpen(false);
    setHoveredWeekKey(null);
  };

  return (
    <section id="schedule" className="h-[calc(100vh-66px)] overflow-hidden bg-transparent py-2 md:h-[calc(100vh-78px)] md:py-3">
      <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col px-4 md:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-fontick text-2xl md:text-3xl font-bold text-white">Расписание стримов</h2>
          <Link
            href="/rating"
            className="inline-flex items-center rounded-full border border-red-500/80 bg-black/85 px-4 py-2 text-sm font-bold text-red-200 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition hover:border-red-400 hover:bg-red-700/85 hover:text-white"
          >
            Оценить стримы
          </Link>
        </div>

        {loading ? (
          <div className="h-full space-y-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="h-10 w-56 animate-pulse rounded-xl bg-zinc-700/70" />
            <div className="h-[calc(100%-3.25rem)] animate-pulse rounded-xl bg-zinc-800/80" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-gray-400">Не удалось загрузить расписание</div>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            <ScheduleMobile
              selectedWeek={selectedWeek}
              selectedWeekRangeLabel={selectedWeekRangeLabel}
              safeWeekIndex={safeWeekIndex}
              weeks={weeks}
              onPrevWeek={() => {
                if (safeWeekIndex <= 0) return;
                setSelectedWeekKey(weeks[safeWeekIndex - 1].key);
              }}
              onNextWeek={() => {
                if (safeWeekIndex >= weeks.length - 1) return;
                setSelectedWeekKey(weeks[safeWeekIndex + 1].key);
              }}
              onJumpToday={() => setSelectedWeekKey(weeks.length > 0 ? weeks[weeks.length - 1].key : null)}
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
              onPrevWeek={() => {
                if (safeWeekIndex <= 0) return;
                setSelectedWeekKey(weeks[safeWeekIndex - 1].key);
              }}
              onNextWeek={() => {
                if (safeWeekIndex >= weeks.length - 1) return;
                setSelectedWeekKey(weeks[safeWeekIndex + 1].key);
              }}
              onToggleCalendar={() =>
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
              onSelectWeek={selectWeek}
              onJumpToday={() => setSelectedWeekKey(weeks.length > 0 ? weeks[weeks.length - 1].key : null)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
