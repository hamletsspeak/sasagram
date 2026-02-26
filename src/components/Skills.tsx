const contentCategories = [
  {
    title: "Игровые стримы",
    icon: "🎮",
    items: [
      { name: "Battle Royale", level: 95 },
      { name: "RPG / Open World", level: 88 },
      { name: "Survival Games", level: 82 },
      { name: "Инди-игры", level: 78 },
    ],
  },
  {
    title: "Развлекательный контент",
    icon: "🎉",
    items: [
      { name: "Чиллстримы", level: 92 },
      { name: "Just Chatting", level: 90 },
      { name: "Марафоны", level: 85 },
      { name: "Коллаборации", level: 80 },
    ],
  },
  {
    title: "Платформы",
    icon: "📡",
    items: [
      { name: "Twitch", level: 98 },
      { name: "YouTube", level: 90 },
      { name: "VK Play", level: 75 },
      { name: "TikTok / Shorts", level: 70 },
    ],
  },
];

function ContentBar({ name, level }: { name: string; level: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-gray-300 text-sm font-medium">{name}</span>
        <span className="text-purple-400 text-xs font-semibold">{level}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="content" className="py-24 bg-gray-950">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Контент
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Что я стримлю
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Разнообразный контент на любой вкус — от хардкорных игр до расслабленного общения с чатом.
          </p>
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contentCategories.map((category) => (
            <div
              key={category.title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/40 transition-colors duration-300"
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="text-white font-bold text-xl mb-6">{category.title}</h3>
              <div className="flex flex-col gap-5">
                {category.items.map((item) => (
                  <ContentBar key={item.name} name={item.name} level={item.level} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Game badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-sm mb-6 uppercase tracking-widest">Любимые игры</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Minecraft",
              "GTA V",
              "CS2",
              "Fortnite",
              "Valorant",
              "Cyberpunk 2077",
              "The Witcher 3",
              "Elden Ring",
              "Among Us",
              "Rust",
            ].map((game) => (
              <span
                key={game}
                className="px-4 py-1.5 bg-gray-900 border border-gray-800 rounded-full text-gray-400 text-sm hover:border-purple-500/40 hover:text-gray-300 transition-colors"
              >
                {game}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
