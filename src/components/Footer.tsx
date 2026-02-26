export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 text-sm">
          © {year} Alex Johnson. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {[
            { label: "GitHub", href: "#" },
            { label: "LinkedIn", href: "#" },
            { label: "Twitter", href: "#" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
