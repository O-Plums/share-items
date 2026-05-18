import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-access";
import { AppLogo } from "@/components/AppLogo";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard/lists");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white safe-top">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <AppLogo size={36} href="/" />
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-brand-500">Admin</p>
              <p className="text-sm font-semibold text-neutral-900">Share Items</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/dashboard/lists" className="text-neutral-600 hover:text-brand-500">
              Dashboard
            </Link>
            <span className="hidden text-neutral-400 sm:inline">{session.user.email}</span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-6">{children}</div>
    </div>
  );
}
