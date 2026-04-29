import { describe, it, expect } from "vitest";
import {
  PATTERNS,
  DEFAULT_ENABLED,
  mergeEnabled,
  diffEnabled,
  type EnabledMap,
} from "./patterns.js";

const idsOf = (patterns: ReadonlyArray<{ id: string }>): string[] =>
  patterns.map((pattern) => pattern.id);

const allOff: EnabledMap = Object.fromEntries(
  PATTERNS.map((pattern) => [pattern.id, false]),
);

describe("DEFAULT_ENABLED", () => {
  it("turns every pattern on by default", () => {
    for (const pattern of PATTERNS) {
      expect(DEFAULT_ENABLED[pattern.id]).toBe(true);
    }
  });
});

describe("mergeEnabled", () => {
  it("returns defaults when stored is undefined", () => {
    expect(mergeEnabled(undefined)).toEqual(DEFAULT_ENABLED);
  });

  it("returns defaults when stored is empty", () => {
    expect(mergeEnabled({})).toEqual(DEFAULT_ENABLED);
  });

  it("overrides only the keys present in stored", () => {
    const target = PATTERNS[0]!;
    const merged = mergeEnabled({ [target.id]: false });
    expect(merged[target.id]).toBe(false);
    for (const pattern of PATTERNS.slice(1)) {
      expect(merged[pattern.id]).toBe(true);
    }
  });

  it("preserves unknown keys so future pattern ids survive a downgrade", () => {
    const merged = mergeEnabled({ futurePattern: false });
    for (const pattern of PATTERNS) {
      expect(merged[pattern.id]).toBe(true);
    }
    expect(merged.futurePattern).toBe(false);
  });
});

describe("diffEnabled", () => {
  it("returns nothing when prev and next are identical", () => {
    const { toEnable, toDisable } = diffEnabled(DEFAULT_ENABLED, DEFAULT_ENABLED);
    expect(toEnable).toEqual([]);
    expect(toDisable).toEqual([]);
  });

  it("collects every on→off transition into toDisable", () => {
    const { toEnable, toDisable } = diffEnabled(DEFAULT_ENABLED, allOff);
    expect(toEnable).toEqual([]);
    expect(idsOf(toDisable)).toEqual(idsOf(PATTERNS));
  });

  it("collects every off→on transition into toEnable", () => {
    const { toEnable, toDisable } = diffEnabled(allOff, DEFAULT_ENABLED);
    expect(toDisable).toEqual([]);
    expect(idsOf(toEnable)).toEqual(idsOf(PATTERNS));
  });

  it("emits only the patterns whose flag actually changed", () => {
    const target = PATTERNS[0]!;
    const next: EnabledMap = { ...DEFAULT_ENABLED, [target.id]: false };
    const { toEnable, toDisable } = diffEnabled(DEFAULT_ENABLED, next);
    expect(toEnable).toEqual([]);
    expect(idsOf(toDisable)).toEqual([target.id]);
  });

  it("treats missing keys as on (the implicit default)", () => {
    const target = PATTERNS[0]!;
    const prev: EnabledMap = { [target.id]: false };
    const { toEnable, toDisable } = diffEnabled(prev, {});
    expect(toDisable).toEqual([]);
    expect(idsOf(toEnable)).toEqual([target.id]);
  });
});
