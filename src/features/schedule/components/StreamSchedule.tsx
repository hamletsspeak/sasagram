"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

  const selectWeek = (weekKey: string) => {
    setSelectedWeekKey(weekKey);
    setCalendarOpen(false);
    setHoveredWeekKey(null);
  };

  return (
    <section id="schedule" className="min-h-screen py-20 bg-black/45">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Расписание стримов</h2>
        </div>

        {loading ? (
          <div className="h-80 rounded-2xl bg-zinc-900/80 animate-pulse" />
        ) : error ? (
          <div className="text-center text-gray-400 text-sm py-8">Не удалось загрузить расписание</div>
        ) : (
          <>
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
              onToggleCalendar={() => setCalendarOpen((prev) => !prev)}
              onPrevMonth={() => setCalendarMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              onNextMonth={() => setCalendarMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              onHoverWeek={setHoveredWeekKey}
              onSelectWeek={selectWeek}
              onJumpToday={() => setSelectedWeekKey(weeks.length > 0 ? weeks[weeks.length - 1].key : null)}
            />
          </>
        )}
      </div>
    </section>
  );
}
