import { describe, expect, it } from "vitest";
import { defaultLocale, isLocale, locales } from "@/i18n/config";

describe("i18n/config", () => {
  it("declares fr and en (in that order, fr is default)", () => {
    expect(locales).toEqual(["fr", "en"]);
    expect(defaultLocale).toBe("fr");
  });

  it("isLocale only accepts fr or en", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("FR")).toBe(false);
    expect(isLocale("es")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
