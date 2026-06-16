CREATE TABLE IF NOT EXISTS app_wins_celebrations__wins (
  id           TEXT    NOT NULL PRIMARY KEY,
  author_id    TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  body         TEXT    NOT NULL DEFAULT '',
  category     TEXT    NOT NULL DEFAULT 'other',
  created_at   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS wins_household_created ON app_wins_celebrations__wins (created_at DESC);

CREATE TABLE IF NOT EXISTS app_wins_celebrations__win_reactions (
  id           TEXT    NOT NULL PRIMARY KEY,
  win_id       TEXT    NOT NULL REFERENCES app_wins_celebrations__wins(id) ON DELETE CASCADE,
  member_id    TEXT    NOT NULL,
  emoji        TEXT    NOT NULL,
  created_at   TEXT    NOT NULL,
  UNIQUE (win_id, member_id, emoji)
);

CREATE INDEX IF NOT EXISTS win_reactions_win ON app_wins_celebrations__win_reactions (win_id);

CREATE TABLE IF NOT EXISTS app_wins_celebrations__win_comments (
  id           TEXT    NOT NULL PRIMARY KEY,
  win_id       TEXT    NOT NULL REFERENCES app_wins_celebrations__wins(id) ON DELETE CASCADE,
  author_id    TEXT    NOT NULL,
  body         TEXT    NOT NULL,
  created_at   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS win_comments_win ON app_wins_celebrations__win_comments (win_id)
