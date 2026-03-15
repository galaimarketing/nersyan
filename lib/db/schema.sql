-- Run this once in your Postgres (Neon/Vercel) to create the app data table.
-- Stores admin data and settings as JSON blobs keyed by name.

CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'
);

-- Seed default keys so we can upsert
INSERT INTO app_data (key, value) VALUES
  ('admin_data', '{"bookings":[],"guests":[],"rooms":[],"blogPosts":[],"media":[],"notifications":[]}'::jsonb),
  ('settings', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;
