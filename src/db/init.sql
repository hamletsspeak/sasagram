CREATE TABLE IF NOT EXISTS streams (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL,
  duration_hours NUMERIC(5,2) NOT NULL CHECK (duration_hours >= 0),
  title TEXT,
  stream_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS streams_started_at_unique_idx
ON streams (started_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'streams_started_at_minute_precision_check'
  ) THEN
    ALTER TABLE streams
    ADD CONSTRAINT streams_started_at_minute_precision_check
    CHECK (started_at = date_trunc('minute', started_at));
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS twitch_vods (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  duration TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS twitch_vods_created_at_idx
ON twitch_vods (created_at DESC);

CREATE TABLE IF NOT EXISTS twitch_clips (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  duration_seconds NUMERIC(6,2),
  creator_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS twitch_clips_created_at_idx
ON twitch_clips (created_at DESC);

CREATE TABLE IF NOT EXISTS app_cache_state (
  key TEXT PRIMARY KEY,
  value_text TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stream_ratings (
  id BIGSERIAL PRIMARY KEY,
  stream_id BIGINT NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  viewer_token_hash TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (stream_id, viewer_token_hash)
);

CREATE INDEX IF NOT EXISTS stream_ratings_stream_id_idx
ON stream_ratings (stream_id);
