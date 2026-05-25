import { describe, expect, it } from "vitest";
import { interpolateLegal, legalVars } from "@/lib/legal";
import frLegal from "../../messages/legal/fr.json";
import enLegal from "../../messages/legal/en.json";

type LegalDoc = {
  title: string;
  subtitle: string;
  sections: { title: string; body: string }[];
};

type LegalFile = {
  common: Record<string, string>;
  cgu: LegalDoc;
  cgv: LegalDoc;
};

const fr = frLegal as unknown as LegalFile;
const en = enLegal as unknown as LegalFile;

describe("legal — interpolateLegal", () => {
  const vars = {
    owner: "Alice",
    email: "alice@example.com",
    appName: "Sort your life",
    siteUrl: "https://sortyourlife.fr",
    lastUpdated: "2026-05-25",
  };

  it("replaces known placeholders", () => {
    expect(interpolateLegal("Contact: {email}", vars)).toBe("Contact: alice@example.com");
    expect(interpolateLegal("Site {appName} à {siteUrl}", vars)).toBe(
      "Site Sort your life à https://sortyourlife.fr",
    );
  });

  it("leaves unknown placeholders intact", () => {
    expect(interpolateLegal("Hello {unknown}", vars)).toBe("Hello {unknown}");
  });

  it("handles multiple occurrences", () => {
    expect(interpolateLegal("{owner} et {owner}", vars)).toBe("Alice et Alice");
  });

  it("returns the input unchanged when no placeholder is present", () => {
    expect(interpolateLegal("nothing to do here", vars)).toBe("nothing to do here");
  });
});

describe("legal — legalVars()", () => {
  it("falls back to a placeholder when env vars are missing", () => {
    const vars = legalVars();
    expect(typeof vars.owner).toBe("string");
    expect(typeof vars.email).toBe("string");
    expect(vars.appName.length).toBeGreaterThan(0);
    expect(vars.siteUrl).toMatch(/^https?:\/\//);
    expect(vars.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("legal — i18n files", () => {
  it("FR and EN expose the same top-level keys", () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(fr.common).sort()).toEqual(Object.keys(en.common).sort());
  });

  it("FR and EN expose the same number of CGU and CGV sections", () => {
    expect(fr.cgu.sections.length).toBe(en.cgu.sections.length);
    expect(fr.cgv.sections.length).toBe(en.cgv.sections.length);
    expect(fr.cgu.sections.length).toBeGreaterThanOrEqual(10);
    expect(fr.cgv.sections.length).toBeGreaterThanOrEqual(10);
  });

  it("uses only known placeholders in section bodies", () => {
    const allowed = new Set(["owner", "email", "appName", "siteUrl", "lastUpdated"]);
    const re = /\{(\w+)\}/g;

    function collect(doc: LegalDoc): string[] {
      const placeholders: string[] = [];
      for (const s of doc.sections) {
        let match: RegExpExecArray | null;
        while ((match = re.exec(s.body)) !== null) placeholders.push(match[1]);
        while ((match = re.exec(s.title)) !== null) placeholders.push(match[1]);
      }
      return placeholders;
    }

    const found = [
      ...collect(fr.cgu),
      ...collect(fr.cgv),
      ...collect(en.cgu),
      ...collect(en.cgv),
    ];
    const unknown = found.filter((p) => !allowed.has(p));
    expect(unknown).toEqual([]);
  });
});
