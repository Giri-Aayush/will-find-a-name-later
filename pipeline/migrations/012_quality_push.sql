-- Add quality scoring column to cards + push notification subscriptions table

-- 1. Quality score on cards (0.0 – 1.0, NULL for legacy cards)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS quality_score REAL DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_cards_quality ON cards(quality_score)
  WHERE quality_score IS NOT NULL;

-- 2. Push notification subscriptions (for future push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL,
  endpoint   TEXT NOT NULL UNIQUE,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_sub_user ON push_subscriptions(user_id);
