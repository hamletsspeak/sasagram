"use client";

type RatingControlProps = {
  value: number | null;
  disabled?: boolean;
  pending?: boolean;
  locked?: boolean;
  onSelect: (value: number) => void;
};

const OPTIONS = [1, 2, 3, 4, 5] as const;

export function RatingControl({ value, disabled = false, pending = false, locked = false, onSelect }: RatingControlProps) {
  return (
    <div className="grid grid-cols-5 gap-2" aria-label="Оценка стрима">
      {OPTIONS.map((option) => {
        const active = value === option;
        const activeClassName = locked
          ? "border-emerald-300/90 bg-[linear-gradient(180deg,rgba(34,197,94,0.34),rgba(22,101,52,0.82))] text-white shadow-[0_0_0_1px_rgba(110,231,183,0.26),0_14px_30px_rgba(22,101,52,0.28)]"
          : "border-red-300/90 bg-[linear-gradient(180deg,rgba(220,38,38,0.34),rgba(127,29,29,0.82))] text-white shadow-[0_0_0_1px_rgba(248,113,113,0.34),0_14px_30px_rgba(127,29,29,0.28)]";
        const accentTextClassName = locked
          ? "text-emerald-100/85"
          : "text-red-100/80";

        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={`group relative flex min-h-14 flex-col items-center justify-center overflow-hidden rounded-[18px] border px-2 py-2 text-sm font-semibold transition ${
              active
                ? activeClassName
                : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(9,9,11,0.92))] text-zinc-300 hover:border-white/30 hover:text-white"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            aria-pressed={active}
          >
            <span className={`absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_58%)] transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
            <span className="relative text-lg leading-none">{pending && active ? "..." : option}</span>
            <span className={`relative mt-1 text-[9px] uppercase tracking-[0.24em] ${active ? accentTextClassName : "text-zinc-500 group-hover:text-zinc-300"}`}>
              rate
            </span>
          </button>
        );
      })}
    </div>
  );
}
