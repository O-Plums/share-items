import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { SerwistProvider } from "@serwist/next/react";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { IdentityProvider } from "@/lib/identity";
import { AttributionCapture } from "@/components/AttributionCapture";
import { rootMetadata } from "@/lib/site";

export const metadata = rootMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f43568" },
    { media: "(prefers-color-scheme: dark)", color: "#f43568" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === "development"}>
            <Providers>
              <IdentityProvider>{children}</IdentityProvider>
            </Providers>
          </SerwistProvider>
        </NextIntlClientProvider>
        <AttributionCapture />
        <Analytics />
      </body>
    </html>
  );
}
