-- Add nethermind_scraper to the api_type check constraint

ALTER TABLE source_registry
  DROP CONSTRAINT IF EXISTS source_registry_api_type_check;

ALTER TABLE source_registry
  ADD CONSTRAINT source_registry_api_type_check
  CHECK (api_type IN (
    'discourse', 'github_api', 'rss', 'graphql', 'html_scraper',
    'rest_api', 'cryptopanic', 'crypto_news_api',
    'rekt_scraper', 'paradigm_scraper', 'hackmd_scraper',
    'nethermind_scraper'
  ));
