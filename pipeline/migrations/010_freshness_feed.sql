-- Improve feed freshness: add max_age_days parameter and fetched_at tiebreaker
-- Cards fetched more recently rank higher when published_at is the same

CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_user_id          TEXT,
  p_limit            INT DEFAULT 20,
  p_category         TEXT DEFAULT NULL,
  p_cursor_seen      BOOLEAN DEFAULT NULL,
  p_cursor_published TIMESTAMPTZ DEFAULT NULL,
  p_max_age_days     INT DEFAULT 7
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
    AND c.published_at > NOW() - (p_max_age_days || ' days')::INTERVAL
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
    (cv.user_id IS NOT NULL) ASC,   -- unseen first, seen second
    c.published_at DESC,             -- newest articles first
    c.fetched_at DESC                -- within same published_at, most recently fetched first
  LIMIT p_limit;
$$;
