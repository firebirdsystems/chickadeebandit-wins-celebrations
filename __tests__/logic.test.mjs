import { describe, it, expect } from "vitest";
import {
  VALID_EMOJIS, CATEGORIES, categoryLabel,
  sortWinsByDate, reactionSummary, memberReacted,
  commentsForWin, canDeleteWin, canDeleteComment,
  esc, memberColor, initial, AVATAR_COLORS, isAdult,
} from "../src/logic.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────
function makeWin(overrides = {}) {
  return {
    id: "win-1",
    author_id: "m1",
    title: "Got an A!",
    body: "",
    category: "grade",
    created_at: "2026-01-01T10:00:00.000Z",
    ...overrides,
  };
}

function makeReaction(overrides = {}) {
  return { id: "r1", win_id: "win-1", member_id: "m1", emoji: "🎉", ...overrides };
}

function makeComment(overrides = {}) {
  return { id: "c1", win_id: "win-1", author_id: "m1", body: "So proud!", created_at: "2026-01-01T11:00:00.000Z", ...overrides };
}

const ADULT = { id: "m1", name: "Alex", role: "adult" };
const CHILD = { id: "m2", name: "Sam",  role: "child" };

// ── VALID_EMOJIS / CATEGORIES ─────────────────────────────────────────────────
describe("VALID_EMOJIS", () => {
  it("contains exactly 5 emojis", () => {
    expect(VALID_EMOJIS).toHaveLength(5);
  });

  it("includes 🎉 and 🔥", () => {
    expect(VALID_EMOJIS).toContain("🎉");
    expect(VALID_EMOJIS).toContain("🔥");
  });
});

describe("CATEGORIES", () => {
  it("contains grade, goal, milestone, other", () => {
    expect(CATEGORIES).toContain("grade");
    expect(CATEGORIES).toContain("goal");
    expect(CATEGORIES).toContain("milestone");
    expect(CATEGORIES).toContain("other");
  });
});

// ── categoryLabel ─────────────────────────────────────────────────────────────
describe("categoryLabel", () => {
  it("returns Grade for grade", () => expect(categoryLabel("grade")).toBe("Grade"));
  it("returns Goal for goal",   () => expect(categoryLabel("goal")).toBe("Goal"));
  it("returns Milestone",       () => expect(categoryLabel("milestone")).toBe("Milestone"));
  it("returns Win for other",   () => expect(categoryLabel("other")).toBe("Win"));
  it("returns Win for unknown", () => expect(categoryLabel("??")).toBe("Win"));
});

// ── sortWinsByDate ────────────────────────────────────────────────────────────
describe("sortWinsByDate", () => {
  it("sorts newest first", () => {
    const wins = [
      makeWin({ id: "w1", created_at: "2026-01-01T08:00:00.000Z" }),
      makeWin({ id: "w2", created_at: "2026-01-01T12:00:00.000Z" }),
      makeWin({ id: "w3", created_at: "2026-01-01T10:00:00.000Z" }),
    ];
    const sorted = sortWinsByDate(wins);
    expect(sorted.map(w => w.id)).toEqual(["w2", "w3", "w1"]);
  });

  it("does not mutate the original array", () => {
    const wins = [
      makeWin({ id: "w1", created_at: "2026-01-01T08:00:00.000Z" }),
      makeWin({ id: "w2", created_at: "2026-01-01T12:00:00.000Z" }),
    ];
    const original = [...wins];
    sortWinsByDate(wins);
    expect(wins[0].id).toBe(original[0].id);
  });

  it("returns empty array unchanged", () => {
    expect(sortWinsByDate([])).toEqual([]);
  });
});

// ── reactionSummary ───────────────────────────────────────────────────────────
describe("reactionSummary", () => {
  it("counts reactions per emoji for a win", () => {
    const reactions = [
      makeReaction({ emoji: "🎉", member_id: "m1" }),
      makeReaction({ id: "r2", emoji: "🎉", member_id: "m2" }),
      makeReaction({ id: "r3", emoji: "🔥", member_id: "m1" }),
    ];
    const summary = reactionSummary(reactions, "win-1");
    expect(summary["🎉"]).toBe(2);
    expect(summary["🔥"]).toBe(1);
    expect(summary["❤️"]).toBeUndefined();
  });

  it("returns empty object when no reactions for win", () => {
    const reactions = [makeReaction({ win_id: "win-2" })];
    expect(reactionSummary(reactions, "win-1")).toEqual({});
  });

  it("returns empty object for empty reactions array", () => {
    expect(reactionSummary([], "win-1")).toEqual({});
  });

  it("ignores reactions for other wins", () => {
    const reactions = [
      makeReaction({ win_id: "win-2", emoji: "🎉" }),
      makeReaction({ win_id: "win-1", emoji: "⭐" }),
    ];
    const summary = reactionSummary(reactions, "win-1");
    expect(Object.keys(summary)).toEqual(["⭐"]);
  });
});

// ── memberReacted ─────────────────────────────────────────────────────────────
describe("memberReacted", () => {
  const reactions = [
    makeReaction({ win_id: "win-1", member_id: "m1", emoji: "🎉" }),
    makeReaction({ id: "r2", win_id: "win-1", member_id: "m2", emoji: "🔥" }),
  ];

  it("returns true when member reacted with that emoji", () => {
    expect(memberReacted(reactions, "win-1", "m1", "🎉")).toBe(true);
  });

  it("returns false when member reacted with different emoji", () => {
    expect(memberReacted(reactions, "win-1", "m1", "🔥")).toBe(false);
  });

  it("returns false when member has not reacted at all", () => {
    expect(memberReacted(reactions, "win-1", "m3", "🎉")).toBe(false);
  });

  it("returns false for a different win", () => {
    expect(memberReacted(reactions, "win-2", "m1", "🎉")).toBe(false);
  });
});

// ── commentsForWin ────────────────────────────────────────────────────────────
describe("commentsForWin", () => {
  const comments = [
    makeComment({ id: "c1", win_id: "win-1" }),
    makeComment({ id: "c2", win_id: "win-1" }),
    makeComment({ id: "c3", win_id: "win-2" }),
  ];

  it("returns only comments for the given win", () => {
    const result = commentsForWin(comments, "win-1");
    expect(result).toHaveLength(2);
    expect(result.map(c => c.id)).toEqual(["c1", "c2"]);
  });

  it("returns empty array when no comments for win", () => {
    expect(commentsForWin(comments, "win-3")).toEqual([]);
  });
});

// ── canDeleteWin ──────────────────────────────────────────────────────────────
describe("canDeleteWin", () => {
  it("returns true for the win author", () => {
    expect(canDeleteWin(makeWin({ author_id: "m2" }), CHILD)).toBe(true);
  });

  it("returns false for an adult who is not the author", () => {
    // Writes are owner-only server-side (no privileged group), so adults cannot
    // delete another member's win — the gate must mirror that.
    expect(canDeleteWin(makeWin({ author_id: "m2" }), ADULT)).toBe(false);
  });

  it("returns false for a non-author child", () => {
    expect(canDeleteWin(makeWin({ author_id: "m1" }), CHILD)).toBe(false);
  });

  it("returns false when ME is null", () => {
    expect(canDeleteWin(makeWin(), null)).toBe(false);
  });
});

// ── canDeleteComment ──────────────────────────────────────────────────────────
describe("canDeleteComment", () => {
  it("returns true for the comment author", () => {
    expect(canDeleteComment(makeComment({ author_id: "m2" }), CHILD)).toBe(true);
  });

  it("returns false for an adult who is not the author", () => {
    // Owner-only writes: adults cannot delete another member's comment.
    expect(canDeleteComment(makeComment({ author_id: "m2" }), ADULT)).toBe(false);
  });

  it("returns false for a non-author child", () => {
    expect(canDeleteComment(makeComment({ author_id: "m1" }), CHILD)).toBe(false);
  });

  it("returns false when ME is null", () => {
    expect(canDeleteComment(makeComment(), null)).toBe(false);
  });
});

// ── esc ───────────────────────────────────────────────────────────────────────
describe("esc", () => {
  it("escapes & < > and \"", () => {
    expect(esc('A & B < C > D "E"')).toBe("A &amp; B &lt; C &gt; D &quot;E&quot;");
  });

  it("returns string unchanged when no special chars", () => {
    expect(esc("hello world")).toBe("hello world");
  });

  it("coerces non-strings to string", () => {
    expect(esc(42)).toBe("42");
  });
});

// ── memberColor ───────────────────────────────────────────────────────────────
describe("memberColor", () => {
  it("returns a color from AVATAR_COLORS", () => {
    expect(AVATAR_COLORS).toContain(memberColor("member-1"));
  });

  it("is deterministic", () => {
    expect(memberColor("abc")).toBe(memberColor("abc"));
  });
});

// ── initial ───────────────────────────────────────────────────────────────────
describe("initial", () => {
  it("returns first char uppercased", () => {
    expect(initial("alice")).toBe("A");
  });

  it("returns ? for empty string", () => {
    expect(initial("")).toBe("?");
  });
});

// ── isAdult ───────────────────────────────────────────────────────────────────
describe("isAdult", () => {
  it("returns true for adult role", () => expect(isAdult(ADULT)).toBe(true));
  it("returns false for child role", () => expect(isAdult(CHILD)).toBe(false));
  it("returns false for null", () => expect(isAdult(null)).toBe(false));
});
