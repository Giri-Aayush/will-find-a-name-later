-- Expand api_type constraint to include all fetcher types
-- Also backfill null api_type values from Tier 6 & 7 sources

ALTER TABLE source_registry
  DROP CONSTRAINT IF EXISTS source_registry_api_type_check;

ALTER TABLE source_registry
  ADD CONSTRAINT source_registry_api_type_check
  CHECK (api_type IN (
    'discourse', 'github_api', 'rss', 'graphql', 'html_scraper',
    'rest_api', 'cryptopanic', 'crypto_news_api'
  ));

-- Backfill nulls (these were inserted before constraint was updated)
UPDATE source_registry SET api_type = 'rest_api'        WHERE id LIKE 'defillama.com/%' AND api_type IS NULL;
UPDATE source_registry SET api_type = 'cryptopanic'     WHERE id LIKE 'cryptopanic.com/%' AND api_type IS NULL;
UPDATE source_registry SET api_type = 'crypto_news_api' WHERE id = 'cryptocurrency.cv/news' AND api_type IS NULL;
