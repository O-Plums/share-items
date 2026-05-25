import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAdminEmails, isAdminEmail } from "@/lib/admin-access";

const ORIGINAL_ADMIN_EMAILS = process.env.ADMIN_EMAILS;

describe("admin-access", () => {
  beforeEach(() => {
    delete process.env.ADMIN_EMAILS;
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = ORIGINAL_ADMIN_EMAILS;
  });

  describe("getAdminEmails", () => {
    it("returns an empty array when ADMIN_EMAILS is unset", () => {
      expect(getAdminEmails()).toEqual([]);
    });

    it("trims, lowercases and removes empty entries", () => {
      process.env.ADMIN_EMAILS = "  Foo@Bar.com , ,baz@qux.io ,  ";
      expect(getAdminEmails()).toEqual(["foo@bar.com", "baz@qux.io"]);
    });
  });

  describe("isAdminEmail", () => {
    it("returns false for null/undefined/empty", () => {
      process.env.ADMIN_EMAILS = "a@b.com";
      expect(isAdminEmail(null)).toBe(false);
      expect(isAdminEmail(undefined)).toBe(false);
      expect(isAdminEmail("")).toBe(false);
    });

    it("matches admin email regardless of case and whitespace", () => {
      process.env.ADMIN_EMAILS = "alice@example.com";
      expect(isAdminEmail("alice@example.com")).toBe(true);
      expect(isAdminEmail("Alice@Example.com")).toBe(true);
      expect(isAdminEmail("  alice@example.com  ")).toBe(true);
    });

    it("does not match unknown emails", () => {
      process.env.ADMIN_EMAILS = "alice@example.com";
      expect(isAdminEmail("bob@example.com")).toBe(false);
    });
  });
});
