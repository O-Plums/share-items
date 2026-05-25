import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  CATEGORY_KEYS,
  ROOMS,
  ROOM_KEYS,
  VOTE_VALUES,
  getCategory,
  getRoom,
  isValidCategory,
  isValidRoom,
  isValidVoteValue,
} from "@/lib/taxonomies";

describe("taxonomies", () => {
  describe("rooms", () => {
    it("exposes consistent keys and metadata", () => {
      expect(ROOMS.length).toBe(ROOM_KEYS.length);
      for (const r of ROOMS) {
        expect(r.label.length).toBeGreaterThan(0);
        expect(r.emoji.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("isValidRoom matches known keys only", () => {
      expect(isValidRoom("kitchen")).toBe(true);
      expect(isValidRoom("Kitchen")).toBe(false);
      expect(isValidRoom("unknown")).toBe(false);
      expect(isValidRoom("")).toBe(false);
    });

    it("getRoom returns the matching entry or undefined", () => {
      expect(getRoom("kitchen")?.label).toBe("Cuisine");
      expect(getRoom("unknown")).toBeUndefined();
    });
  });

  describe("categories", () => {
    it("exposes consistent keys and metadata", () => {
      expect(CATEGORIES.length).toBe(CATEGORY_KEYS.length);
    });

    it("isValidCategory matches known keys only", () => {
      expect(isValidCategory("furniture")).toBe(true);
      expect(isValidCategory("FURNITURE")).toBe(false);
      expect(isValidCategory("vehicle")).toBe(false);
    });

    it("getCategory returns the matching entry or undefined", () => {
      expect(getCategory("electronics")?.emoji).toBe("📺");
      expect(getCategory("nope")).toBeUndefined();
    });
  });

  describe("votes", () => {
    it("only accepts YES / NO", () => {
      expect(VOTE_VALUES).toEqual(["YES", "NO"]);
      expect(isValidVoteValue("YES")).toBe(true);
      expect(isValidVoteValue("NO")).toBe(true);
      expect(isValidVoteValue("yes")).toBe(false);
      expect(isValidVoteValue("MAYBE")).toBe(false);
      expect(isValidVoteValue("")).toBe(false);
    });
  });
});
