import type { RefObject } from "react";
import { CalendarWeek, WeekGroup } from "@/features/schedule/types";
import { monthLabelRu } from "@/features/schedule/lib/date";

type WeekPickerProps = {
  calendarRef: RefObject<HTMLDivElement | null>;
  calendarOpen: boolean;
  calendarMonthStart: Date;
  calendarWeeks: CalendarWeek[];
  selectedWeek: WeekGroup | null;
  selectedWeekRangeLabel: string;
  calendarTodayKey: string;
  hoveredWeekKey: string | null;
  availableWeekKeys: Set<string>;
  weekPickerMin?: string;
  weekPickerMax?: string;
  onToggle: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onHoverWeek: (key: string | null) => void;
  onSelectWeek: (key: string) => void;
};

const WEEKDAY_LABELS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export function WeekPicker({
  calendarRef,
  calendarOpen,
  calendarMonthStart,
  calendarWeeks,
  selectedWeek,
  selectedWeekRangeLabel,
  calendarTodayKey,
  hoveredWeekKey,
  availableWeekKeys,
  weekPickerMin,
  weekPickerMax,
  onToggle,
  onPrevMonth,
  onNextMonth,
  onHoverWeek,
  onSelectWeek,
}: WeekPickerProps) {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const isAtCurrentMonth =
    calendarMonthStart.getFullYear() === currentMonthStart.getFullYear() &&
    calendarMonthStart.getMonth() === currentMonthStart.getMonth();

  return (
    <div ref={calendarRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-9 min-w-[168px] items-center justify-between rounded-xl border border-zinc-700/90 bg-zinc-900/75 px-3 text-sm text-gray-100 transition-colors hover:border-red-500/65 hover:bg-zinc-900"
        aria-expanded={calendarOpen}
        aria-label="Открыть календарь недель"
      >
        <span className="font-type-light-sans">{selectedWeekRangeLabel}</span>
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`h-4 w-4 transition-transform ${calendarOpen ? "rotate-180" : ""}`}>
          <path d="m5.5 7.5 4.5 5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {calendarOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[286px] max-w-[calc(100vw-24px)] rounded-2xl border border-red-950/45 bg-[#141116] p-3 shadow-2xl">
          <div className="mb-3 flex items-center justify-between text-white">
            <p className="text-2xl font-semibold capitalize">{monthLabelRu(calendarMonthStart)}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-red-900/20 hover:text-white"
                aria-label="Предыдущий месяц"
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                  <path d="M11.5 4.5 6 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onNextMonth}
                disabled={isAtCurrentMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-red-900/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-zinc-300"
                aria-label="Следующий месяц"
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                  <path d="M8.5 4.5 14 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-300/80">
            {WEEKDAY_LABELS.map((weekday) => (
              <span key={weekday} className="py-1 text-center">
                {weekday}
              </span>
            ))}
          </div>

          <div className="space-y-1" onMouseLeave={() => onHoverWeek(null)}>
            {calendarWeeks.map((week) => {
              const isSelected = selectedWeek?.key === week.key;
              const isHovered = hoveredWeekKey === week.key;
              const isSelectable = availableWeekKeys.has(week.key) && (!weekPickerMin || week.key >= weekPickerMin) && (!weekPickerMax || week.key <= weekPickerMax);

              return (
                <div
                  key={week.key}
                  onMouseEnter={() => {
                    if (!isSelectable) return;
                    onHoverWeek(week.key);
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
                          onSelectWeek(week.key);
                        }}
                        className={`font-type-light-sans h-8 w-8 justify-self-center rounded-full text-sm transition-colors ${
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
  );
}
