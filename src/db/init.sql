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
