"use client";

import { useState } from "react";
import Link from "next/link";

export function RatingHelpPopup() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-4 z-50 md:right-6 md:bottom-6">
      <div
        className={`native-glass--strong absolute right-0 bottom-[calc(100%+12px)] w-[min(92vw,360px)] origin-bottom-right rounded-2xl border border-white/15 p-4 text-sm text-zinc-200 shadow-[0_22px_48px_rgba(0,0,0,0.5)] transform-gpu will-change-transform will-change-opacity [backface-visibility:hidden] ${
          open ? "pointer-events-auto rating-help-popup-enter" : "pointer-events-none rating-help-popup-exit"
        }`}
      >
        <p className="text-base font-semibold text-white">Частые вопросы</p>
        <p className="mt-4 text-base font-semibold text-white">Это безопасно?</p>
        <p className="mt-1 text-zinc-300">Да. Личные данные не собираются.</p>
        <p className="mt-3 text-base font-semibold text-white">Какие данные вы храните?</p>
        <p className="mt-1 text-zinc-300">Ни имя, ни почту, ни телефон, ни аккаунт мы не храним.</p>
        <p className="mt-3 text-base font-semibold text-white">Как работает голосование?</p>
        <p className="mt-1 text-zinc-300">За один стрим с одного устройства можно проголосовать только один раз.</p>
        <p className="mt-3 text-base font-semibold text-white">Нужна регистрация?</p>
        <p className="mt-1 text-zinc-300">Нет, регистрация не нужна.</p>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-red-300/55 bg-red-700/85 text-xl font-bold text-white shadow-[0_10px_24px_rgba(127,29,29,0.55)] transition hover:bg-red-600"
        aria-label={open ? "Скрыть подсказку" : "Показать подсказку"}
        aria-expanded={open}
      >
        ?
      </button>
    </div>
  );
}
