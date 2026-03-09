export default function Footer() {
  const techSupportUrl = "https://t.me/haworking";

  return (
    <footer className="bg-black/45 py-8">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-end">
        <a
          href={techSupportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 transition-colors hover:text-gray-400"
        >
            Tech Support
        </a>
      </div>
    </footer>
  );
}
