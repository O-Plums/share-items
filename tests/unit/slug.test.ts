import { describe, expect, it } from "vitest";
import { generateSlug } from "@/lib/slug";

const SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";

describe("generateSlug", () => {
  it("returns an 8-character string", () => {
    const slug = generateSlug();
    expect(slug).toHaveLength(8);
  });

  it("only uses the URL-safe non-ambiguous alphabet (no 0/1/l/o/O/I)", () => {
    for (let i = 0; i < 50; i++) {
      const slug = generateSlug();
      for (const char of slug) {
        expect(SLUG_ALPHABET).toContain(char);
      }
    }
  });

  it("produces different slugs on consecutive calls", () => {
    const slugs = new Set(Array.from({ length: 100 }, () => generateSlug()));
    expect(slugs.size).toBeGreaterThan(95);
  });
});
