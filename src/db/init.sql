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
