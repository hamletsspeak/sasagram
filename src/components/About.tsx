const stats = [
  { value: "5+", label: "Years Experience" },
  { value: "50+", label: "Projects Completed" },
  { value: "30+", label: "Happy Clients" },
  { value: "10+", label: "Awards Won" },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: image placeholder */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto lg:mx-0 rounded-3xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-7xl font-bold text-white mx-auto mb-4 shadow-2xl">
                  A
                </div>
                <p className="text-gray-500 text-sm">Your photo here</p>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-indigo-600/10 rounded-3xl border border-indigo-500/20 -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-600/10 rounded-2xl border border-purple-500/20 -z-10" />
          </div>

          {/* Right: content */}
          <div>
            <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
              About Me
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Passionate about building great products
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              A full-stack developer with over 5 years of experience building web applications
              that are fast, accessible, and delightful to use. Specializing in React, Next.js, and
              Node.js ecosystems.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              When not coding, you will find me exploring new design trends, contributing to
              open-source projects, or hiking in the mountains. Great software comes from
              a balance of technical excellence and human empathy.
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

            <a
              href="/resume.pdf"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Resume
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
