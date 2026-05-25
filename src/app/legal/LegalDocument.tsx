import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import { interpolateLegal, legalVars } from "@/lib/legal";

export type LegalSection = {
  title: string;
  body: string;
};

type Translations = {
  back: string;
  lastUpdated: string;
  noticeMissing: string;
  seeAlsoLabel: string;
  altLinkLabel: string;
};

type Props = {
  title: string;
  subtitle: string;
  sections: LegalSection[];
  altHref: "/legal/cgu" | "/legal/cgv";
  translations: Translations;
};

/**
 * Pure presentation. The variables {owner}, {email}, {appName}, {siteUrl},
 * {lastUpdated} are interpolated server-side from `legalVars()` so legal pages
 * can be rendered statically and crawled.
 */
export function LegalDocument({
  title,
  subtitle,
  sections,
  altHref,
  translations,
}: Props) {
  const vars = legalVars();
  const interp = (s: string) => interpolateLegal(s, vars);

  return (
    <article className="space-y-6">
      <BackButton href="/">{translations.back}</BackButton>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">{interp(title)}</h1>
        <p className="text-neutral-600">{interp(subtitle)}</p>
        <p className="text-xs text-neutral-500">
          {interp(translations.lastUpdated)}
        </p>
      </header>

      <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
        {interp(translations.noticeMissing)}
      </div>

      <section className="space-y-6">
        {sections.map((section, idx) => (
          <section key={idx} className="space-y-2">
            <h2 className="text-lg font-semibold text-neutral-900">
              {interp(section.title)}
            </h2>
            <Body text={interp(section.body)} />
          </section>
        ))}
      </section>

      <footer className="border-t border-neutral-200 pt-4 text-sm text-neutral-600">
        <p>
          {translations.seeAlsoLabel} :{" "}
          <Link
            href={altHref}
            className="font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            {translations.altLinkLabel}
          </Link>
        </p>
      </footer>
    </article>
  );
}

function Body({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-neutral-800">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {p}
        </p>
      ))}
    </div>
  );
}
