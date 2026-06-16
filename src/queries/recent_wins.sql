SELECT
  w.id,
  w.author_id,
  w.title,
  w.body,
  w.category,
  w.created_at
FROM app_wins_celebrations__wins w
ORDER BY w.created_at DESC
LIMIT 50