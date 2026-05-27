import { describe, expect, it } from "vitest";
import {
  legacyAliases,
  palette,
  phoneFrameBoxShadow,
  semantic,
  tailwindColors,
  type ColorScale,
} from "@/lib/colors";

const REQUIRED_STEPS: Array<keyof ColorScale> = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
];

const isHex = (v: unknown): v is string =>
  typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

describe("palette", () => {
  it("exports the six named palettes", () => {
    expect(Object.keys(palette).sort()).toEqual([
      "amber",
      "emerald",
      "pink",
      "red",
      "rose",
      "sky",
    ]);
  });

  it("every palette has the full 50→900 scale, all valid hex", () => {
    for (const [name, scale] of Object.entries(palette)) {
      for (const step of REQUIRED_STEPS) {
        const value = (scale as ColorScale)[step];
        expect(isHex(value), `${name}-${step} should be a hex literal, got ${String(value)}`).toBe(true);
      }
    }
  });
});

describe("semantic aliases", () => {
  it("exposes primary / secondary / success / danger / warning / no", () => {
    expect(Object.keys(semantic).sort()).toEqual([
      "danger",
      "no",
      "primary",
      "secondary",
      "success",
      "warning",
    ]);
  });

  it("`primary` points to the brand pink", () => {
    expect(semantic.primary).toBe(palette.pink);
    expect(semantic.primary[500]).toBe("#f43568");
  });

  it("`secondary` points to the voter sky", () => {
    expect(semantic.secondary).toBe(palette.sky);
    expect(semantic.secondary[500]).toBe("#0ea5e9");
  });

  it("`success` points to emerald, `danger` to red, `warning` to amber, `no` to rose", () => {
    expect(semantic.success).toBe(palette.emerald);
    expect(semantic.danger).toBe(palette.red);
    expect(semantic.warning).toBe(palette.amber);
    expect(semantic.no).toBe(palette.rose);
  });
});

describe("legacy aliases", () => {
  it("`brand` still resolves to the same pink as `primary`", () => {
    expect(legacyAliases.brand).toBe(palette.pink);
    expect(legacyAliases.brand).toBe(semantic.primary);
  });

  it("`voter` still resolves to the same sky as `secondary`", () => {
    expect(legacyAliases.voter).toBe(palette.sky);
    expect(legacyAliases.voter).toBe(semantic.secondary);
  });
});

describe("tailwindColors export", () => {
  it("merges semantic and legacy aliases", () => {
    expect(Object.keys(tailwindColors).sort()).toEqual([
      "brand",
      "danger",
      "no",
      "primary",
      "secondary",
      "success",
      "voter",
      "warning",
    ]);
  });

  it("every entry has the full 50→900 scale", () => {
    for (const [name, scale] of Object.entries(tailwindColors)) {
      for (const step of REQUIRED_STEPS) {
        expect(
          (scale as ColorScale)[step],
          `tailwindColors.${name}-${step} missing`,
        ).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
});

describe("phoneFrameBoxShadow", () => {
  it("derives rgba from primary (brand) and secondary (voter) tokens", () => {
    expect(phoneFrameBoxShadow("brand")).toBe(
      `0 24px 48px -12px rgba(244, 53, 104, 0.25)`,
    );
    expect(phoneFrameBoxShadow("voter")).toBe(
      `0 24px 48px -12px rgba(14, 165, 233, 0.25)`,
    );
    expect(phoneFrameBoxShadow()).toBe(phoneFrameBoxShadow("brand"));
  });
});
