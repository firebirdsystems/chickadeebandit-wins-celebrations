SELECT
  w.id,
  w.author_id,
  w.title,
  w.body,
  w.category,
  w.created_at
FROM wins w
WHERE w.household_id = current_setting('app.household_id', true)::uuid
ORDER BY w.created_at DESC
LIMIT 50