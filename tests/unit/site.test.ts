import { describe, expect, it } from "vitest";
import { SITE_NAME, SITE_URL, absoluteUrl, homeJsonLd } from "@/lib/site";

describe("site", () => {
  describe("absoluteUrl", () => {
    it("builds a URL on top of SITE_URL when given an absolute path", () => {
      const url = absoluteUrl("/foo");
      expect(url.startsWith(SITE_URL)).toBe(true);
      expect(url.endsWith("/foo")).toBe(true);
    });

    it("normalizes paths without a leading slash", () => {
      expect(absoluteUrl("foo")).toBe(absoluteUrl("/foo"));
    });

    it("is a valid URL", () => {
      expect(() => new URL(absoluteUrl("/dashboard"))).not.toThrow();
    });
  });

  describe("homeJsonLd", () => {
    it("returns WebSite, Organization and SoftwareApplication entries", () => {
      const ld = homeJsonLd();
      expect(ld).toHaveLength(3);

      const types = ld.map((entry) => entry["@type"]);
      expect(types).toEqual(["WebSite", "Organization", "SoftwareApplication"]);
    });

    it("uses SITE_NAME consistently across entries", () => {
      const ld = homeJsonLd();
      for (const entry of ld) {
        expect((entry as { name: string }).name).toBe(SITE_NAME);
      }
    });

    it("declares the app as free (price 0 EUR)", () => {
      const app = homeJsonLd().find((e) => e["@type"] === "SoftwareApplication") as {
        offers: { price: string; priceCurrency: string };
      };
      expect(app.offers.price).toBe("0");
      expect(app.offers.priceCurrency).toBe("EUR");
    });
  });
});
