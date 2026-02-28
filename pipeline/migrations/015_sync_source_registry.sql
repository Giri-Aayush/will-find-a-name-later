-- 015_sync_source_registry.sql
-- Sync source_registry with sources.ts for production.
--
-- Fixes three categories of drift that accumulate when sources.ts is updated
-- without a corresponding DB migration:
--
-- 1. Stale / removed sources that may still have is_active = true
-- 2. Renamed source IDs where the old row was never deactivated
-- 3. NULL api_type values from sources seeded before api_type constraints existed

-- ── Deactivate removed and renamed sources ────────────────────────────────────

UPDATE source_registry
SET is_active = false
WHERE id IN (
  'weekinethereum.substack.com',  -- Discontinued Jan 2025 (final issue published)
  'blog.openzeppelin.com',         -- Old ID — renamed to www.openzeppelin.com
  'nethermind.io/blog'             -- Old ID — renamed to www.nethermind.io
);

-- ── Fix NULL api_type values from pre-constraint seeding ─────────────────────
-- These sources were inserted before migrations 002 and 009 added api_type
-- constraints. The pipeline workaround in db/sources.ts (SOURCE_ID_FILTERS)
-- can be removed once these values are corrected here.

UPDATE source_registry
SET api_type = 'rest_api'
WHERE id IN (
  'defillama.com/chains',
  'defillama.com/stablecoins',
  'defillama.com/dexs'
) AND api_type IS NULL;

UPDATE source_registry
SET api_type = 'cryptopanic'
WHERE id IN (
  'cryptopanic.com/trending',
  'cryptopanic.com/hot',
  'cryptopanic.com/rising'
) AND api_type IS NULL;

UPDATE source_registry
SET api_type = 'crypto_news_api'
WHERE id = 'cryptocurrency.cv/news'
AND api_type IS NULL;
