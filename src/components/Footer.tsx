export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black/45 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:justify-start sm:text-left">
          <span className="text-red-400">▶</span>
          <span className="text-white font-bold">SASA<span className="text-red-400">VOT</span></span>
          <span className="text-gray-600 text-sm sm:ml-2">© {year}. Все права защищены.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {[
            { label: "Twitch", href: "https://www.twitch.tv/sasavot" },
            { label: "YouTube", href: "https://www.youtube.com/@sasavot" },
            { label: "VK", href: "https://vk.com/sasavot" },
            { label: "Telegram", href: "https://t.me/sasavot" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-red-300 text-sm transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
