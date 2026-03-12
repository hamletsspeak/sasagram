"use client";

import Image from "next/image";
import { RatedStream } from "@/features/ratings/types";
import { RatingControl } from "@/features/ratings/components/RatingControl";
import { formatDurationHours, formatDateDot, timeRu } from "@/features/schedule/lib/date";
import { getThumbnailUrl } from "@/features/twitch/lib/format";

type RatingCardProps = {
  stream: RatedStream;
  pending: boolean;
  locked: boolean;
  errorMessage: string | null;
  onRate: (value: number) => void;
};

function formatStreamDate(isoDate: string) {
  const date = new Date(isoDate);
  return `${formatDateDot(date)} ${timeRu(isoDate)}`;
}

function formatAverage(ratingAvg: number | null) {
  return ratingAvg === null ? "Нет оценок" : ratingAvg.toFixed(2);
}

export function RatingCard({ stream, pending, locked, errorMessage, onRate }: RatingCardProps) {
  const duration = typeof stream.duration_hours === "number" ? stream.duration_hours : Number(stream.duration_hours);
  const previewUrl = stream.thumbnailUrl ? getThumbnailUrl(stream.thumbnailUrl, 640, 360) : null;
  const title = stream.title?.trim() || `Стрим от ${formatStreamDate(stream.started_at)}`;
  const voteLabel = stream.myRating === null ? "Выберите оценку" : `Вы поставили: ${stream.myRating} / 5`;

  return (
    <article className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(9,9,11,0.94))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.4)] md:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_80%_at_0%_0%,rgba(185,28,28,0.18),transparent_45%),radial-gradient(90%_70%_at_100%_100%,rgba(120,53,15,0.14),transparent_42%)] opacity-80" />
      <div className="relative grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_300px] xl:items-stretch">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/40">
          {previewUrl ? (
            <div className="relative aspect-video h-full min-h-[180px]">
              <Image
                src={previewUrl}
                alt={title}
                fill
                unoptimized
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 1279px) 100vw, 260px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.7))]" />
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-zinc-100">
                  {formatStreamDate(stream.started_at)}
                </span>
                <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-zinc-300">
                  {Number.isFinite(duration) ? formatDurationHours(duration) : "Не указана"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex aspect-video min-h-[180px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.22),transparent_55%),linear-gradient(180deg,rgba(24,24,27,0.92),rgba(10,10,12,0.98))] px-4 text-center text-sm text-zinc-400">
              Превью записи недоступно
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-5 xl:py-1">
          <div className="space-y-3">
            <h2 className="max-w-3xl text-xl font-semibold leading-tight text-white md:text-2xl">
              {title}
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300">
              Оцени общее впечатление от эфира: подачу, темп, интересные моменты и желание досмотреть запись до конца.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[20px] border border-white/10 bg-black/30 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Старт</p>
              <p className="mt-2 text-base font-semibold text-zinc-100">{formatStreamDate(stream.started_at)}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-black/30 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Средняя оценка</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-100">{formatAverage(stream.ratingAvg)}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-black/30 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Голосов</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-100">{stream.ratingCount}</p>
            </div>
          </div>

          {stream.stream_url ? (
            <a
              href={stream.stream_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/25 hover:bg-white/10"
            >
              Открыть запись
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>

        <div className="min-w-0 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,13,16,0.92),rgba(8,8,11,0.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="rounded-[18px] border border-white/8 bg-black/25 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Статус</p>
            <p className={`mt-2 text-base font-medium ${locked ? "text-emerald-100" : "text-zinc-200"}`}>
              {locked ? "Оценено" : voteLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Оцените от 1 до 5.
            </p>
          </div>

          <div className="mt-5">
            <RatingControl
              value={stream.myRating}
              pending={pending}
              disabled={locked || pending}
              locked={locked}
              onSelect={onRate}
            />
          </div>

          <p className={`mt-4 min-h-10 text-sm leading-relaxed ${errorMessage ? "text-amber-200" : "text-zinc-500"}`}>
            {errorMessage ?? ""}
          </p>
        </div>
      </div>
    </article>
  );
}
