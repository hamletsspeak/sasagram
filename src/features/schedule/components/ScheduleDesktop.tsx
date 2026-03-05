import type { RefObject } from "react";
import Image from "next/image";
import { CalendarWeek, WeekGroup } from "@/features/schedule/types";
import { WeekPicker } from "@/features/schedule/components/WeekPicker";
import { streamBlockStyle } from "@/features/schedule/lib/build-weeks";
import { VIEW_START_MINUTES } from "@/features/schedule/lib/date";

type ScheduleDesktopProps = {
  axisTicks: string[];
  calendarOpen: boolean;
  calendarMonthStart: Date;
  calendarRef: RefObject<HTMLDivElement | null>;
  calendarTodayKey: string;
  calendarWeeks: CalendarWeek[];
  hoveredWeekKey: string | null;
  availableWeekKeys: Set<string>;
  weekPickerMin?: string;
  weekPickerMax?: string;
  selectedWeek: WeekGroup | null;
  selectedWeekRangeLabel: string;
  safeWeekIndex: number;
  viewEndMinutes: number;
  weeks: WeekGroup[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToggleCalendar: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onHoverWeek: (key: string | null) => void;
  onSelectWeek: (key: string) => void;
  onJumpToday: () => void;
};

function formatRatingValue(ratingAvg: number | null, ratingCount: number) {
  if (ratingCount <= 0 || ratingAvg === null) return "—";
  return ratingAvg.toFixed(2);
}

export function ScheduleDesktop({
  axisTicks,
  calendarOpen,
  calendarMonthStart,
  calendarRef,
  calendarTodayKey,
  calendarWeeks,
  hoveredWeekKey,
  availableWeekKeys,
  weekPickerMin,
  weekPickerMax,
  selectedWeek,
  selectedWeekRangeLabel,
  safeWeekIndex,
  viewEndMinutes,
  weeks,
  onPrevWeek,
  onNextWeek,
  onToggleCalendar,
  onPrevMonth,
  onNextMonth,
  onHoverWeek,
  onSelectWeek,
  onJumpToday,
}: ScheduleDesktopProps) {
  return (
    <div className="hidden rounded-2xl border border-red-950/45 bg-[#09090b] overflow-hidden md:block">
      <div className="flex flex-wrap items-center justify-between border-b border-red-950/45 px-4 py-3 bg-zinc-950/80 gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevWeek}
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
            onClick={onNextWeek}
            disabled={safeWeekIndex >= weeks.length - 1}
            className="group flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700/90 bg-zinc-900/75 text-gray-200 shadow-[0_2px_0_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 hover:border-red-500/65 hover:bg-red-900/20 hover:text-red-200 hover:shadow-[0_8px_16px_-8px_rgba(200,38,67,0.55)] active:translate-y-px active:shadow-[0_1px_0_rgba(15,23,42,0.55)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:translate-y-0 disabled:hover:border-zinc-700/90 disabled:hover:bg-zinc-900/75 disabled:hover:text-gray-200"
            aria-label="Следующая неделя"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
              <path d="M8.5 4.5 14 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <WeekPicker
            calendarRef={calendarRef}
            calendarOpen={calendarOpen}
            calendarMonthStart={calendarMonthStart}
            calendarWeeks={calendarWeeks}
            selectedWeek={selectedWeek}
            selectedWeekRangeLabel={selectedWeekRangeLabel}
            calendarTodayKey={calendarTodayKey}
            hoveredWeekKey={hoveredWeekKey}
            availableWeekKeys={availableWeekKeys}
            weekPickerMin={weekPickerMin}
            weekPickerMax={weekPickerMax}
            onToggle={onToggleCalendar}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            onHoverWeek={onHoverWeek}
            onSelectWeek={onSelectWeek}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onJumpToday}
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
                  <div
                    className={`h-[58px] rounded-xl border border-dashed px-3 ${
                      item.isFuture
                        ? "border-zinc-800/60"
                        : "flex items-center justify-between border-zinc-700/70"
                    }`}
                  >
                    {!item.isFuture ? (
                      <>
                        <p className="line-clamp-1 text-sm font-semibold text-zinc-200">{item.title}</p>
                        <p className="line-clamp-1 text-[11px] text-right text-gray-500">{item.timeRange}</p>
                      </>
                    ) : null}
                  </div>
                ) : item.streamUrl ? (
                  <a
                    href={item.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`absolute top-2 h-[58px] rounded-xl border px-3 py-2 overflow-hidden transition-colors ${item.isLive ? "border-rose-400/55 bg-rose-900/30" : "border-zinc-500/60 bg-zinc-800/70"}`}
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
                    <div className="relative flex h-full items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[clamp(13px,1.05vw,24px)] font-black uppercase leading-none tracking-tight text-white">
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-end gap-2">
                          <p className="line-clamp-1 text-[clamp(10px,0.8vw,14px)] font-bold leading-none text-zinc-100">{item.timeRange}</p>
                          <p className={`line-clamp-1 text-[clamp(11px,0.9vw,15px)] font-black leading-none ${item.isLive ? "text-red-300" : "text-emerald-400"}`}>
                            {item.isLive ? "LIVE" : item.durationLabel}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right pl-2">
                        <div className="flex items-center justify-end gap-1 text-zinc-300">
                          <span className="text-[20px] font-black leading-none">{formatRatingValue(item.ratingAvg, item.ratingCount)}</span>
                          <Image
                            src="/assets/icons/star_rait.png"
                            alt=""
                            width={20}
                            height={20}
                            className="h-5 w-5"
                          />
                        </div>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div
                    className={`absolute top-2 h-[58px] rounded-xl border px-3 py-2 overflow-hidden ${item.isLive ? "border-rose-400/55 bg-rose-900/30" : "border-zinc-600/70 bg-zinc-800/70"}`}
                    style={style}
                  >
                    <div className="relative flex h-full items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[clamp(13px,1.05vw,24px)] font-black uppercase leading-none tracking-tight text-white">
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-end gap-2">
                          <p className="line-clamp-1 text-[clamp(10px,0.8vw,14px)] font-bold leading-none text-zinc-100">{item.timeRange}</p>
                          <p className={`line-clamp-1 text-[clamp(11px,0.9vw,15px)] font-black leading-none ${item.isLive ? "text-red-300" : "text-emerald-400"}`}>
                            {item.isLive ? "LIVE" : item.durationLabel}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right pl-2">
                        <div className="flex items-center justify-end gap-1 text-zinc-300">
                          <span className="text-[20px] font-black leading-none">{formatRatingValue(item.ratingAvg, item.ratingCount)}</span>
                          <Image
                            src="/assets/icons/star_rait.png"
                            alt=""
                            width={20}
                            height={20}
                            className="h-5 w-5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
