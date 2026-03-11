"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearClientApiCache } from "@/lib/client-api-cache";

const REDIRECT_DELAY_MS = 900;

function sanitizeTarget(target: string | null): string {
  if (!target || !target.startsWith("/")) {
    return "/";
  }

  if (target === "/reload" || target.startsWith("/reload?")) {
    return "/";
  }

  return target;
}

export default function ReloadPageClient() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(Math.ceil(REDIRECT_DELAY_MS / 1000));
  const target = useMemo(() => sanitizeTarget(searchParams.get("to")), [searchParams]);

  useEffect(() => {
    clearClientApiCache();

    const countdownId = window.setInterval(() => {
      setCountdown((current) => (current > 1 ? current - 1 : current));
    }, 300);

    const timeoutId = window.setTimeout(() => {
      window.location.replace(target);
    }, REDIRECT_DELAY_MS);

    return () => {
      window.clearInterval(countdownId);
      window.clearTimeout(timeoutId);
    };
  }, [target]);

  return (
    <main className="site-dark-glow flex min-h-screen items-center justify-center bg-black px-6 text-zinc-100">
      <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-zinc-950/80 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.48)] backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500">Reload</p>
        <h1 className="mt-4 font-fontick text-3xl uppercase text-white md:text-4xl">Перезагрузка страницы</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-300 md:text-base">
          Очищаю клиентский кэш и выполняю полную перезагрузку маршрута{" "}
          <span className="font-semibold text-white">{target}</span>.
        </p>
        <p className="mt-5 text-xs uppercase tracking-[0.28em] text-red-300/80">
          Перенаправление через {countdown}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.replace(target)}
            className="rounded-full border border-red-500/70 bg-red-700/85 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Перезагрузить сейчас
          </button>
          <Link
            href={target}
            prefetch={false}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white"
          >
            Отмена
          </Link>
        </div>
      </div>
    </main>
  );
}
