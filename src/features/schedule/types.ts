export interface StreamData {
  isLive: boolean;
  stream: { started_at: string; title: string } | null;
  vods: Array<{ id: string; created_at: string; duration: string; title: string; url: string }>;
}

export interface DbStream {
  id: string;
  started_at: string;
  duration_hours: string | number;
  title: string | null;
  stream_url: string | null;
  created_at: string;
}

export interface StreamsResponse {
  streams?: DbStream[];
}

export interface TimelineCard {
  key: string;
  dayLabel: string;
  dateLabel: string;
  timeRange: string;
  durationLabel: string;
  title: string;
  streamUrl: string | null;
  isToday: boolean;
  isActive: boolean;
  isLive: boolean;
  startMinutes: number | null;
  endMinutes: number | null;
}

export interface WeekGroup {
  key: string;
  label: string;
  cards: TimelineCard[];
}

export interface CalendarDay {
  key: string;
  label: number;
  inMonth: boolean;
}

export interface CalendarWeek {
  key: string;
  days: CalendarDay[];
}

export interface LiveActualStart {
  key: string;
  startedAt: string;
  title: string;
}
