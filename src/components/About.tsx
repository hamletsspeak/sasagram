const stats = [
  { value: "500K+", label: "Подписчиков" },
  { value: "1000+", label: "Стримов" },
  { value: "5+", label: "Лет в эфире" },
  { value: "∞", label: "Хорошего настроения" },
];

const schedule = [
  { day: "Пн", time: "20:00", active: true },
  { day: "Вт", time: "—", active: false },
  { day: "Ср", time: "20:00", active: true },
  { day: "Чт", time: "20:00", active: true },
  { day: "Пт", time: "21:00", active: true },
  { day: "Сб", time: "18:00", active: true },
  { day: "Вс", time: "18:00", active: true },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: avatar + schedule */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto lg:mx-0 rounded-3xl bg-gradient-to-br from-purple-900/50 to-violet-900/50 border border-white/10 overflow-hidden flex flex-col items-center justify-center gap-6 p-8">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-7xl font-black text-white shadow-2xl">
                S
              </div>
              {/* Stream schedule */}
              <div className="w-full">
                <p className="text-gray-500 text-xs uppercase tracking-widest text-center mb-3">Расписание стримов</p>
                <div className="grid grid-cols-7 gap-1">
                  {schedule.map((s) => (
                    <div key={s.day} className="flex flex-col items-center gap-1">
                      <span className="text-gray-500 text-xs">{s.day}</span>
                      <div
                        className={`w-full rounded-lg py-1.5 text-center text-xs font-semibold ${
                          s.active
                            ? "bg-purple-600/30 border border-purple-500/40 text-purple-300"
                            : "bg-gray-800/50 border border-gray-700/50 text-gray-600"
                        }`}
                      >
                        {s.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-purple-600/10 rounded-3xl border border-purple-500/20 -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-violet-600/10 rounded-2xl border border-violet-500/20 -z-10" />
          </div>

          {/* Right: content */}
          <div>
            <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">
              О стримере
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Кто такой SASAVOT?
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              SASAVOT — популярный русскоязычный стример и контент-мейкер. Стримлю уже более 5 лет,
              за это время собрал большое и дружное комьюнити. Каждый эфир — это не просто игра,
              это живое общение и хорошее настроение.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              На канале ты найдёшь разнообразный контент: от хардкорных прохождений до расслабленных
              чиллстримов. Главное — атмосфера и общение с чатом. Заходи, будет весело!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.twitch.tv/sasavot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/30"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                </svg>
                Подписаться на Twitch
              </a>
              <a
                href="https://www.youtube.com/@sasavot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-600/30"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
