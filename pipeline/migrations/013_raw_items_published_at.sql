-- Add published_at to raw_items so the pipeline preserves the real
-- publication date extracted by each fetcher instead of using fetched_at.
-- Falls back to fetched_at when the source doesn't provide a date.

ALTER TABLE raw_items
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Backfill: set existing rows to fetched_at (best available approximation)
UPDATE raw_items SET published_at = fetched_at WHERE published_at IS NULL;
