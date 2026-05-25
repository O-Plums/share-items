import type { Metadata } from "next";
import { AppLogo } from "@/components/AppLogo";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-50 pb-20 safe-top safe-bottom">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-5 py-3">
          <AppLogo size={32} href="/" />
        </div>
      </header>
      <div className="mx-auto w-full max-w-2xl px-5 pt-6">{children}</div>
    </main>
  );
}
