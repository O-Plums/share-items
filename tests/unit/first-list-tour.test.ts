import { beforeEach, describe, expect, it } from "vitest";
import {
  FIRST_LIST_TOUR_KEY,
  ITEM_TOUR_KEY,
  clearFirstListTourDone,
  driverProgressText,
  isFirstListTourDone,
  isItemTourDone,
  markFirstListTourDone,
  markItemTourDone,
} from "@/lib/first-list-tour";

describe("first-list-tour", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("driverProgressText", () => {
    it("returns French template with raw {{current}} / {{total}} placeholders", () => {
      const text = driverProgressText("fr");
      expect(text).toBe("{{current}} sur {{total}}");
      expect(text).toContain("{{current}}");
      expect(text).toContain("{{total}}");
    });

    it("returns English template", () => {
      expect(driverProgressText("en")).toBe("{{current}} of {{total}}");
    });
  });

  describe("first list tour state", () => {
    it("starts as not done", () => {
      expect(isFirstListTourDone()).toBe(false);
    });

    it("is done after marking", () => {
      markFirstListTourDone();
      expect(isFirstListTourDone()).toBe(true);
      expect(window.localStorage.getItem(FIRST_LIST_TOUR_KEY)).toBe("1");
    });

    it("clearFirstListTourDone resets BOTH the list and the item tour", () => {
      markFirstListTourDone();
      markItemTourDone();
      clearFirstListTourDone();
      expect(isFirstListTourDone()).toBe(false);
      expect(isItemTourDone()).toBe(false);
      expect(window.localStorage.getItem(FIRST_LIST_TOUR_KEY)).toBeNull();
      expect(window.localStorage.getItem(ITEM_TOUR_KEY)).toBeNull();
    });
  });

  describe("item tour state", () => {
    it("is independent of the list tour", () => {
      markFirstListTourDone();
      expect(isItemTourDone()).toBe(false);

      markItemTourDone();
      expect(isItemTourDone()).toBe(true);
      expect(isFirstListTourDone()).toBe(true);
    });
  });
});
