import type { Metadata } from "next";

/**
 * App name (visible in UI, OG tags, manifest…). Override at build with
 * NEXT_PUBLIC_APP_NAME / NEXT_PUBLIC_APP_SHORT_NAME if you ever rename.
 */
export const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Sort your life";
export const SITE_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME || "Sort";
export const SITE_TAGLINE = "Tes objets, les bonnes mains.";

/** SEO description (~155 chars). */
export const SITE_DESCRIPTION =
  "Trier, photographier et répartir les objets d’un débarras, déménagement ou héritage en famille. Tes proches votent sur un lien, tu attribues à la fin.";

/** SEO title appended on the home page. */
export const SITE_HEADLINE_FR = "Répartir les objets de la maison en famille";

/** URL publique (OG, partage, sitemap). Override avec NEXT_PUBLIC_SITE_URL. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  process.env.AUTH_URL?.replace(/\/$/, "") ||
  "https://sortyourlife.fr";

export const SITE_LOCALE = "fr_FR";

/** Google Search Console verification (optional). */
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;

/** Public source repository — surfaced in the home footer. */
export const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/O-Plums/sort-your-life";

export const LOGO_PATH = "/logo.png";
export const OG_IMAGE_PATH = "/logo.png";
export const PWA_ICONS = {
  icon192: "/icons/icon-192.png",
  icon512: "/icons/icon-512.png",
  maskable512: "/icons/icon-maskable-512.png",
  apple: "/icons/apple-touch-icon.png",
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).toString();
}

const ogImage = {
  url: OG_IMAGE_PATH,
  width: 1024,
  height: 1024,
  alt: SITE_NAME,
};

export const SEO_KEYWORDS = [
  "débarras maison",
  "vider appartement",
  "déménagement objets",
  "succession héritage partage",
  "liste partagée famille",
  "application répartir objets",
  "don meubles",
  "vente objets occasion",
  "inventaire maison",
  "qui prend quoi",
];

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_HEADLINE_FR}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: SEO_KEYWORDS,
  category: "lifestyle",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: PWA_ICONS.icon192, sizes: "192x192", type: "image/png" },
      { url: PWA_ICONS.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: PWA_ICONS.apple, sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_HEADLINE_FR}`,
    description: SITE_DESCRIPTION,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_HEADLINE_FR}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  appleWebApp: {
    capable: true,
    title: SITE_SHORT_NAME,
    statusBarStyle: "black-translucent",
    startupImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  ...(GOOGLE_SITE_VERIFICATION && {
    verification: { google: GOOGLE_SITE_VERIFICATION },
  }),
};

export function listShareMetadata(listTitle: string, slug: string): Metadata {
  const title = `Vote : ${listTitle}`;
  const description = `Dis oui ou non sur les objets de « ${listTitle} » — ${SITE_TAGLINE}`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/l/${slug}` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/l/${slug}`),
      siteName: SITE_NAME,
      type: "website",
      locale: SITE_LOCALE,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
  };
}

/** JSON-LD for the home page (SoftwareApplication + Organization). */
export function homeJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: ["fr-FR", "en"],
      description: SITE_DESCRIPTION,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl(LOGO_PATH),
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web, iOS, Android (PWA)",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
    },
  ];
}
