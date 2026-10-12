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

/**
 * Put back rows an optimistic delete removed, after the hub refused it. Only
 * those rows: the list may have changed while the request was out (another
 * delete that did succeed, a new post), and restoring an earlier copy of the
 * whole list would undo that. Each row goes back beside its old neighbours
 * from `order`, the list as it stood before the delete: straight after the
 * nearest row that used to precede it, or failing that ahead of the first
 * that used to follow. Rows added since keep their place whichever end they
 * were added at; a row already present is left alone.
 */
export function restoreRows(current, removed, order) {
  const rank = new Map(order.map((r, i) => [r.id, i]));
  const out = [...current];
  const back = removed
    .filter(r => !out.some(x => x.id === r.id))
    .sort((x, y) => (rank.get(x.id) ?? Infinity) - (rank.get(y.id) ?? Infinity));
  for (const row of back) {
    const mine = rank.get(row.id) ?? Infinity;
    const prev = out.findLastIndex(x => rank.has(x.id) && rank.get(x.id) < mine);
    const next = out.findIndex(x => rank.has(x.id) && rank.get(x.id) > mine);
    if (prev !== -1) out.splice(prev + 1, 0, row);
    else if (next !== -1) out.splice(next, 0, row);
    else out.push(row);
  }
  return out;
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
// platform default (adults supervise; in a shared space, the steward does).
// `win_comments` does not inherit that: a child table is writer-only unless
// it declares `adults_bypass`, which this app's manifest does.
//
// Keep these gates in sync with the policy — a delete button that changes
// nothing is worse than no button.

/** Supervises wins: every adult in a household, the steward in a shared space. */
export function supervisesWins(me, { tenantKind = "household", isAdmin = false } = {}) {
  return tenantKind === "household" ? isAdult(me) : isAdmin === true;
}

/**
 * Supervises notes on wins. The same people as wins, except in a co-parenting
 * space, where the hub lets neither parent remove what the other wrote.
 */
export function supervisesComments(me, tenant = {}) {
  return tenant.spaceKind !== "coparenting" && supervisesWins(me, tenant);
}

export function canDeleteWin(win, me, tenant) {
  if (!me) return false;
  return me.id === win.author_id || supervisesWins(me, tenant);
}

export function canDeleteComment(comment, me, tenant) {
  if (!me) return false;
  return me.id === comment.author_id || supervisesComments(me, tenant);
}

/**
 * Fields the in-app search matches against (see hub-sdk `searchMatch`).
 * The body is the win — the title is often just "Passed!" and the
 * story is underneath it.
 */
export function searchableFields(item) {
  return [item.title, item.body, item.category];
}
