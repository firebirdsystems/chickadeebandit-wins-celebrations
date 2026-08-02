-- Automation support for the `post_win` action.
--
-- `source_event_id` records which app event produced the row. The dispatcher's
-- dedupe guard matches on it (SELECT 1 FROM ... WHERE source_event_id = ?
-- LIMIT 1), so a redelivered event does not celebrate the same achievement
-- twice on the wall.
--
-- Nullable on purpose: wins posted by a person have no source event, and the
-- guard only ever looks for a specific non-null id.
ALTER TABLE app_wins_celebrations__wins ADD COLUMN source_event_id TEXT;

CREATE INDEX IF NOT EXISTS app_wins_celebrations__wins_source_event_idx
  ON app_wins_celebrations__wins (source_event_id);
