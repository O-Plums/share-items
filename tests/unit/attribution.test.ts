import { beforeEach, describe, expect, it } from "vitest";
import {
  ATTRIBUTION_STORAGE_KEY,
  ATTRIBUTION_TTL_MS,
  clearStoredAttribution,
  isAttributionEmpty,
  loadStoredAttribution,
  normalizeReferrer,
  persistAttribution,
  readAttributionFromUrl,
} from "@/lib/attribution";

describe("attribution", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("normalizeReferrer", () => {
    it("returns null when input is empty or invalid", () => {
      expect(normalizeReferrer(null, "sortyourlife.fr")).toBeNull();
      expect(normalizeReferrer("", "sortyourlife.fr")).toBeNull();
      expect(normalizeReferrer("not-a-url", "sortyourlife.fr")).toBeNull();
    });

    it("returns host for external referrer", () => {
      expect(normalizeReferrer("https://www.google.com/search?q=foo", "sortyourlife.fr")).toBe(
        "www.google.com",
      );
    });

    it("strips own host (internal nav doesn't count as acquisition)", () => {
      expect(normalizeReferrer("https://sortyourlife.fr/login", "sortyourlife.fr")).toBeNull();
    });
  });

  describe("readAttributionFromUrl", () => {
    it("returns all-null when URL has no UTMs and no referrer", () => {
      const fields = readAttributionFromUrl("https://sortyourlife.fr/", null);
      expect(isAttributionEmpty(fields)).toBe(true);
    });

    it("parses UTMs and trims values", () => {
      const fields = readAttributionFromUrl(
        "https://sortyourlife.fr/?utm_source=meta&utm_medium=cpc&utm_campaign=demenagement_25",
        null,
      );
      expect(fields.utmSource).toBe("meta");
      expect(fields.utmMedium).toBe("cpc");
      expect(fields.utmCampaign).toBe("demenagement_25");
      expect(fields.landingPath).toBe("/");
    });

    it("captures gclid and fbclid", () => {
      const fields = readAttributionFromUrl(
        "https://sortyourlife.fr/dashboard?gclid=abc&fbclid=xyz",
        null,
      );
      expect(fields.gclid).toBe("abc");
      expect(fields.fbclid).toBe("xyz");
      expect(fields.landingPath).toBe("/dashboard");
    });

    it("ignores referrer pointing to own host", () => {
      const fields = readAttributionFromUrl(
        "https://sortyourlife.fr/login",
        "https://sortyourlife.fr/dashboard",
      );
      expect(fields.referrer).toBeNull();
      expect(isAttributionEmpty(fields)).toBe(true);
    });

    it("captures external referrer as host", () => {
      const fields = readAttributionFromUrl(
        "https://sortyourlife.fr/",
        "https://t.co/abc",
      );
      expect(fields.referrer).toBe("t.co");
    });

    it("returns empty for an invalid URL", () => {
      const fields = readAttributionFromUrl("not-a-url", null);
      expect(isAttributionEmpty(fields)).toBe(true);
    });
  });

  describe("persistAttribution / loadStoredAttribution", () => {
    it("writes to localStorage and reads back", () => {
      const fields = readAttributionFromUrl(
        "https://sortyourlife.fr/?utm_source=meta",
        null,
      );
      const stored = persistAttribution(fields, 1000);
      expect(stored?.utmSource).toBe("meta");
      expect(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY)).not.toBeNull();

      const loaded = loadStoredAttribution(1000);
      expect(loaded?.utmSource).toBe("meta");
      expect(loaded?.capturedAt).toBe(1000);
    });

    it("does not store empty attribution", () => {
      persistAttribution(
        {
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          utmContent: null,
          utmTerm: null,
          referrer: null,
          landingPath: null,
          gclid: null,
          fbclid: null,
        },
        1000,
      );
      expect(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY)).toBeNull();
    });

    it("first-touch wins — non-empty existing record is kept", () => {
      const first = readAttributionFromUrl(
        "https://sortyourlife.fr/?utm_source=meta",
        null,
      );
      persistAttribution(first, 1000);

      const second = readAttributionFromUrl(
        "https://sortyourlife.fr/?utm_source=google",
        null,
      );
      const result = persistAttribution(second, 2000);
      expect(result?.utmSource).toBe("meta");

      const loaded = loadStoredAttribution(2000);
      expect(loaded?.utmSource).toBe("meta");
      expect(loaded?.capturedAt).toBe(1000);
    });

    it("expires after TTL", () => {
      const fields = readAttributionFromUrl(
        "https://sortyourlife.fr/?utm_source=meta",
        null,
      );
      persistAttribution(fields, 1000);

      const expired = loadStoredAttribution(1000 + ATTRIBUTION_TTL_MS + 1);
      expect(expired).toBeNull();
      expect(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY)).toBeNull();
    });

    it("returns null for malformed JSON in localStorage", () => {
      window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, "{not json");
      expect(loadStoredAttribution()).toBeNull();
    });

    it("clearStoredAttribution wipes the entry", () => {
      const fields = readAttributionFromUrl(
        "https://sortyourlife.fr/?utm_source=meta",
        null,
      );
      persistAttribution(fields);
      clearStoredAttribution();
      expect(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY)).toBeNull();
    });
  });
});
