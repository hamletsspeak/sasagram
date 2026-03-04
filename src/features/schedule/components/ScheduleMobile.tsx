import { WeekGroup } from "@/features/schedule/types";

type ScheduleMobileProps = {
  selectedWeek: WeekGroup | null;
  selectedWeekRangeLabel: string;
  safeWeekIndex: number;
  weeks: WeekGroup[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onJumpToday: () => void;
};

export function ScheduleMobile({
  selectedWeek,
  selectedWeekRangeLabel,
  safeWeekIndex,
  weeks,
  onPrevWeek,
  onNextWeek,
  onJumpToday,
}: ScheduleMobileProps) {
  return (
    <div className="md:hidden rounded-2xl bg-[#09090b] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3 bg-zinc-950/80">
        <button
          type="button"
          onClick={onPrevWeek}
          disabled={safeWeekIndex === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700/90 bg-zinc-900/75 text-gray-200 disabled:opacity-40"
          aria-label="Предыдущая неделя"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
            <path d="M11.5 4.5 6 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <p className="font-type-light-sans flex-1 px-2 py-[3px] text-center text-[21px] leading-none font-semibold text-gray-100">
          {selectedWeekRangeLabel}
        </p>

        <button
          type="button"
          onClick={onNextWeek}
          disabled={safeWeekIndex >= weeks.length - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700/90 bg-zinc-900/75 text-gray-200 disabled:opacity-40"
          aria-label="Следующая неделя"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
            <path d="M8.5 4.5 14 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="px-3 py-2 bg-zinc-950/60">
        <button
          type="button"
          onClick={onJumpToday}
          className="rounded-full bg-rose-700/90 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Сегодня
        </button>
      </div>

      <div className="space-y-1.5 p-2.5">
        {(selectedWeek?.cards ?? []).map((item) => {
          const cardClass = item.isLive
            ? "border-rose-400/55 bg-rose-900/30"
            : item.isActive
              ? "border-zinc-600/70 bg-zinc-800/70"
              : "border-zinc-800/70 bg-zinc-900/45";

          const content = (
            <div className={`rounded-lg border px-2.5 py-2 ${cardClass}`}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase text-gray-300">
                  {item.dayLabel}, {item.dateLabel}
                </p>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    item.isLive
                      ? "bg-red-500/90 text-white"
                      : item.isActive
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-gray-800/90 text-gray-300"
                  }`}
                >
                  {item.isLive ? "LIVE" : item.isActive ? "Был эфир" : "Пусто"}
                </span>
              </div>
              <p className="text-xs font-semibold text-white line-clamp-1">
                {item.isActive ? item.title : "В этот день нет эфира"}
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-[11px] text-gray-300 line-clamp-1">{item.timeRange}</p>
                <p className={`text-[11px] ${item.isLive ? "text-red-300" : item.isActive ? "text-emerald-300" : "text-gray-500"}`}>
                  {item.isLive ? "В эфире" : item.isActive ? item.durationLabel : "—"}
                </p>
              </div>
            </div>
          );

          if (item.streamUrl) {
            return (
              <a key={item.key} href={item.streamUrl} target="_blank" rel="noopener noreferrer" className="block">
                {content}
              </a>
            );
          }

          return <div key={item.key}>{content}</div>;
        })}
      </div>
    </div>
  );
}
