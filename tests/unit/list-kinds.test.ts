import { describe, expect, it } from "vitest";
import {
  LIST_KINDS,
  LIST_KIND_KEYS,
  getListKind,
  isValidListKind,
} from "@/lib/list-kinds";

describe("list-kinds", () => {
  it("exposes the 4 expected kinds", () => {
    expect(LIST_KIND_KEYS).toEqual(["keep", "donate", "sell", "custom"]);
  });

  describe("isValidListKind", () => {
    it("accepts known keys", () => {
      for (const key of LIST_KIND_KEYS) {
        expect(isValidListKind(key)).toBe(true);
      }
    });

    it("rejects unknown keys", () => {
      expect(isValidListKind("")).toBe(false);
      expect(isValidListKind("KEEP")).toBe(false);
      expect(isValidListKind("recycle")).toBe(false);
    });
  });

  describe("getListKind", () => {
    it("returns the matching entry for a known key", () => {
      const k = getListKind("donate");
      expect(k.key).toBe("donate");
      expect(k.emoji).toBe("🎁");
    });

    it("falls back to the custom kind for unknown keys", () => {
      expect(getListKind("unknown").key).toBe("custom");
      expect(getListKind("").key).toBe("custom");
    });

    it("guarantees a label and a tailwind color for every kind", () => {
      for (const kind of LIST_KINDS) {
        expect(kind.label.length).toBeGreaterThan(0);
        expect(kind.color).toMatch(/bg-/);
      }
    });
  });
});
