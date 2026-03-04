export interface CreateStreamBody {
  startedAt?: string;
  durationHours?: number;
  title?: string;
  streamUrl?: string;
}

export interface NormalizedStreamInput {
  startedAtIso: string;
  durationHours: number;
  title: string | null;
  streamUrl: string | null;
}
