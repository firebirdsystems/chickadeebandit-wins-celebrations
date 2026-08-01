// Imported as well as re-exported: `export … from` re-publishes the binding
// without introducing it into this module's scope, and canDeleteWin below needs
// to call isAdult.
import { isAdult } from "./shared.js";
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

// Authors may always delete their own; adults may also moderate anyone's.
//
// `wins` previously carried `write_owner_only: true`, which removed the adult
// bypass entirely — so in a board children post to, a parent could not take
// anything down, and content from a member who had since left the household
// could never be deleted by anyone at all. Dropping the flag restores the
// platform default (adults supervise; in a shared space, the steward does),
// and `win_comments` inherits its parent's rules.
//
// Keep these gates in sync with the policy — a delete button that earns a
// silent 403 is worse than no button.
export function canDeleteWin(win, me) {
  if (!me) return false;
  return me.id === win.author_id || isAdult(me);
}

export function canDeleteComment(comment, me) {
  if (!me) return false;
  return me.id === comment.author_id || isAdult(me);
}

/**
 * Fields the in-app search matches against (see hub-sdk `searchMatch`).
 * The body is the win — the title is often just "Passed!" and the
 * story is underneath it.
 */
export function searchableFields(item) {
  return [item.title, item.body, item.category];
}
