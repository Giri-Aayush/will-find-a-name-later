-- Reactions table: thumbs up/down on cards
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (card_id, user_id)
);

CREATE INDEX idx_reactions_card_id ON reactions(card_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);

-- Add reaction counts to cards table for fast reads
ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS reaction_up_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reaction_down_count INTEGER NOT NULL DEFAULT 0;
