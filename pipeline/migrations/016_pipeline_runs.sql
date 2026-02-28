-- 016_pipeline_runs.sql
-- Track pipeline execution for concurrency locking and run history.
-- Prevents overlapping runs from creating duplicate cards.

CREATE TABLE IF NOT EXISTS pipeline_runs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  status        text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz,
  items_fetched integer,
  cards_created integer,
  cards_skipped integer,
  cards_failed  integer,
  error_message text,
  runner_id     text  -- GitHub Actions run ID or hostname for debugging
);

-- Index for lock checks: find active runs quickly
CREATE INDEX idx_pipeline_runs_active ON pipeline_runs (status, started_at)
  WHERE status = 'running';

-- Auto-expire stale locks: if a run has been 'running' for >45 minutes,
-- it's considered dead (crashed without cleanup). A scheduled job or
-- the next pipeline run will ignore it.
