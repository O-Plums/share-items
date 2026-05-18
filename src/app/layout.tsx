import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { IdentityProvider } from "@/lib/identity";
import { rootMetadata } from "@/lib/site";

export const metadata = rootMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f43568",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <Providers>
          <IdentityProvider>{children}</IdentityProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
