import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins string parts with a space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores false/null/undefined", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns an empty string for no truthy parts", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
