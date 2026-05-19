import type { Metadata } from "next";

export const SITE_NAME = "Share Items";
export const SITE_SHORT_NAME = "Share";
export const SITE_TAGLINE = "Tes objets, les bonnes mains.";
export const SITE_DESCRIPTION =
  "Photographie ce dont tu veux te débarrasser, fais dire à ta famille ce qui l’intéresse, et attribue chaque objet à la bonne personne.";

/** URL publique (OG, partage). Définir NEXT_PUBLIC_SITE_URL ou AUTH_URL en prod. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  process.env.AUTH_URL?.replace(/\/$/, "") ||
  "https://share-items.vercel.app";

export const LOGO_PATH = "/logo.png";
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
  url: LOGO_PATH,
  width: 1024,
  height: 1024,
  alt: SITE_NAME,
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  keywords: [
    "débarras",
    "don",
    "vente",
    "objets",
    "vote",
    "liste",
    "partage",
  ],
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
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [LOGO_PATH],
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
};

export function listShareMetadata(listTitle: string, slug: string): Metadata {
  const title = `Vote : ${listTitle}`;
  const description = `Dis oui ou non sur les objets de « ${listTitle} » — ${SITE_TAGLINE}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/l/${slug}`),
      siteName: SITE_NAME,
      type: "website",
      locale: "fr_FR",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [LOGO_PATH],
    },
  };
}
