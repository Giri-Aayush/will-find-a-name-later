-- Auto-increment cards.flag_count when a new flag is inserted
CREATE OR REPLACE FUNCTION increment_flag_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cards SET flag_count = flag_count + 1 WHERE id = NEW.card_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_flag_count
  AFTER INSERT ON flags
  FOR EACH ROW
  EXECUTE FUNCTION increment_flag_count();
