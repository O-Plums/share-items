import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalDocument, type LegalSection } from "../LegalDocument";
import { interpolateLegal, legalVars } from "@/lib/legal";

/**
 * IMPORTANT: legal strings contain `{appName}`, `{email}`, `{lastUpdated}`
 * placeholders which collide with next-intl's ICU syntax. We deliberately
 * read every string via `t.raw()` to bypass ICU parsing and apply our own
 * `interpolateLegal()` downstream.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.cgu");
  const vars = legalVars();
  return {
    title: interpolateLegal(t.raw("title") as string, vars),
    description: interpolateLegal(t.raw("subtitle") as string, vars),
    alternates: { canonical: "/legal/cgu" },
  };
}

export default async function CguPage() {
  const t = await getTranslations("legal.cgu");
  const tCommon = await getTranslations("legal.common");

  return (
    <LegalDocument
      title={t.raw("title") as string}
      subtitle={t.raw("subtitle") as string}
      sections={t.raw("sections") as LegalSection[]}
      altHref="/legal/cgv"
      translations={{
        back: tCommon.raw("back") as string,
        lastUpdated: tCommon.raw("lastUpdated") as string,
        noticeMissing: tCommon.raw("noticeMissing") as string,
        seeAlsoLabel: tCommon.raw("seeAlso") as string,
        altLinkLabel: tCommon.raw("cguLink") as string,
      }}
    />
  );
}
