"use client";

const OPEN_DISCLAIMER_EVENT = "sasagram:open-disclaimer";

export default function IntroReplaySection() {
  const openIntro = () => {
    window.dispatchEvent(new Event(OPEN_DISCLAIMER_EVENT));
  };

  return (
    <section className="relative z-20 bg-black/45 px-6 py-16 text-zinc-100 md:px-10 md:py-20">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,13,16,0.88),rgba(5,5,7,0.94))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.42)] md:flex-row md:items-end md:justify-between md:p-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">Intro replay</p>
          <h2 className="mt-3 font-audex text-[clamp(1.9rem,4vw,3.6rem)] uppercase leading-[0.92] text-white">
            Хочешь посмотреть интро ещё раз?
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 md:text-base">
            Повторный запуск доступен здесь, в конце сайта. Нажми кнопку, и стартовое интро откроется заново поверх страницы.
          </p>
        </div>

        <button
          type="button"
          onClick={openIntro}
          className="inline-flex w-fit items-center justify-center rounded-full border border-white/18 bg-white/8 px-6 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/40 hover:bg-white/12"
        >
          Смотреть интро
        </button>
      </div>
    </section>
  );
}
