export { AVATAR_COLORS, memberColor, initial, esc, isAdult, formatRelativeDate } from "./shared.js";

export const VALID_EMOJIS = ["🎉", "🔥", "❤️", "👏", "⭐"];
export const CATEGORIES = ["grade", "goal", "milestone", "other"];

export function categoryLabel(category) {
  return { grade: "Grade", goal: "Goal", milestone: "Milestone", other: "Win" }[category] ?? "Win";
}

export function sortWinsByDate(wins) {
  return [...wins].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function reactionSummary(reactions, winId) {
  const summary = {};
  for (const r of reactions) {
    if (r.win_id !== winId) continue;
    summary[r.emoji] = (summary[r.emoji] ?? 0) + 1;
  }
  return summary;
}

export function memberReacted(reactions, winId, memberId, emoji) {
  return reactions.some(r => r.win_id === winId && r.member_id === memberId && r.emoji === emoji);
}

export function reactionsForWin(reactions, winId) {
  return reactions.filter(r => r.win_id === winId);
}

export function commentsForWin(comments, winId) {
  return comments.filter(c => c.win_id === winId);
}

// Writes are owner-only server-side (wins/win_comments policies have no privileged
// group), so only the author may delete. Keep these gates in sync with the policy —
// granting adults a delete button they'd get a silent 403 on is misleading UX.
export function canDeleteWin(win, me) {
  if (!me) return false;
  return me.id === win.author_id;
}

export function canDeleteComment(comment, me) {
  if (!me) return false;
  return me.id === comment.author_id;
}
