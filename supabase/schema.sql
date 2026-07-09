CREATE TABLE IF NOT EXISTS travel_memos (
  day_slug TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS travel_days (
  slug TEXT PRIMARY KEY,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  accent_gradient TEXT,
  memo_placeholder TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS travel_day_items (
  id SERIAL PRIMARY KEY,
  day_slug TEXT NOT NULL REFERENCES travel_days(slug) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  time_label TEXT,
  title TEXT NOT NULL,
  info_lines TEXT[] NOT NULL DEFAULT '{}',
  memo_lines TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (day_slug, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_travel_day_items_day_slug
  ON travel_day_items(day_slug);
