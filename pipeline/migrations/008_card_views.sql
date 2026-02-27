-- Track which cards a user has viewed
CREATE TABLE IF NOT EXISTS card_views (
  user_id   TEXT NOT NULL,
  card_id   UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_card_views_user ON card_views(user_id);

-- Personalized feed: unseen cards first, then seen, both by published_at DESC
-- Uses composite cursor (seen, published_at) for pagination across both zones
CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_user_id          TEXT,
  p_limit            INT DEFAULT 20,
  p_category         TEXT DEFAULT NULL,
  p_cursor_seen      BOOLEAN DEFAULT NULL,
  p_cursor_published TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id                  UUID,
  source_id           TEXT,
  canonical_url       TEXT,
  url_hash            CHAR(64),
  category            TEXT,
  headline            TEXT,
  summary             TEXT,
  author              TEXT,
  published_at        TIMESTAMPTZ,
  fetched_at          TIMESTAMPTZ,
  engagement          JSONB,
  flag_count          INTEGER,
  is_suspended        BOOLEAN,
  pipeline_version    TEXT,
  reaction_up_count   INTEGER,
  reaction_down_count INTEGER,
  seen                BOOLEAN
)
LANGUAGE sql STABLE
AS $$
  SELECT
    c.id, c.source_id, c.canonical_url, c.url_hash,
    c.category, c.headline, c.summary, c.author,
    c.published_at, c.fetched_at, c.engagement,
    c.flag_count, c.is_suspended, c.pipeline_version,
    c.reaction_up_count, c.reaction_down_count,
    (cv.user_id IS NOT NULL) AS seen
  FROM cards c
  LEFT JOIN card_views cv ON cv.card_id = c.id AND cv.user_id = p_user_id
  WHERE c.is_suspended = false
    AND (p_category IS NULL OR c.category = p_category)
    AND (
      p_cursor_seen IS NULL
      OR ((cv.user_id IS NOT NULL) > p_cursor_seen)
      OR (
        (cv.user_id IS NOT NULL) = p_cursor_seen
        AND c.published_at < p_cursor_published
      )
    )
  ORDER BY
    (cv.user_id IS NOT NULL) ASC,   -- unseen (false) first, seen (true) second
    c.published_at DESC
  LIMIT p_limit;
$$;
