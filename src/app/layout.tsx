import type { Viewport } from "next";
import { SerwistProvider } from "@serwist/next/react";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { IdentityProvider } from "@/lib/identity";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === "development"}>
          <Providers>
            <IdentityProvider>{children}</IdentityProvider>
          </Providers>
        </SerwistProvider>
        <Analytics />
      </body>
    </html>
  );
}
