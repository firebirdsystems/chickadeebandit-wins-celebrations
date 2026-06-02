CREATE TABLE IF NOT EXISTS wins (
  id           TEXT    NOT NULL PRIMARY KEY,
  household_id UUID    NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
  author_id    TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  body         TEXT    NOT NULL DEFAULT '',
  category     TEXT    NOT NULL DEFAULT 'other',
  created_at   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS wins_household_created ON wins (household_id, created_at DESC);

CREATE TABLE IF NOT EXISTS win_reactions (
  id           TEXT    NOT NULL PRIMARY KEY,
  household_id UUID    NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
  win_id       TEXT    NOT NULL REFERENCES wins(id) ON DELETE CASCADE,
  member_id    TEXT    NOT NULL,
  emoji        TEXT    NOT NULL,
  created_at   TEXT    NOT NULL,
  UNIQUE (household_id, win_id, member_id, emoji)
);

CREATE INDEX IF NOT EXISTS win_reactions_win ON win_reactions (win_id);

CREATE TABLE IF NOT EXISTS win_comments (
  id           TEXT    NOT NULL PRIMARY KEY,
  household_id UUID    NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
  win_id       TEXT    NOT NULL REFERENCES wins(id) ON DELETE CASCADE,
  author_id    TEXT    NOT NULL,
  body         TEXT    NOT NULL,
  created_at   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS win_comments_win ON win_comments (win_id)
