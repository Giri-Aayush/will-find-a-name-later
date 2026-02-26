-- Add rest_api to the api_type CHECK constraint for DefiLlama metrics sources
ALTER TABLE source_registry
  DROP CONSTRAINT IF EXISTS source_registry_api_type_check;

ALTER TABLE source_registry
  ADD CONSTRAINT source_registry_api_type_check
  CHECK (api_type IN ('discourse', 'github_api', 'rss', 'graphql', 'html_scraper', 'rest_api'));
