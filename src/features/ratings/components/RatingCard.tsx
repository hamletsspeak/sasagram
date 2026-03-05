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
  return ratingAvg === null ? "Нет оценок" : `${ratingAvg.toFixed(2)} / 5`;
}

export function RatingCard({ stream, pending, locked, errorMessage, onRate }: RatingCardProps) {
  const duration = typeof stream.duration_hours === "number" ? stream.duration_hours : Number(stream.duration_hours);
  const previewUrl = stream.thumbnailUrl ? getThumbnailUrl(stream.thumbnailUrl, 640, 360) : null;

  return (
    <article className="native-glass rounded-[28px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.34)]">
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_280px] lg:items-start">
        <div className="-mx-5 -mt-5 overflow-hidden rounded-t-[28px] border border-red-400/20 bg-black/40 lg:mx-0 lg:mt-0 lg:rounded-2xl">
          {previewUrl ? (
            <div className="relative aspect-video">
              <Image
                src={previewUrl}
                alt={stream.title?.trim() || "Превью стрима"}
                fill
                unoptimized
                className="object-cover"
                sizes="240px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.22),transparent_55%),linear-gradient(180deg,rgba(24,24,27,0.92),rgba(10,10,12,0.98))] px-4 text-center text-sm text-zinc-400">
              Превью записи недоступно
            </div>
          )}
        </div>

        <div className="space-y-2 lg:pt-1">
          <h2 className="text-xl font-semibold text-white">
            {stream.title?.trim() || `Стрим от ${formatStreamDate(stream.started_at)}`}
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-400">
            <span>{formatStreamDate(stream.started_at)}</span>
            <span>Длительность: {Number.isFinite(duration) ? formatDurationHours(duration) : "Не указана"}</span>
            <span>Средняя: {formatAverage(stream.ratingAvg)}</span>
            <span>Голосов: {stream.ratingCount}</span>
          </div>
          {stream.stream_url ? (
            <a
              href={stream.stream_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex pt-1 text-sm font-medium text-red-200 transition hover:text-white"
            >
              Открыть запись
            </a>
          ) : null}
        </div>

        <div className="min-w-[240px] space-y-3 lg:justify-self-end lg:pt-1">
          <div className="text-sm text-zinc-300">
            {stream.myRating === null ? "Выберите оценку" : `Ваша оценка: ${stream.myRating} / 5`}
          </div>
          <RatingControl
            value={stream.myRating}
            pending={pending}
            disabled={locked || pending}
            onSelect={onRate}
          />
          <p className={`text-sm ${errorMessage ? "text-amber-200" : "text-zinc-500"}`}>
            {errorMessage ?? "Оценку можно поставить один раз."}
          </p>
        </div>
      </div>
    </article>
  );
}
