export interface StreamRatingRow {
  id: string;
  started_at: string;
  duration_hours: string | number;
  title: string | null;
  stream_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  rating_avg: string | number | null;
  rating_count: number | string;
  my_rating: number | null;
}

export interface StreamRatingSummaryRow {
  rating_avg: string | number | null;
  rating_count: number | string;
  my_rating: number | null;
}

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

export interface NormalizedStreamRatingInput {
  streamId: number;
  rating: number;
}
