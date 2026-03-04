export function formatDuration(duration: string): string {
  const hours = duration.match(/(\d+)h/)?.[1];
  const minutes = duration.match(/(\d+)m/)?.[1];
  const seconds = duration.match(/(\d+)s/)?.[1];
  if (hours) return `${hours}:${(minutes ?? "0").padStart(2, "0")}:${(seconds ?? "0").padStart(2, "0")}`;
  if (minutes) return `${minutes}:${(seconds ?? "0").padStart(2, "0")}`;
  return `0:${(seconds ?? "0").padStart(2, "0")}`;
}

export function formatClipDuration(seconds?: number): string {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function getThumbnailUrl(url: string, width = 640, height = 360): string {
  return url.replace("%{width}", String(width)).replace("%{height}", String(height));
}
