"use client";

export default function FooterReplayButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("sasagram:open-disclaimer"))}
      className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:text-white"
      aria-label="Смотреть интро заново"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 transition group-hover:translate-x-0.5">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 10H15M15 10L10.5 5.5M15 10L10.5 14.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>Смотреть интро заново</span>
    </button>
  );
}
