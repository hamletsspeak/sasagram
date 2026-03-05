"use client";

type RatingControlProps = {
  value: number | null;
  disabled?: boolean;
  pending?: boolean;
  onSelect: (value: number) => void;
};

const OPTIONS = [1, 2, 3, 4, 5] as const;

export function RatingControl({ value, disabled = false, pending = false, onSelect }: RatingControlProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Оценка стрима">
      {OPTIONS.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={`min-w-11 rounded-full border px-3 py-2 text-sm font-semibold transition ${
              active
                ? "border-red-300 bg-red-500/25 text-red-100 shadow-[0_0_0_1px_rgba(248,113,113,0.35)]"
                : "border-white/12 bg-black/30 text-zinc-300 hover:border-red-400/60 hover:text-white"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            aria-pressed={active}
          >
            {pending && active ? "..." : option}
          </button>
        );
      })}
    </div>
  );
}
