const projects = [
  {
    title: "E-Commerce Platform",
    description:
      "A full-featured online store with cart, payments via Stripe, and an admin dashboard. Built with Next.js and PostgreSQL.",
    tags: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"],
    emoji: "🛒",
    color: "from-blue-600/20 to-indigo-600/20",
    border: "border-blue-500/20",
    link: "#",
    github: "#",
  },
  {
    title: "Task Management App",
    description:
      "A Kanban-style project management tool with real-time collaboration, drag-and-drop, and team workspaces.",
    tags: ["React", "Node.js", "Socket.io", "MongoDB"],
    emoji: "📋",
    color: "from-purple-600/20 to-pink-600/20",
    border: "border-purple-500/20",
    link: "#",
    github: "#",
  },
  {
    title: "AI Content Generator",
    description:
      "A SaaS tool that uses OpenAI to generate blog posts, social media content, and marketing copy at scale.",
    tags: ["Next.js", "OpenAI", "Prisma", "Tailwind"],
    emoji: "🤖",
    color: "from-emerald-600/20 to-teal-600/20",
    border: "border-emerald-500/20",
    link: "#",
    github: "#",
  },
  {
    title: "Finance Dashboard",
    description:
      "An analytics dashboard for personal finance tracking with charts, budgeting tools, and bank integrations.",
    tags: ["React", "D3.js", "Express", "SQLite"],
    emoji: "📊",
    color: "from-orange-600/20 to-amber-600/20",
    border: "border-orange-500/20",
    link: "#",
    github: "#",
  },
  {
    title: "Portfolio CMS",
    description:
      "A headless CMS built for creatives to manage their portfolio, blog, and client inquiries from one place.",
    tags: ["Next.js", "Sanity", "Vercel", "TypeScript"],
    emoji: "🎨",
    color: "from-rose-600/20 to-pink-600/20",
    border: "border-rose-500/20",
    link: "#",
    github: "#",
  },
  {
    title: "Dev Blog Platform",
    description:
      "A markdown-powered blog platform with syntax highlighting, SEO optimization, and newsletter integration.",
    tags: ["Next.js", "MDX", "Resend", "Tailwind"],
    emoji: "✍️",
    color: "from-cyan-600/20 to-sky-600/20",
    border: "border-cyan-500/20",
    link: "#",
    github: "#",
  },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Portfolio
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A selection of projects I have built — from SaaS products to open-source tools.
          </p>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className={`group relative bg-gradient-to-br ${project.color} border ${project.border} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
            >
              {/* Emoji icon */}
              <div className="text-4xl mb-4">{project.emoji}</div>

              <h3 className="text-white font-bold text-lg mb-2">{project.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{project.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 bg-black/30 border border-white/10 rounded-full text-gray-300 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3">
                <a
                  href={project.link}
                  className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Live Demo
                </a>
                <a
                  href={project.github}
                  className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            View all projects on GitHub
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
