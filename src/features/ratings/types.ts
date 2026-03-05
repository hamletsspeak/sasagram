export interface RatedStream {
  id: string;
  started_at: string;
  duration_hours: string | number;
  title: string | null;
  stream_url: string | null;
  thumbnailUrl: string | null;
  created_at: string;
  ratingAvg: number | null;
  ratingCount: number;
  myRating: number | null;
}

export interface RatedStreamsResponse {
  streams: RatedStream[];
  policy: "single-vote-no-update";
  viewerScope: "browser-device";
}

export interface SubmitRatingSuccess {
  streamId: string;
  ratingAvg: number | null;
  ratingCount: number;
  myRating: number | null;
  policy: "single-vote-no-update";
}

export interface SubmitRatingConflict extends SubmitRatingSuccess {
  error: string;
}
