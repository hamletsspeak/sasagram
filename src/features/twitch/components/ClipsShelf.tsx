import Image from "next/image";
import { Clip } from "@/features/twitch/types";
import { formatClipDuration, formatDate, formatViewCount } from "@/features/twitch/lib/format";

type ClipsShelfProps = {
  items: Clip[];
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  onPrev: () => void;
  onNext: () => void;
};

const arrowButtonBaseClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-35 active:translate-y-[1px]";
const actionButtonBaseClass =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all active:translate-y-[1px]";

export function ClipsShelf({ items, itemsPerPage, totalPages, currentPage, onPrev, onNext }: ClipsShelfProps) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-300">Избранные клипы</p>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentPage === 0}
            className={`${arrowButtonBaseClass} border border-rose-300/70 bg-rose-700/80 text-white shadow-[0_3px_0_rgba(122,16,44,0.5)] hover:bg-rose-600/90 active:shadow-[0_1px_0_rgba(122,16,44,0.5)]`}
            aria-label="Предыдущая страница клипов"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M11.5 4.5 6 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={currentPage >= totalPages - 1}
            className={`${arrowButtonBaseClass} border border-rose-300/70 bg-rose-700/80 text-white shadow-[0_3px_0_rgba(122,16,44,0.5)] hover:bg-rose-600/90 active:shadow-[0_1px_0_rgba(122,16,44,0.5)]`}
            aria-label="Следующая страница клипов"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M8.5 4.5 14 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a
            href="https://www.twitch.tv/sasavot/videos?featured=true&filter=clips&range=all"
            target="_blank"
            rel="noopener noreferrer"
            className={`${actionButtonBaseClass} border border-rose-300/70 bg-rose-700/80 text-white shadow-[0_3px_0_rgba(122,16,44,0.5)] hover:bg-rose-600/90 active:shadow-[0_1px_0_rgba(122,16,44,0.5)]`}
          >
            Все клипы
          </a>
        </div>
      </div>

      <div className="min-h-0 overflow-hidden">
        <div className="grid h-full min-h-[195px] gap-3" style={{ gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))` }}>
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-rose-500/25 text-gray-400" style={{ gridColumn: "1 / -1" }}>
              Клипы пока не найдены
            </div>
          ) : (
            items.map((clip) => (
              <a key={clip.id} href={clip.url} target="_blank" rel="noopener noreferrer" className="group relative h-full overflow-hidden rounded-2xl border border-rose-400/25 bg-black/30">
                <Image src={clip.thumbnail_url} alt={clip.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                <div className="absolute right-3 top-3 rounded-lg bg-black/80 px-2 py-1 text-xs font-mono text-white">{formatClipDuration(clip.duration)}</div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="line-clamp-2 text-base font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)] md:text-lg">{clip.title}</h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-rose-100/85">
                    <span>👁 {formatViewCount(clip.view_count)}</span>
                    <span>{formatDate(clip.created_at)}</span>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
