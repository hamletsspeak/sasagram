const skillCategories = [
  {
    title: "Frontend",
    icon: "🎨",
    skills: [
      { name: "React / Next.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Tailwind CSS", level: 92 },
      { name: "Framer Motion", level: 80 },
    ],
  },
  {
    title: "Backend",
    icon: "⚙️",
    skills: [
      { name: "Node.js", level: 88 },
      { name: "PostgreSQL", level: 82 },
      { name: "REST / GraphQL", level: 85 },
      { name: "Docker", level: 75 },
    ],
  },
  {
    title: "Tools & Design",
    icon: "🛠️",
    skills: [
      { name: "Figma", level: 85 },
      { name: "Git / GitHub", level: 92 },
      { name: "Vercel / AWS", level: 80 },
      { name: "Testing (Jest)", level: 78 },
    ],
  },
];

function SkillBar({ name, level }: { name: string; level: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-gray-300 text-sm font-medium">{name}</span>
        <span className="text-indigo-400 text-xs font-semibold">{level}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="py-24 bg-gray-950">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
            My Skills
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What I Work With
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A curated set of technologies I use to build modern, scalable web applications.
          </p>
        </div>

        {/* Skill cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {skillCategories.map((category) => (
            <div
              key={category.title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-indigo-500/40 transition-colors duration-300"
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="text-white font-bold text-xl mb-6">{category.title}</h3>
              <div className="flex flex-col gap-5">
                {category.skills.map((skill) => (
                  <SkillBar key={skill.name} name={skill.name} level={skill.level} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tech badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-sm mb-6 uppercase tracking-widest">Also familiar with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Python", "Redis", "Prisma", "Stripe", "Supabase", "Cloudflare", "Storybook", "Playwright"].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-4 py-1.5 bg-gray-900 border border-gray-800 rounded-full text-gray-400 text-sm hover:border-indigo-500/40 hover:text-gray-300 transition-colors"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
