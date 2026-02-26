-- EthPulse Initial Schema
-- Applied to Supabase PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Source registry: defines all data sources and their polling config
CREATE TABLE IF NOT EXISTS source_registry (
  id               TEXT PRIMARY KEY,
  display_name     TEXT NOT NULL,
  base_url         TEXT NOT NULL,
  api_type         TEXT CHECK (api_type IN ('discourse', 'github_api', 'rss', 'graphql', 'html_scraper')),
  poll_interval_s  INTEGER NOT NULL,
  default_category TEXT NOT NULL CHECK (default_category IN (
    'RESEARCH', 'EIP_ERC', 'PROTOCOL_CALLS', 'GOVERNANCE',
    'UPGRADE', 'ANNOUNCEMENT', 'METRICS', 'SECURITY'
  )),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  last_polled_at   TIMESTAMPTZ
);

-- Raw items: verbatim content from sources before processing
CREATE TABLE IF NOT EXISTS raw_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id        TEXT NOT NULL REFERENCES source_registry(id),
  canonical_url    TEXT UNIQUE NOT NULL,
  raw_title        TEXT,
  raw_text         TEXT,
  raw_metadata     JSONB,
  fetched_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed        BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_raw_items_source_id ON raw_items(source_id);
CREATE INDEX IF NOT EXISTS idx_raw_items_unprocessed ON raw_items(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_raw_items_fetched_at ON raw_items(fetched_at);

-- Cards: processed, summarized content shown to users
CREATE TABLE IF NOT EXISTS cards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id        TEXT NOT NULL REFERENCES source_registry(id),
  canonical_url    TEXT UNIQUE NOT NULL,
  url_hash         CHAR(64) NOT NULL,
  category         TEXT NOT NULL CHECK (category IN (
    'RESEARCH', 'EIP_ERC', 'PROTOCOL_CALLS', 'GOVERNANCE',
    'UPGRADE', 'ANNOUNCEMENT', 'METRICS', 'SECURITY'
  )),
  headline         TEXT NOT NULL,
  summary          TEXT NOT NULL,
  author           TEXT,
  published_at     TIMESTAMPTZ NOT NULL,
  fetched_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  engagement       JSONB,
  flag_count       INTEGER NOT NULL DEFAULT 0,
  is_suspended     BOOLEAN NOT NULL DEFAULT false,
  pipeline_version TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cards_url_hash ON cards(url_hash);
CREATE INDEX IF NOT EXISTS idx_cards_source_id ON cards(source_id);
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_published_at ON cards(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_active ON cards(published_at DESC) WHERE is_suspended = false;

-- Flags: user-reported issues with cards
CREATE TABLE IF NOT EXISTS flags (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id          UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  reported_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason           TEXT,
  resolved         BOOLEAN NOT NULL DEFAULT false,
  resolution       TEXT
);

CREATE INDEX IF NOT EXISTS idx_flags_card_id ON flags(card_id);
CREATE INDEX IF NOT EXISTS idx_flags_unresolved ON flags(resolved) WHERE resolved = false;
