const contactLinks = [
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    label: "Telegram",
    description: "Написать напрямую",
    value: "@sasavot",
    href: "https://t.me/sasavot",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Email",
    description: "По вопросам сотрудничества",
    value: "collab@sasavot.ru",
    href: "mailto:collab@sasavot.ru",
    color: "from-purple-500/20 to-violet-500/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
    label: "Twitch",
    description: "Смотреть стримы",
    value: "twitch.tv/sasavot",
    href: "https://www.twitch.tv/sasavot",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/30",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    label: "YouTube",
    description: "Видео и хайлайты",
    value: "@sasavot",
    href: "https://www.youtube.com/@sasavot",
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/30",
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10",
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-gray-950">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Связь
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Контакты
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Хочешь предложить коллаборацию или просто пообщаться? Выбирай удобный способ!
          </p>
        </div>

        {/* Contact cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {contactLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`group flex items-center gap-5 p-6 bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl hover:scale-[1.02] transition-all duration-200 hover:shadow-lg`}
            >
              <div className={`w-14 h-14 rounded-2xl ${item.iconBg} border ${item.border} flex items-center justify-center ${item.iconColor} flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-xs mb-0.5">{item.description}</p>
                <p className="text-white font-bold text-base">{item.label}</p>
                <p className="text-gray-300 text-sm truncate">{item.value}</p>
              </div>
              <svg
                className="w-5 h-5 text-gray-600 group-hover:text-gray-400 ml-auto flex-shrink-0 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>

        {/* Availability note */}
        <div className="mt-10 p-6 bg-gradient-to-br from-purple-900/30 to-violet-900/30 border border-purple-500/20 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-semibold">Открыт для коллабораций</span>
          </div>
          <p className="text-gray-400 text-sm">
            Рассматриваю предложения по рекламе, совместным стримам и брендовым интеграциям.
            Время ответа: до 48 часов.
          </p>
        </div>
      </div>
    </section>
  );
}
