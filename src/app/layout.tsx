import type { Metadata, Viewport } from "next";
import "./globals.css";
import { IdentityProvider } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Share Items",
  description: "Partage et fais voter sur les objets dont tu veux te débarrasser.",
};

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
        <IdentityProvider>{children}</IdentityProvider>
      </body>
    </html>
  );
}
