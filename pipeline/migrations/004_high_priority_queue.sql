CREATE TABLE IF NOT EXISTS high_priority_queue (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id    UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  category   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consumed   BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_hpq_unconsumed
  ON high_priority_queue(consumed) WHERE consumed = false;
