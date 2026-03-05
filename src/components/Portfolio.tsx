const clips = [
  {
    title: "Эпичный вин в Battle Royale",
    description:
      "Один против пятерых — невероятный камбэк в финальном круге. Чат сошёл с ума!",
    tags: ["Battle Royale", "Хайлайт", "Топ момент"],
    emoji: "🏆",
    color: "from-purple-600/20 to-violet-600/20",
    border: "border-purple-500/20",
    views: "2.4M просмотров",
    link: "https://www.twitch.tv/sasavot",
  },
  {
    title: "24-часовой марафон",
    description:
      "Легендарный 24-часовой стрим в поддержку подписчиков. Более 50 000 зрителей онлайн!",
    tags: ["Марафон", "Рекорд", "Сообщество"],
    emoji: "⏰",
    color: "from-red-600/20 to-orange-600/20",
    border: "border-red-500/20",
    views: "1.8M просмотров",
    link: "https://www.twitch.tv/sasavot",
  },
  {
    title: "Прохождение Elden Ring",
    description:
      "Полное прохождение Elden Ring без смертей. Серия стримов, которую ждали все.",
    tags: ["RPG", "Elden Ring", "Прохождение"],
    emoji: "⚔️",
    color: "from-amber-600/20 to-yellow-600/20",
    border: "border-amber-500/20",
    views: "3.1M просмотров",
    link: "https://www.twitch.tv/sasavot",
  },
  {
    title: "Коллаборация с топ-стримерами",
    description:
      "Совместный стрим с крупнейшими стримерами рунета. Незабываемый вечер и море фана!",
    tags: ["Коллаб", "Мультиплеер", "Ивент"],
    emoji: "🤝",
    color: "from-emerald-600/20 to-teal-600/20",
    border: "border-emerald-500/20",
    views: "4.2M просмотров",
    link: "https://www.twitch.tv/sasavot",
  },
  {
    title: "Minecraft мегастройка",
    description:
      "Строим целый город в Minecraft с нуля. Проект длиной в 3 месяца и сотни часов стримов.",
    tags: ["Minecraft", "Стройка", "Долгострой"],
    emoji: "🏗️",
    color: "from-green-600/20 to-lime-600/20",
    border: "border-green-500/20",
    views: "5.7M просмотров",
    link: "https://www.twitch.tv/sasavot",
  },
  {
    title: "Just Chatting — Q&A с подписчиками",
    description:
      "Отвечаю на самые интересные вопросы от подписчиков. Честно, весело и без купюр.",
    tags: ["Just Chatting", "Q&A", "Общение"],
    emoji: "💬",
    color: "from-cyan-600/20 to-sky-600/20",
    border: "border-cyan-500/20",
    views: "890K просмотров",
    link: "https://www.twitch.tv/sasavot",
  },
];

export default function Portfolio() {
  return (
    <section id="clips" className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Клипы и хайлайты
          </p>
          <h2 className="font-fontick text-4xl md:text-5xl font-bold text-white mb-4">
            Лучшие моменты
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Самые яркие и запоминающиеся моменты со стримов — смотри и делись с друзьями!
          </p>
        </div>

        {/* Clips grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.map((clip) => (
            <div
              key={clip.title}
              className={`group relative bg-gradient-to-br ${clip.color} border ${clip.border} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
            >
              {/* Emoji icon */}
              <div className="text-4xl mb-4">{clip.emoji}</div>

              <h3 className="font-fontick text-white font-bold text-lg mb-2">{clip.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{clip.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {clip.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 bg-black/30 border border-white/10 rounded-full text-gray-300 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Views + link */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {clip.views}
                </span>
                <a
                  href={clip.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Смотреть
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="https://www.twitch.tv/sasavot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Смотреть все стримы на Twitch
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
